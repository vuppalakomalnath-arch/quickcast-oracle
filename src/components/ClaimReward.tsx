import { motion } from "framer-motion";
import { Gift, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

const ClaimReward = () => {
  const [claimed, setClaimed] = useState(false);

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Gift className="w-5 h-5 text-primary" />
        <h3 className="font-display font-semibold text-foreground">Claim Rewards</h3>
      </div>

      {!claimed ? (
        <div className="text-center space-y-3 py-4">
          <p className="text-sm text-muted-foreground">
            When this market resolves, winning positions can claim their rewards here.
          </p>
          <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
            <p className="text-xs text-muted-foreground mb-1">Estimated Payout</p>
            <p className="text-2xl font-display font-bold text-primary">24.50 ALGO</p>
          </div>
          <Button
            onClick={() => setClaimed(true)}
            className="gradient-primary text-primary-foreground shadow-[var(--glow-primary)] w-full"
          >
            Claim Reward
          </Button>
        </div>
      ) : (
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center space-y-3 py-4"
        >
          <PartyPopper className="w-10 h-10 text-warning mx-auto" />
          <p className="font-display font-semibold text-foreground">Reward Claimed!</p>
          <p className="text-sm text-muted-foreground">24.50 ALGO sent to your wallet (simulated)</p>
        </motion.div>
      )}
    </div>
  );
};

export default ClaimReward;
