export interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  yesPrice: number;
  noPrice: number;
  totalVolume: number;
  endTime: string;
  isLive: boolean;
  oracleSources: OracleSource[];
  resolved: boolean;
  resolvedOutcome?: "YES" | "NO";
}

export interface OracleSource {
  name: string;
  result: "YES" | "NO" | "PENDING";
  confidence: number;
}

export interface LeaderboardEntry {
  rank: number;
  address: string;
  totalTrades: number;
  winRate: number;
  profit: number;
}

export const initialMarkets: Market[] = [
  {
    id: "btc-100k",
    title: "Will BTC hit $120K before July 2025?",
    description: "This market resolves YES if Bitcoin reaches or exceeds $120,000 USD on any major exchange (Binance, Coinbase, Kraken) before July 1, 2025 00:00 UTC. Price must be sustained for at least 1 minute on the order book.",
    category: "Crypto",
    yesPrice: 0.50,
    noPrice: 0.50,
    totalVolume: 284500,
    endTime: "2025-07-01T00:00:00Z",
    isLive: true,
    oracleSources: [
      { name: "Chainlink Price Feed", result: "YES", confidence: 95 },
      { name: "Pyth Network", result: "YES", confidence: 92 },
      { name: "API3 dAPI", result: "NO", confidence: 88 },
    ],
    resolved: false,
  },
  {
    id: "eth-etf",
    title: "Will Ethereum ETF AUM exceed $50B by Q3 2025?",
    description: "This market resolves YES if the combined Assets Under Management (AUM) of all spot Ethereum ETFs approved in the United States exceeds $50 billion USD by September 30, 2025. Data sourced from Bloomberg Terminal and ETF provider disclosures.",
    category: "DeFi",
    yesPrice: 0.50,
    noPrice: 0.50,
    totalVolume: 156200,
    endTime: "2025-09-30T00:00:00Z",
    isLive: true,
    oracleSources: [
      { name: "Bloomberg Terminal", result: "NO", confidence: 97 },
      { name: "SEC EDGAR Filing", result: "NO", confidence: 90 },
      { name: "CoinGlass Analytics", result: "NO", confidence: 85 },
    ],
    resolved: false,
  },
  {
    id: "algo-governance",
    title: "Will Algorand TVL exceed $500M in 2025?",
    description: "This market resolves YES if the Total Value Locked (TVL) in the Algorand ecosystem exceeds $500 million USD at any point before December 31, 2025, as reported by DeFiLlama. All protocols on Algorand mainnet are included.",
    category: "Algorand",
    yesPrice: 0.50,
    noPrice: 0.50,
    totalVolume: 98750,
    endTime: "2025-12-31T00:00:00Z",
    isLive: true,
    oracleSources: [
      { name: "DeFiLlama API", result: "YES", confidence: 93 },
      { name: "Algorand Indexer", result: "YES", confidence: 91 },
      { name: "Vestige Analytics", result: "YES", confidence: 87 },
    ],
    resolved: false,
  },
];

export const leaderboardData: LeaderboardEntry[] = [
  { rank: 1, address: "ALGO...X7K2", totalTrades: 342, winRate: 78.5, profit: 12450 },
  { rank: 2, address: "ALGO...M9P4", totalTrades: 289, winRate: 72.1, profit: 9830 },
  { rank: 3, address: "ALGO...Q3R8", totalTrades: 256, winRate: 69.8, profit: 8120 },
  { rank: 4, address: "ALGO...T5W1", totalTrades: 198, winRate: 67.3, profit: 6540 },
  { rank: 5, address: "ALGO...J8N6", totalTrades: 167, winRate: 65.9, profit: 5210 },
  { rank: 6, address: "ALGO...F2L0", totalTrades: 145, winRate: 63.2, profit: 4380 },
  { rank: 7, address: "ALGO...H4V3", totalTrades: 134, winRate: 61.7, profit: 3750 },
  { rank: 8, address: "ALGO...B6Y9", totalTrades: 112, winRate: 59.4, profit: 2890 },
  { rank: 9, address: "ALGO...D1S5", totalTrades: 98, winRate: 57.8, profit: 2140 },
  { rank: 10, address: "ALGO...K3A7", totalTrades: 87, winRate: 55.2, profit: 1670 },
];
