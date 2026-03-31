import { useCallback } from "react";
import algosdk from "algosdk";
import {
  getAlgodClient,
  getSuggestedParams,
  waitForConfirmation,
  readAppGlobalState,
  readAppLocalState,
} from "@/algorand/client";
import { ALGORAND_CONFIG } from "@/algorand/config";

export interface OnChainMarketState {
  yesPool: number;
  noPool: number;
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  resolved: boolean;
  resolvedOutcome: string | null;
}

export interface OnChainUserPosition {
  yesStake: number;
  noStake: number;
  claimed: boolean;
}

export interface PlaceBetResult {
  txId: string;
  confirmedRound: number;
}

/**
 * Hook for interacting with the Algorand prediction market smart contract.
 *
 * When the smart contract is deployed, replace the placeholder app IDs
 * in algorand/config.ts and uncomment the on-chain logic below.
 *
 * For the hackathon demo, this falls back to Supabase for market state
 * while the transaction signing flow uses real Pera Wallet.
 */
export function useMarketContract() {
  /**
   * Place a bet by sending an atomic transaction group:
   *   1. ALGO payment transaction (stake)
   *   2. Application call with args [marketId, side, amount]
   */
  const placeBet = useCallback(
    async (
      senderAddress: string,
      marketId: string,
      side: "YES" | "NO",
      amountAlgo: number,
      signTransactions: (txnGroups: Uint8Array[][]) => Promise<Uint8Array[]>
    ): Promise<PlaceBetResult> => {
      const algod = getAlgodClient();
      const suggestedParams = await getSuggestedParams();
      const appId = ALGORAND_CONFIG.MARKET_APP_IDS[marketId] || 0;
      const amountMicroAlgo = Math.floor(amountAlgo * 1e6);

      if (appId > 0) {
        // ── Real on-chain flow ──
        // 1. Payment txn: user → app address
        const appAddr = algosdk.getApplicationAddress(appId);
        const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: appAddr,
          amount: amountMicroAlgo,
          suggestedParams,
        });

        // 2. App call txn
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          sender: senderAddress,
          appIndex: appId,
          appArgs: [
            new TextEncoder().encode("place_bet"),
            new TextEncoder().encode(side),
            algosdk.encodeUint64(amountMicroAlgo),
          ],
          suggestedParams,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
        });

        // Group them atomically
        algosdk.assignGroupID([payTxn, appCallTxn]);

        const encodedTxns = [payTxn.toByte(), appCallTxn.toByte()];
        const signedTxns = await signTransactions([encodedTxns]);

        const { txId } = await algod.sendRawTransaction(signedTxns).do();
        const result = await waitForConfirmation(txId);

        return {
          txId,
          confirmedRound: Number(result.confirmedRound),
        };
      } else {
        // ── Demo fallback: sign a real payment to self as proof of concept ──
        const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: senderAddress, // self-transfer for demo
          amount: 0, // zero-amount for demo
          note: new TextEncoder().encode(
            JSON.stringify({ app: "QuickCast", market: marketId, side, amount: amountAlgo })
          ),
          suggestedParams,
        });

        const encodedTxns = [payTxn.toByte()];
        const signedTxns = await signTransactions([encodedTxns]);

        const { txId } = await algod.sendRawTransaction(signedTxns).do();
        const result = await waitForConfirmation(txId);

        return {
          txId,
          confirmedRound: Number(result.confirmedRound),
        };
      }
    },
    []
  );

  /**
   * Claim reward from a resolved market
   */
  const claimReward = useCallback(
    async (
      senderAddress: string,
      marketId: string,
      signTransactions: (txnGroups: Uint8Array[][]) => Promise<Uint8Array[]>
    ): Promise<PlaceBetResult> => {
      const algod = getAlgodClient();
      const suggestedParams = await getSuggestedParams();
      const appId = ALGORAND_CONFIG.MARKET_APP_IDS[marketId] || 0;

      if (appId > 0) {
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          sender: senderAddress,
          appIndex: appId,
          appArgs: [new TextEncoder().encode("claim_reward")],
          suggestedParams,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
        });

        const encodedTxns = [appCallTxn.toByte()];
        const signedTxns = await signTransactions([encodedTxns]);

        const { txId } = await algod.sendRawTransaction(signedTxns).do();
        const result = await waitForConfirmation(txId);

        return {
          txId,
          confirmedRound: Number(result.confirmedRound),
        };
      } else {
        // Demo fallback
        const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: senderAddress,
          amount: 0,
          note: new TextEncoder().encode(
            JSON.stringify({ app: "QuickCast", action: "claim", market: marketId })
          ),
          suggestedParams,
        });

        const encodedTxns = [payTxn.toByte()];
        const signedTxns = await signTransactions([encodedTxns]);

        const { txId } = await algod.sendRawTransaction(signedTxns).do();
        const result = await waitForConfirmation(txId);

        return {
          txId,
          confirmedRound: Number(result.confirmedRound),
        };
      }
    },
    []
  );

  /**
   * Resolve a market (oracle/admin only)
   */
  const resolveMarket = useCallback(
    async (
      senderAddress: string,
      marketId: string,
      outcome: "YES" | "NO",
      signTransactions: (txnGroups: Uint8Array[][]) => Promise<Uint8Array[]>
    ): Promise<PlaceBetResult> => {
      const algod = getAlgodClient();
      const suggestedParams = await getSuggestedParams();
      const appId = ALGORAND_CONFIG.MARKET_APP_IDS[marketId] || 0;

      if (appId > 0) {
        const appCallTxn = algosdk.makeApplicationCallTxnFromObject({
          sender: senderAddress,
          appIndex: appId,
          appArgs: [
            new TextEncoder().encode("resolve"),
            new TextEncoder().encode(outcome),
          ],
          suggestedParams,
          onComplete: algosdk.OnApplicationComplete.NoOpOC,
        });

        const encodedTxns = [appCallTxn.toByte()];
        const signedTxns = await signTransactions([encodedTxns]);

        const { txId } = await algod.sendRawTransaction(signedTxns).do();
        const result = await waitForConfirmation(txId);

        return { txId, confirmedRound: Number(result.confirmedRound) };
      } else {
        throw new Error("Market contract not deployed yet");
      }
    },
    []
  );

  /**
   * Fetch market state from on-chain global state
   */
  const fetchMarketState = useCallback(
    async (marketId: string): Promise<OnChainMarketState | null> => {
      const appId = ALGORAND_CONFIG.MARKET_APP_IDS[marketId] || 0;
      if (appId === 0) return null;

      const state = await readAppGlobalState(appId);

      const yesPool = (state.get("yes_pool") || 0) / 1e6;
      const noPool = (state.get("no_pool") || 0) / 1e6;
      const totalPool = yesPool + noPool;

      return {
        yesPool,
        noPool,
        yesPrice: totalPool > 0 ? yesPool / totalPool : 0.5,
        noPrice: totalPool > 0 ? noPool / totalPool : 0.5,
        totalVolume: (state.get("total_volume") || 0) / 1e6,
        resolved: (state.get("resolved") || 0) === 1,
        resolvedOutcome: state.get("resolved_outcome")
          ? new TextDecoder().decode(state.get("resolved_outcome"))
          : null,
      };
    },
    []
  );

  /**
   * Fetch user's position from on-chain local state or boxes
   */
  const fetchUserPosition = useCallback(
    async (
      marketId: string,
      address: string
    ): Promise<OnChainUserPosition | null> => {
      const appId = ALGORAND_CONFIG.MARKET_APP_IDS[marketId] || 0;
      if (appId === 0) return null;

      const state = await readAppLocalState(appId, address);

      return {
        yesStake: (state.get("yes_stake") || 0) / 1e6,
        noStake: (state.get("no_stake") || 0) / 1e6,
        claimed: (state.get("claimed") || 0) === 1,
      };
    },
    []
  );

  return {
    placeBet,
    claimReward,
    resolveMarket,
    fetchMarketState,
    fetchUserPosition,
  };
}
