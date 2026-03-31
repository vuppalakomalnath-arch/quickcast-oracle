import { motion } from "framer-motion";
import { CheckCircle, X } from "lucide-react";

interface TradeConfirmationProps {
  side: "YES" | "NO";
  amount: number;
  price: number;
  onClose: () => void;
}

const TradeConfirmation = ({ side, amount, price, onClose }: TradeConfirmationProps) => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="glass-card p-6 max-w-sm w-full space-y-4"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <h3 className="font-display font-semibold text-foreground">Trade Confirmed</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center justify-center py-4">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center ${side === "YES" ? "bg-yes/20" : "bg-no/20"}`}>
            <CheckCircle className={`w-8 h-8 ${side === "YES" ? "text-yes" : "text-no"}`} />
          </div>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Position</span>
            <span className={`font-semibold ${side === "YES" ? "text-yes" : "text-no"}`}>{side}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stake</span>
            <span className="text-foreground">{amount} ALGO</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Price</span>
            <span className="text-foreground">${price.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Potential Payout</span>
            <span className="text-primary font-semibold">{(amount / price).toFixed(2)} ALGO</span>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center pt-2">
          Transaction simulated for demo purposes
        </p>
      </motion.div>
    </motion.div>
  );
};

export default TradeConfirmation;
