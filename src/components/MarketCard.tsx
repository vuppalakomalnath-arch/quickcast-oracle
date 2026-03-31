import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import CountdownTimer from "./CountdownTimer";
import type { DbMarket } from "@/hooks/useSupabaseMarkets";

interface MarketCardProps {
  market: DbMarket;
  index: number;
}

const MarketCard = ({ market, index }: MarketCardProps) => {
  const yesPrice = Number(market.yes_price);
  const noPrice = Number(market.no_price);
  const totalVolume = Number(market.total_volume);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Link to={`/market/${market.id}`}>
        <div className="glass-card-hover p-5 flex flex-col gap-4 group">
          <div className="flex items-start justify-between">
            <Badge variant="outline" className="text-xs border-primary/30 text-primary">
              {market.category}
            </Badge>
            {market.is_live && (
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                </span>
                <span className="text-xs text-success font-medium">LIVE</span>
              </div>
            )}
          </div>

          <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors leading-snug">
            {market.title}
          </h3>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg bg-yes/10 border border-yes/20 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Yes</p>
              <p className="text-lg font-display font-bold text-yes">${yesPrice.toFixed(2)}</p>
            </div>
            <div className="rounded-lg bg-no/10 border border-no/20 p-3 text-center">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">No</p>
              <p className="text-lg font-display font-bold text-no">${noPrice.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border">
            <div className="flex items-center gap-1">
              <BarChart3 className="w-3 h-3" />
              <span>${totalVolume.toLocaleString()}</span>
            </div>
            {market.end_time && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <CountdownTimer endTime={market.end_time} />
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default MarketCard;
