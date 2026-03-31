import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useUserBets, type DbBet } from "@/hooks/useSupabaseBets";
import { useSupabaseBalance } from "@/hooks/useSupabaseBalance";
import { toast } from "sonner";

interface WalletState {
  connected: boolean;
  address: string;
  algoBalance: number;
  inrBalance: number;
  network: string;
  portfolioValue: number;
  openPositions: number;
  bets: DbBet[];
  connect: () => Promise<void>;
  disconnect: () => void;
  placeTrade: (marketId: string, side: "YES" | "NO", amount: number, price: number) => Promise<boolean>;
  claimMarketReward: (marketId: string, outcome: "YES" | "NO", rewardAmount: number) => Promise<string>;
  addFunds: (inrAmount: number) => Promise<boolean>;
  withdrawFunds: (algoAmount: number) => Promise<boolean>;
  refetchBalance: () => Promise<void>;
}

const MOCK_INR_TO_ALGO = 0.0012; // 1 INR ≈ 0.0012 ALGO (mock)
const MOCK_ALGO_TO_INR = 1 / MOCK_INR_TO_ALGO;

const WalletContext = createContext<WalletState | null>(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
};

function generateWalletAddress(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let addr = "ALGO";
  for (let i = 0; i < 54; i++) {
    addr += chars[Math.floor(Math.random() * chars.length)];
  }
  return addr;
}

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");

  const { bets, refetchBets } = useUserBets(connected ? address : null);
  const { balance, refetchBalance } = useSupabaseBalance(connected ? address : null);

  const connect = useCallback(async () => {
    // Check if we have a stored address in sessionStorage
    let walletAddr = sessionStorage.getItem("qc_wallet_address");
    if (!walletAddr) {
      walletAddr = generateWalletAddress();
      sessionStorage.setItem("qc_wallet_address", walletAddr);
    }

    // Upsert profile
    await supabase.from("profiles").upsert(
      { wallet_address: walletAddr },
      { onConflict: "wallet_address" }
    );

    // Upsert demo balance (only inserts if not exists)
    const { data: existingBal } = await supabase
      .from("demo_balances")
      .select("wallet_address")
      .eq("wallet_address", walletAddr)
      .single();

    if (!existingBal) {
      await supabase.from("demo_balances").insert({
        wallet_address: walletAddr,
        algo_balance: 1000,
        inr_balance: 50000,
      });
    }

    setAddress(walletAddr);
    setConnected(true);
  }, []);

  const disconnect = useCallback(() => {
    setConnected(false);
    setAddress("");
  }, []);

  const placeTrade = useCallback(async (
    marketId: string,
    side: "YES" | "NO",
    amount: number,
    price: number
  ): Promise<boolean> => {
    if (amount <= 0 || amount > balance.algo_balance) return false;

    // Insert bet
    const { error: betError } = await supabase.from("bets").insert({
      wallet_address: address,
      market_id: marketId,
      side,
      amount,
      price,
    });
    if (betError) {
      console.error("Bet insert error:", betError);
      return false;
    }

    // Update balance
    const newAlgo = parseFloat((balance.algo_balance - amount).toFixed(2));
    await supabase
      .from("demo_balances")
      .update({ algo_balance: newAlgo })
      .eq("wallet_address", address);

    // Update market pools and prices
    const delta = 0.02;
    const { data: market } = await supabase.from("markets").select("*").eq("id", marketId).single();
    if (market) {
      const newYesPrice = side === "YES"
        ? Math.min(0.90, parseFloat((Number(market.yes_price) + delta).toFixed(2)))
        : Math.max(0.10, parseFloat((Number(market.yes_price) - delta).toFixed(2)));
      const newNoPrice = side === "NO"
        ? Math.min(0.90, parseFloat((Number(market.no_price) + delta).toFixed(2)))
        : Math.max(0.10, parseFloat((Number(market.no_price) - delta).toFixed(2)));
      const newYesPool = side === "YES" ? Number(market.yes_pool) + amount : Number(market.yes_pool);
      const newNoPool = side === "NO" ? Number(market.no_pool) + amount : Number(market.no_pool);
      const newVolume = Number(market.total_volume) + amount * 100;

      await supabase.from("markets").update({
        yes_price: newYesPrice,
        no_price: newNoPrice,
        yes_pool: newYesPool,
        no_pool: newNoPool,
        total_volume: newVolume,
      }).eq("id", marketId);
    }

    await refetchBalance();
    await refetchBets();
    return true;
  }, [address, balance.algo_balance, refetchBalance, refetchBets]);

  const claimMarketReward = useCallback(async (
    marketId: string,
    outcome: "YES" | "NO",
    rewardAmount: number
  ): Promise<string> => {
    const txHash = "TXID" + Math.random().toString(36).substring(2, 10).toUpperCase() + "...ALGO";

    // Insert claim
    await supabase.from("claims").insert({
      wallet_address: address,
      market_id: marketId,
      reward_amount: rewardAmount,
      tx_hash: txHash,
    });

    // Mark bets as claimed
    await supabase
      .from("bets")
      .update({ claimed: true })
      .eq("wallet_address", address)
      .eq("market_id", marketId)
      .eq("side", outcome)
      .eq("claimed", false);

    // Add reward to balance
    const newAlgo = parseFloat((balance.algo_balance + rewardAmount).toFixed(2));
    await supabase
      .from("demo_balances")
      .update({ algo_balance: newAlgo })
      .eq("wallet_address", address);

    await refetchBalance();
    await refetchBets();
    return txHash;
  }, [address, balance.algo_balance, refetchBalance, refetchBets]);

  const addFunds = useCallback(async (inrAmount: number): Promise<boolean> => {
    if (inrAmount <= 0 || inrAmount > balance.inr_balance) return false;
    const algoToAdd = parseFloat((inrAmount * MOCK_INR_TO_ALGO).toFixed(4));
    const newAlgo = parseFloat((balance.algo_balance + algoToAdd).toFixed(4));
    const newInr = parseFloat((balance.inr_balance - inrAmount).toFixed(2));

    await supabase.from("demo_balances").update({
      algo_balance: newAlgo,
      inr_balance: newInr,
    }).eq("wallet_address", address);

    await refetchBalance();
    return true;
  }, [address, balance, refetchBalance]);

  const withdrawFunds = useCallback(async (algoAmount: number): Promise<boolean> => {
    if (algoAmount <= 0 || algoAmount > balance.algo_balance) return false;
    const inrToAdd = parseFloat((algoAmount * MOCK_ALGO_TO_INR).toFixed(2));
    const newAlgo = parseFloat((balance.algo_balance - algoAmount).toFixed(4));
    const newInr = parseFloat((balance.inr_balance + inrToAdd).toFixed(2));

    await supabase.from("demo_balances").update({
      algo_balance: newAlgo,
      inr_balance: newInr,
    }).eq("wallet_address", address);

    await refetchBalance();
    return true;
  }, [address, balance, refetchBalance]);

  const openPositions = bets.filter((b) => !b.claimed).length;
  const activeStake = bets.filter((b) => !b.claimed).reduce((s, b) => s + b.amount, 0);
  const portfolioValue = parseFloat((balance.algo_balance + activeStake).toFixed(2));

  return (
    <WalletContext.Provider
      value={{
        connected,
        address,
        algoBalance: balance.algo_balance,
        inrBalance: balance.inr_balance,
        network: "Algorand Testnet",
        portfolioValue,
        openPositions,
        bets,
        connect,
        disconnect,
        placeTrade,
        claimMarketReward,
        addFunds,
        withdrawFunds,
        refetchBalance,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
