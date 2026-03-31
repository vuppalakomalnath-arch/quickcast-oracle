import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import LeaderboardTable from "@/components/LeaderboardTable";
import { leaderboardData } from "@/data/mockData";

const Leaderboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="font-display font-bold text-3xl text-foreground mb-2">Leaderboard</h1>
            <p className="text-muted-foreground text-sm">Top predictors ranked by win rate and profit</p>
          </motion.div>
          <LeaderboardTable data={leaderboardData} />
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
