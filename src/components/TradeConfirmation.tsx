import { motion } from "framer-motion";
import { CheckCircle2, X, ExternalLink, Clock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface Props {
  side: "YES" | "NO";
  amount: number;
  price: number;
  onClose: () => void;
}

const TradeConfirmation = ({ side, amount, price, onClose }: Props) => {
  const [txHash] = useState(() => "TXID" + Math.random().toString(36).substring(2, 10).toUpperCase());
  const [blockRound] = useState(() => Math.floor(40_000_000 + Math.random() * 1_000_000));
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setConfirmed(true), 1200);
    return () => clearTimeout(timer);
  }, []);

  const payout = (amount / price).toFixed(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <div className="absolute inset-0 bg-background/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="glass-card p-6 w-full max-w-sm relative z-10 space-y-4"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground">
          <X className="w-4 h-4" />
        </button>

        <div className="text-center space-y-2">
          {!confirmed ? (
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
              <Clock className="w-10 h-10 text-primary mx-auto" />
            </motion.div>
          ) : (
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 300 }}>
              <CheckCircle2 className={`w-10 h-10 mx-auto ${side === "YES" ? "text-yes" : "text-no"}`} />
            </motion.div>
          )}
          <h3 className="font-display font-bold text-lg text-foreground">
            {confirmed ? "Transaction Confirmed" : "Confirming on Algorand..."}
          </h3>
          <p className="text-sm text-muted-foreground">
            {confirmed
              ? `You bought ${side} for ${amount} ALGO`
              : "Waiting for block finality..."}
          </p>
        </div>

        {confirmed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="rounded-lg bg-secondary/50 border border-border p-3 space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tx Hash</span>
                <span className="font-mono text-primary text-[10px] flex items-center gap-1">
                  {txHash}...
                  <ExternalLink className="w-2.5 h-2.5" />
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Block Round</span>
                <span className="font-mono text-foreground text-[10px]">#{blockRound.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Position</span>
                <span className={`font-semibold ${side === "YES" ? "text-yes" : "text-no"}`}>{side}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Entry Price</span>
                <span className="text-foreground">${price.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Potential Payout</span>
                <span className="text-success font-semibold">{payout} ALGO</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tx Fee</span>
                <span className="text-foreground">0.001 ALGO</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 justify-center text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3 text-success" />
              <span>Verified on Algorand Testnet · Instant Finality</span>
            </div>
          </motion.div>
        )}

        {confirmed && (
          <Button onClick={onClose} className="w-full gradient-primary text-primary-foreground">
            Done
          </Button>
        )}
      </motion.div>
    </motion.div>
  );
};

export default TradeConfirmation;
