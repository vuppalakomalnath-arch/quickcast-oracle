import algosdk from "algosdk";
import { ALGORAND_CONFIG } from "./config";

let algodClient: algosdk.Algodv2 | null = null;

export function getAlgodClient(): algosdk.Algodv2 {
  if (!algodClient) {
    algodClient = new algosdk.Algodv2(
      ALGORAND_CONFIG.algodToken,
      ALGORAND_CONFIG.algodServer,
      ALGORAND_CONFIG.algodPort
    );
  }
  return algodClient;
}

/**
 * Fetch on-chain ALGO balance for an address (in microAlgos → ALGO)
 */
export async function getAccountBalance(address: string): Promise<number> {
  try {
    const algod = getAlgodClient();
    const accountInfo = await algod.accountInformation(address).do();
    return Number(accountInfo.amount) / 1e6;
  } catch (err) {
    console.error("Failed to fetch account balance:", err);
    return 0;
  }
}

/**
 * Get suggested transaction params
 */
export async function getSuggestedParams(): Promise<algosdk.SuggestedParams> {
  const algod = getAlgodClient();
  return await algod.getTransactionParams().do();
}

/**
 * Wait for transaction confirmation
 */
export async function waitForConfirmation(
  txId: string,
  rounds = 4
): Promise<algosdk.modelsv2.PendingTransactionResponse> {
  const algod = getAlgodClient();
  return await algosdk.waitForConfirmation(algod, txId, rounds);
}

/**
 * Read application global state
 */
export async function readAppGlobalState(
  appId: number
): Promise<Map<string, any>> {
  if (appId === 0) return new Map();

  try {
    const algod = getAlgodClient();
    const appInfo = await algod.getApplicationByID(appId).do();
    const state = new Map<string, any>();

    const globalState = appInfo.params?.globalState;
    if (globalState) {
      for (const kv of globalState) {
        const key = new TextDecoder().decode(
          typeof kv.key === "string" ? Uint8Array.from(atob(kv.key), c => c.charCodeAt(0)) : kv.key
        );
        if (kv.value.type === 1) {
          state.set(key, kv.value.bytes);
        } else {
          state.set(key, Number(kv.value.uint));
        }
      }
    }

    return state;
  } catch (err) {
    console.error("Failed to read app state:", err);
    return new Map();
  }
}

/**
 * Read application local state for a specific account
 */
export async function readAppLocalState(
  appId: number,
  address: string
): Promise<Map<string, any>> {
  if (appId === 0) return new Map();

  try {
    const algod = getAlgodClient();
    const accountInfo = await algod.accountInformation(address).do();
    const state = new Map<string, any>();

    const appsLocal = accountInfo.appsLocalState;
    if (appsLocal) {
      const appLocal = appsLocal.find((a: any) => a.id === appId);
      if (appLocal?.keyValue) {
        for (const kv of appLocal.keyValue) {
          const key = new TextDecoder().decode(
            typeof kv.key === "string" ? Uint8Array.from(atob(kv.key), c => c.charCodeAt(0)) : kv.key
          );
          if (kv.value.type === 1) {
            state.set(key, kv.value.bytes);
          } else {
            state.set(key, Number(kv.value.uint));
          }
        }
      }
    }

    return state;
  } catch (err) {
    console.error("Failed to read local state:", err);
    return new Map();
  }
}
