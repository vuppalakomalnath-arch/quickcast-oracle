import { motion, AnimatePresence } from "framer-motion";
import { Gift, PartyPopper, CheckCircle2, ExternalLink, Loader2, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { useWallet } from "@/context/WalletContext";

const ClaimReward = () => {
  const { connected, address } = useWallet();
  const [claimed, setClaimed] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [txHash, setTxHash] = useState("");

  const handleClaim = () => {
    if (!connected) {
      toast.error("Connect your Pera Wallet first");
      return;
    }
    setModalOpen(true);
  };

  const confirmClaim = async () => {
    setConfirming(true);
    // Simulate blockchain confirmation delay
    await new Promise(r => setTimeout(r, 2200));

    const hash = "TXID" + Math.random().toString(36).substring(2, 10).toUpperCase() + "...ALGO";
    setTxHash(hash);
    setConfirming(false);
    setClaimed(true);
    setModalOpen(false);

    toast.success("🎉 Transaction Confirmed on Algorand", {
      description: `24.50 ALGO claimed · ${hash}`,
      duration: 6000,
    });
  };

  return (
    <>
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
              onClick={handleClaim}
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
            <p className="text-sm text-muted-foreground">24.50 ALGO sent to your wallet</p>
            {txHash && (
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-primary">
                <CheckCircle2 className="w-3 h-3" />
                <span className="font-mono">{txHash}</span>
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* Claim Confirmation Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="glass-card border-glass-border max-w-md">
          <DialogHeader>
            <DialogTitle className="font-display flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Confirm Claim on Algorand
            </DialogTitle>
            <DialogDescription>Review the transaction details before confirming.</DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            {/* Blockchain-style confirmation card */}
            <div className="rounded-lg bg-secondary/50 border border-border p-4 space-y-2.5">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Action</span>
                <span className="font-semibold text-foreground">Claim Reward</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-semibold text-success">+24.50 ALGO</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Recipient</span>
                <span className="font-mono text-foreground text-[10px]">{address.slice(0, 8)}...{address.slice(-6)}</span>
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
                This transaction will be signed via Pera Wallet and submitted to the Algorand Testnet. Simulated for demo.
              </p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} className="flex-1" disabled={confirming}>
              Cancel
            </Button>
            <Button onClick={confirmClaim} disabled={confirming} className="flex-1 gradient-primary text-primary-foreground shadow-[var(--glow-primary)]">
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
