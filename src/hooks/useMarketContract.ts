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

type SignFn = (txns: algosdk.Transaction[]) => Promise<Uint8Array[]>;

/**
 * Hook for interacting with the Algorand prediction market smart contract.
 */
export function useMarketContract() {
  const placeBet = useCallback(
    async (
      senderAddress: string,
      marketId: string,
      side: "YES" | "NO",
      amountAlgo: number,
      signTransactions: SignFn
    ): Promise<PlaceBetResult> => {
      const algod = getAlgodClient();
      const suggestedParams = await getSuggestedParams();
      const appId = ALGORAND_CONFIG.MARKET_APP_IDS[marketId] || 0;
      const amountMicroAlgo = Math.floor(amountAlgo * 1e6);

      if (appId > 0) {
        const appAddr = algosdk.getApplicationAddress(appId);
        const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: appAddr,
          amount: amountMicroAlgo,
          suggestedParams,
        });
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
        algosdk.assignGroupID([payTxn, appCallTxn]);

        const signedTxns = await signTransactions([payTxn, appCallTxn]);
        const response = await algod.sendRawTransaction(signedTxns).do();
        const txId = payTxn.txID();
        const result = await waitForConfirmation(txId);
        return { txId, confirmedRound: Number(result.confirmedRound) };
      } else {
        // Demo: sign a 0-amount self-transfer with note
        const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: senderAddress,
          amount: 0,
          note: new TextEncoder().encode(
            JSON.stringify({ app: "QuickCast", market: marketId, side, amount: amountAlgo })
          ),
          suggestedParams,
        });

        const signedTxns = await signTransactions([payTxn]);
        await algod.sendRawTransaction(signedTxns).do();
        const txId = payTxn.txID();
        const result = await waitForConfirmation(txId);
        return { txId, confirmedRound: Number(result.confirmedRound) };
      }
    },
    []
  );

  const claimReward = useCallback(
    async (
      senderAddress: string,
      marketId: string,
      signTransactions: SignFn
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
        const signedTxns = await signTransactions([appCallTxn]);
        await algod.sendRawTransaction(signedTxns).do();
        const txId = appCallTxn.txID();
        const result = await waitForConfirmation(txId);
        return { txId, confirmedRound: Number(result.confirmedRound) };
      } else {
        const payTxn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
          sender: senderAddress,
          receiver: senderAddress,
          amount: 0,
          note: new TextEncoder().encode(
            JSON.stringify({ app: "QuickCast", action: "claim", market: marketId })
          ),
          suggestedParams,
        });
        const signedTxns = await signTransactions([payTxn]);
        await algod.sendRawTransaction(signedTxns).do();
        const txId = payTxn.txID();
        const result = await waitForConfirmation(txId);
        return { txId, confirmedRound: Number(result.confirmedRound) };
      }
    },
    []
  );

  const resolveMarket = useCallback(
    async (
      senderAddress: string,
      marketId: string,
      outcome: "YES" | "NO",
      signTransactions: SignFn
    ): Promise<PlaceBetResult> => {
      const algod = getAlgodClient();
      const suggestedParams = await getSuggestedParams();
      const appId = ALGORAND_CONFIG.MARKET_APP_IDS[marketId] || 0;

      if (appId === 0) throw new Error("Market contract not deployed yet");

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
      const signedTxns = await signTransactions([appCallTxn]);
      await algod.sendRawTransaction(signedTxns).do();
      const txId = appCallTxn.txID();
      const result = await waitForConfirmation(txId);
      return { txId, confirmedRound: Number(result.confirmedRound) };
    },
    []
  );

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

  const fetchUserPosition = useCallback(
    async (marketId: string, address: string): Promise<OnChainUserPosition | null> => {
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

  return { placeBet, claimReward, resolveMarket, fetchMarketState, fetchUserPosition };
}
