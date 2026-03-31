import { motion } from "framer-motion";
import {
  Gift,
  PartyPopper,
  CheckCircle2,
  Loader2,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/context/WalletContext";

interface ClaimRewardProps {
  marketId: string;
  resolved: boolean;
  outcome?: "YES" | "NO";
  yesPool: number;
  noPool: number;
}

const ClaimReward = ({
  marketId,
  resolved,
  outcome,
  yesPool,
  noPool,
}: ClaimRewardProps) => {
  const { connected, address, bets, claimMarketReward } = useWallet();

  const [claimed, setClaimed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [txHash, setTxHash] = useState("");

  const userWinningStake = useMemo(() => {
    if (!outcome) return 0;

    return bets
      .filter(
        (bet) =>
          bet.marketId === marketId &&
          bet.side === outcome &&
          !bet.claimed
      )
      .reduce((sum, bet) => sum + bet.amount, 0);
  }, [bets, marketId, outcome]);

  const winningPool = outcome === "YES" ? yesPool : noPool;
  const totalPool = yesPool + noPool;

  const reward = useMemo(() => {
    if (!resolved || !outcome || userWinningStake <= 0 || winningPool <= 0) {
      return 0;
    }

    return parseFloat(((userWinningStake / winningPool) * totalPool).toFixed(2));
  }, [resolved, outcome, userWinningStake, winningPool, totalPool]);

  const handleClaim = () => {
    if (!connected) {
      toast.error("Connect your Pera Wallet first");
      return;
    }

    if (!resolved) {
      toast.error("Market is not resolved yet");
      return;
    }

    if (userWinningStake <= 0) {
      toast.error("No winning position found for this market");
      return;
    }

    if (claimed) {
      toast.info("Reward already claimed");
      return;
    }

    setModalOpen(true);
  };

  const confirmClaim = async () => {
    if (!outcome) return;

    setConfirming(true);
    await new Promise((r) => setTimeout(r, 2200));

    const hash =
      "TXID" + Math.random().toString(36).substring(2, 10).toUpperCase() + "...ALGO";

    claimMarketReward(marketId, outcome, reward);

    setTxHash(hash);
    setConfirming(false);
    setClaimed(true);
    setModalOpen(false);

    toast.success("🎉 Transaction Confirmed on Algorand", {
      description: `${reward.toFixed(2)} ALGO claimed · ${hash}`,
      duration: 6000,
    });
  };

  return (
    <>
      <div className="glass-card p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Gift className="w-5 h-5 text-primary" />
          <h3 className="font-display font-semibold text-foreground">
            Claim Rewards
          </h3>
        </div>

        {!claimed ? (
          <div className="text-center space-y-3 py-4">
            <p className="text-sm text-muted-foreground">
              Winning users can claim their rewards once the market reaches final resolution.
            </p>

            <div className="rounded-lg bg-secondary/50 border border-border p-3 space-y-1 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Your winning stake</span>
                <span className="font-semibold text-foreground">
                  {userWinningStake.toFixed(2)} ALGO
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Winning pool</span>
                <span className="font-semibold text-foreground">
                  {winningPool.toFixed(2)} ALGO
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Total pool</span>
                <span className="font-semibold text-foreground">
                  {totalPool.toFixed(2)} ALGO
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-xs text-muted-foreground mb-1">Estimated Payout</p>
              <p className="text-2xl font-display font-bold text-primary">
                {reward.toFixed(2)} ALGO
              </p>
              <p className="text-[11px] text-muted-foreground mt-2">
                Rewards are distributed proportionally based on your stake and total winning pool.
              </p>
            </div>

            <Button
              onClick={handleClaim}
              disabled={!resolved || userWinningStake <= 0}
              className="gradient-primary text-primary-foreground shadow-[var(--glow-primary)] w-full"
            >
              {!resolved
                ? "Awaiting Resolution"
                : userWinningStake <= 0
                ? "No Winning Position"
                : "Claim Reward"}
            </Button>
          </div>
        ) : (
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center space-y-3 py-4"
          >
            <PartyPopper className="w-10 h-10 text-warning mx-auto" />
            <p className="font-display font-semibold text-foreground">
              Reward Claimed!
            </p>
            <p className="text-sm text-muted-foreground">
              {reward.toFixed(2)} ALGO sent to your wallet
            </p>
            {txHash && (
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-primary">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-mono">{txHash}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-card border-glass-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Confirm Claim on Algorand
            </DialogTitle>
            <DialogDescription>
              Review the transaction details before confirming.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <div className="rounded-lg bg-secondary/50 border border-border p-4 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Action</span>
                <span className="font-semibold text-foreground">Claim Reward</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-success">
                  +{reward.toFixed(2)} ALGO
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-mono text-foreground text-[10px]">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Network</span>
                <span className="text-foreground">Algorand Testnet</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Tx Fee</span>
                <span className="text-foreground">0.001 ALGO</span>
              </div>
            </div>

            <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-warning mt-0.5 shrink-0" />
              <p className="text-[11px] text-warning/80">
                This transaction is simulated for demo and updates wallet balance instantly.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setModalOpen(false)}
              className="flex-1"
              disabled={confirming}
            >
              Cancel
            </Button>
            <Button
              onClick={confirmClaim}
              disabled={confirming}
              className="flex-1 gradient-primary text-primary-foreground shadow-[var(--glow-primary)]"
            >
              {confirming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming...
                </>
              ) : (
                "Sign & Confirm"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ClaimReward;
