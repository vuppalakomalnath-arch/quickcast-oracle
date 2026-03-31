import { createContext, useContext, useMemo, useState, ReactNode } from "react";

export interface UserBet {
  marketId: string;
  side: "YES" | "NO";
  amount: number;
  price: number;
  claimed: boolean;
}

interface WalletState {
  connected: boolean;
  address: string;
  balance: number;
  network: string;
  portfolioValue: number;
  openPositions: number;
  bets: UserBet[];
  connect: () => void;
  disconnect: () => void;
  placeTrade: (marketId: string, side: "YES" | "NO", amount: number, price: number) => boolean;
  claimMarketReward: (marketId: string, outcome: "YES" | "NO", rewardAmount: number) => void;
}

const WalletContext = createContext<WalletState | null>(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);
  const [balance, setBalance] = useState(1247.83);
  const [bets, setBets] = useState<UserBet[]>([]);

  const connect = () => setConnected(true);

  const disconnect = () => {
    setConnected(false);
  };

  const placeTrade = (
    marketId: string,
    side: "YES" | "NO",
    amount: number,
    price: number
  ) => {
    if (amount <= 0) return false;
    if (amount > balance) return false;

    setBalance((prev) => parseFloat((prev - amount).toFixed(2)));

    setBets((prev) => [
      ...prev,
      {
        marketId,
        side,
        amount,
        price,
        claimed: false,
      },
    ]);

    return true;
  };

  const claimMarketReward = (
    marketId: string,
    outcome: "YES" | "NO",
    rewardAmount: number
  ) => {
    setBalance((prev) => parseFloat((prev + rewardAmount).toFixed(2)));

    setBets((prev) =>
      prev.map((bet) =>
        bet.marketId === marketId && bet.side === outcome && !bet.claimed
          ? { ...bet, claimed: true }
          : bet
      )
    );
  };

  const openPositions = useMemo(() => {
    return bets.filter((bet) => !bet.claimed).length;
  }, [bets]);

  const portfolioValue = useMemo(() => {
    const activeStake = bets
      .filter((bet) => !bet.claimed)
      .reduce((sum, bet) => sum + bet.amount, 0);

    return parseFloat((balance + activeStake).toFixed(2));
  }, [balance, bets]);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address: "ALGO7X...K2M9QR4T5W1J8N6F2",
        balance,
        network: "Algorand Testnet",
        portfolioValue,
        openPositions,
        bets,
        connect,
        disconnect,
        placeTrade,
        claimMarketReward,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
