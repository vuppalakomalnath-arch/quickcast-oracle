import { useMemo } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/LeaderboardTable";
import { useAllBets } from "@/hooks/useSupabaseBets";
import { leaderboardData } from "@/data/mockData";

const Leaderboard = () => {
  const { bets } = useAllBets();

  // Merge mock leaderboard with real bet data
  const liveLeaderboard = useMemo(() => {
    // Group bets by wallet_address
    const walletStats = new Map<string, { trades: number; totalAmount: number }>();
    bets.forEach((bet) => {
      const existing = walletStats.get(bet.wallet_address) || { trades: 0, totalAmount: 0 };
      existing.trades += 1;
      existing.totalAmount += bet.amount;
      walletStats.set(bet.wallet_address, existing);
    });

    // Convert real users to leaderboard entries
    const realEntries = Array.from(walletStats.entries()).map(([addr, stats]) => ({
      rank: 0,
      address: addr.slice(0, 4) + "..." + addr.slice(-4),
      totalTrades: stats.trades,
      winRate: Math.round(50 + Math.random() * 30), // mock win rate for demo
      profit: Math.round(stats.totalAmount * 0.8),
    }));

    // Combine with mock data, real users first
    const combined = [...realEntries, ...leaderboardData];
    // Sort by trades desc
    combined.sort((a, b) => b.totalTrades - a.totalTrades);
    // Re-rank
    return combined.map((e, i) => ({ ...e, rank: i + 1 })).slice(0, 15);
  }, [bets]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-bold text-3xl text-foreground mb-2">Leaderboard</h1>
            <p className="text-muted-foreground text-sm">Top predictors ranked by trades and profit · Updates in real-time</p>
          </motion.div>
          <LeaderboardTable data={liveLeaderboard} />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
