import { useCallback, useEffect, useRef, useState } from "react";
import { PeraWalletConnect } from "@perawallet/connect";
import algosdk from "algosdk";

const peraWallet = new PeraWalletConnect({
  chainId: 416002, // Algorand Testnet
});

export interface PeraWalletState {
  connected: boolean;
  address: string;
  connecting: boolean;
  connect: () => Promise<string | null>;
  disconnect: () => void;
  signTransactions: (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>;
}

export function usePeraWallet(): PeraWalletState {
  const [address, setAddress] = useState("");
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const reconnected = useRef(false);

  useEffect(() => {
    if (reconnected.current) return;
    reconnected.current = true;

    peraWallet
      .reconnectSession()
      .then((accounts) => {
        if (accounts.length > 0) {
          setAddress(accounts[0]);
          setConnected(true);
          peraWallet.connector?.on("disconnect", handleDisconnect);
        }
      })
      .catch(() => {});
  }, []);

  const handleDisconnect = useCallback(() => {
    setAddress("");
    setConnected(false);
  }, []);

  const connect = useCallback(async (): Promise<string | null> => {
    setConnecting(true);
    try {
      const accounts = await peraWallet.connect();
      if (accounts.length > 0) {
        setAddress(accounts[0]);
        setConnected(true);
        peraWallet.connector?.on("disconnect", handleDisconnect);
        return accounts[0];
      }
      return null;
    } catch (err: any) {
      if (err?.data?.type !== "CONNECT_MODAL_CLOSED") {
        console.error("Pera Wallet connect error:", err);
      }
      return null;
    } finally {
      setConnecting(false);
    }
  }, [handleDisconnect]);

  const disconnect = useCallback(() => {
    peraWallet.disconnect();
    handleDisconnect();
  }, [handleDisconnect]);

  const signTransactions = useCallback(
    async (txns: algosdk.Transaction[]): Promise<Uint8Array[]> => {
      // Pera expects SignerTransaction format
      const signerTxns = txns.map((txn) => ({ txn }));
      const signedTxns = await peraWallet.signTransaction([signerTxns]);
      return signedTxns;
    },
    []
  );

  return {
    connected,
    address,
    connecting,
    connect,
    disconnect,
    signTransactions,
  };
}
