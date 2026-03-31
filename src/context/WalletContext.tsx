import { createContext, useContext, useState, ReactNode } from "react";

interface WalletState {
  connected: boolean;
  address: string;
  balance: number;
  network: string;
  portfolioValue: number;
  openPositions: number;
  connect: () => void;
  disconnect: () => void;
}

const WalletContext = createContext<WalletState | null>(null);

export const useWallet = () => {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error("useWallet must be inside WalletProvider");
  return ctx;
};

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [connected, setConnected] = useState(false);

  const connect = () => setConnected(true);
  const disconnect = () => setConnected(false);

  return (
    <WalletContext.Provider
      value={{
        connected,
        address: "ALGO7X...K2M9QR4T5W1J8N6F2",
        balance: 1_247.83,
        network: "Algorand Testnet",
        portfolioValue: 3_842.50,
        openPositions: 5,
        connect,
        disconnect,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};
