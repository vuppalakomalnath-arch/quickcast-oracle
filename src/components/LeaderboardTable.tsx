import { motion } from "framer-motion";
import { Trophy, TrendingUp, Target } from "lucide-react";
import type { LeaderboardEntry } from "@/data/mockData";

interface LeaderboardTableProps {
  data: LeaderboardEntry[];
}

const LeaderboardTable = ({ data }: LeaderboardTableProps) => {
  const medalColors = ["text-warning", "text-muted-foreground", "text-warning/60"];

  return (
    <div className="glass-card overflow-hidden">
      <div className="p-5 border-b border-border flex items-center gap-2">
        <Trophy className="w-5 h-5 text-warning" />
        <h3 className="font-display font-semibold text-foreground">Top Predictors</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground p-4">Rank</th>
              <th className="text-left text-[10px] uppercase tracking-wider text-muted-foreground p-4">Address</th>
              <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground p-4">Trades</th>
              <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground p-4">Win Rate</th>
              <th className="text-right text-[10px] uppercase tracking-wider text-muted-foreground p-4">Profit</th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, i) => (
              <motion.tr
                key={entry.rank}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="p-4">
                  <span className={`font-display font-bold ${i < 3 ? medalColors[i] : "text-muted-foreground"}`}>
                    #{entry.rank}
                  </span>
                </td>
                <td className="p-4 font-mono text-sm text-foreground">{entry.address}</td>
                <td className="p-4 text-right text-sm text-muted-foreground">{entry.totalTrades}</td>
                <td className="p-4 text-right">
                  <span className="text-sm font-medium text-success">{entry.winRate}%</span>
                </td>
                <td className="p-4 text-right">
                  <span className="text-sm font-medium text-primary">${entry.profit.toLocaleString()}</span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaderboardTable;
