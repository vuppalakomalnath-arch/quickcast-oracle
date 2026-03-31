import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePeraWallet } from "@/hooks/usePeraWallet";
import { useMarketContract, type PlaceBetResult } from "@/hooks/useMarketContract";
import { getAccountBalance } from "@/algorand/client";
import { ALGORAND_CONFIG } from "@/algorand/config";
import { useUserBets, type DbBet } from "@/hooks/useSupabaseBets";
import { toast } from "sonner";

interface WalletState {
  connected: boolean;
  connecting: boolean;
  address: string;
  algoBalance: number;
  inrBalance: number;
  network: string;
  portfolioValue: number;
  openPositions: number;
  bets: DbBet[];
  connect: () => Promise<void>;
  disconnect: () => void;
  placeTrade: (marketId: string, side: "YES" | "NO", amount: number, price: number) => Promise<PlaceBetResult | null>;
  claimMarketReward: (marketId: string, outcome: "YES" | "NO", rewardAmount: number) => Promise<PlaceBetResult | null>;
  refetchBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletState | null>(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const pera = usePeraWallet();
  const contract = useMarketContract();
  const [algoBalance, setAlgoBalance] = useState(0);
  const { bets, refetchBets } = useUserBets(pera.connected ? pera.address : null);

  // Fetch on-chain balance
  const fetchBalance = useCallback(async () => {
    if (!pera.address) {
      setAlgoBalance(0);
      return;
    }
    const bal = await getAccountBalance(pera.address);
    setAlgoBalance(bal);
  }, [pera.address]);

  useEffect(() => {
    fetchBalance();
    // Poll balance every 10s when connected
    if (!pera.connected) return;
    const interval = setInterval(fetchBalance, 10_000);
    return () => clearInterval(interval);
  }, [pera.connected, fetchBalance]);

  const connect = useCallback(async () => {
    const addr = await pera.connect();
    if (addr) {
      // Upsert profile in Supabase for leaderboard tracking
      await supabase.from("profiles").upsert(
        { wallet_address: addr },
        { onConflict: "wallet_address" }
      );
    }
  }, [pera]);

  const disconnect = useCallback(() => {
    pera.disconnect();
    setAlgoBalance(0);
  }, [pera]);

  const placeTrade = useCallback(async (
    marketId: string,
    side: "YES" | "NO",
    amount: number,
    price: number
  ): Promise<PlaceBetResult | null> => {
    if (!pera.connected || !pera.address) return null;

    try {
      // Sign & send on-chain transaction via Pera Wallet
      const result = await contract.placeBet(
        pera.address,
        marketId,
        side,
        amount,
        pera.signTransactions
      );

      // Record bet in Supabase for indexing / leaderboard
      await supabase.from("bets").insert({
        wallet_address: pera.address,
        market_id: marketId,
        side,
        amount,
        price,
      });

      // Update market pools in Supabase
      const delta = 0.02;
      const { data: market } = await supabase.from("markets").select("*").eq("id", marketId).single();
      if (market) {
        const newYesPrice = side === "YES"
          ? Math.min(0.90, parseFloat((Number(market.yes_price) + delta).toFixed(2)))
          : Math.max(0.10, parseFloat((Number(market.yes_price) - delta).toFixed(2)));
        const newNoPrice = side === "NO"
          ? Math.min(0.90, parseFloat((Number(market.no_price) + delta).toFixed(2)))
          : Math.max(0.10, parseFloat((Number(market.no_price) - delta).toFixed(2)));

        await supabase.from("markets").update({
          yes_price: newYesPrice,
          no_price: newNoPrice,
          yes_pool: side === "YES" ? Number(market.yes_pool) + amount : Number(market.yes_pool),
          no_pool: side === "NO" ? Number(market.no_pool) + amount : Number(market.no_pool),
          total_volume: Number(market.total_volume) + amount * 100,
        }).eq("id", marketId);
      }

      await fetchBalance();
      await refetchBets();
      return result;
    } catch (err: any) {
      console.error("Trade failed:", err);
      toast.error("Transaction rejected or failed", {
        description: err?.message || "Please try again",
      });
      return null;
    }
  }, [pera, contract, fetchBalance, refetchBets]);

  const claimMarketReward = useCallback(async (
    marketId: string,
    outcome: "YES" | "NO",
    rewardAmount: number
  ): Promise<PlaceBetResult | null> => {
    if (!pera.connected || !pera.address) return null;

    try {
      const result = await contract.claimReward(
        pera.address,
        marketId,
        pera.signTransactions
      );

      // Record claim in Supabase
      await supabase.from("claims").insert({
        wallet_address: pera.address,
        market_id: marketId,
        reward_amount: rewardAmount,
        tx_hash: result.txId,
      });

      // Mark bets as claimed
      await supabase
        .from("bets")
        .update({ claimed: true })
        .eq("wallet_address", pera.address)
        .eq("market_id", marketId)
        .eq("side", outcome)
        .eq("claimed", false);

      await fetchBalance();
      await refetchBets();
      return result;
    } catch (err: any) {
      console.error("Claim failed:", err);
      toast.error("Claim transaction failed", {
        description: err?.message || "Please try again",
      });
      return null;
    }
  }, [pera, contract, fetchBalance, refetchBets]);

  const inrBalance = parseFloat((algoBalance * ALGORAND_CONFIG.ALGO_TO_INR).toFixed(2));
  const openPositions = bets.filter((b) => !b.claimed).length;
  const activeStake = bets.filter((b) => !b.claimed).reduce((s, b) => s + b.amount, 0);
  const portfolioValue = parseFloat((algoBalance + activeStake).toFixed(2));

  return (
    <WalletContext.Provider
      value={{
        connected: pera.connected,
        connecting: pera.connecting,
        address: pera.address,
        algoBalance,
        inrBalance,
        network: "Algorand Testnet",
        portfolioValue,
        openPositions,
        bets,
        connect,
        disconnect,
        placeTrade,
        claimMarketReward,
        refetchBalance: fetchBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
