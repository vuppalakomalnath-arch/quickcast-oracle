// Algorand network configuration
export const ALGORAND_CONFIG = {
  // Testnet node (AlgoNode free public API)
  algodServer: "https://testnet-api.algonode.cloud",
  algodPort: 443,
  algodToken: "",

  // Testnet indexer
  indexerServer: "https://testnet-idx.algonode.cloud",
  indexerPort: 443,
  indexerToken: "",

  // Network
  network: "testnet" as const,
  chainId: 416002,

  // Smart contract app IDs (replace with deployed app IDs)
  // These are placeholder IDs for the hackathon demo
  MARKET_APP_IDS: {
    "btc-100k": 0, // Replace with actual app ID after deploying
    "eth-merge": 0,
    "india-gdp": 0,
  } as Record<string, number>,

  // Mock INR conversion (display only)
  ALGO_TO_INR: 833.33,
  INR_TO_ALGO: 0.0012,
} as const;

// ABI method selectors for the prediction market contract
export const CONTRACT_METHODS = {
  placeBet: "place_bet",
  claimReward: "claim_reward",
  resolveMarket: "resolve_market",
  getMarketState: "get_market_state",
} as const;
