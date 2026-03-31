import { useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, ArrowRightLeft, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";

const MOCK_INR_TO_ALGO = 0.0012;
const MOCK_ALGO_TO_INR = 1 / MOCK_INR_TO_ALGO;

interface FundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FundsModal = ({ open, onOpenChange }: FundsModalProps) => {
  const { algoBalance, inrBalance, addFunds, withdrawFunds } = useWallet();
  const [tab, setTab] = useState<"add" | "withdraw">("add");
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const numAmount = parseFloat(amount) || 0;
  const converted =
    tab === "add"
      ? (numAmount * MOCK_INR_TO_ALGO).toFixed(4)
      : (numAmount * MOCK_ALGO_TO_INR).toFixed(2);

  const handleSubmit = async () => {
    if (numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);

    let success = false;
    if (tab === "add") {
      if (numAmount > inrBalance) {
        toast.error("Insufficient INR balance");
        setLoading(false);
        return;
      }
      success = await addFunds(numAmount);
    } else {
      if (numAmount > algoBalance) {
        toast.error("Insufficient ALGO balance");
        setLoading(false);
        return;
      }
      success = await withdrawFunds(numAmount);
    }

    setLoading(false);
    if (success) {
      toast.success(
        tab === "add"
          ? `Added ${converted} ALGO from ₹${numAmount.toLocaleString()}`
          : `Withdrawn ${numAmount} ALGO → ₹${converted}`
      );
      setAmount("");
      onOpenChange(false);
    } else {
      toast.error("Transaction failed");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-glass-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <ArrowRightLeft className="w-5 h-5 text-primary" />
            Demo Fund Manager
          </DialogTitle>
          <DialogDescription>
            Convert between INR and ALGO using mock exchange rates.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <p className="text-[11px] text-warning/80">
            DEMO MODE — No real funds are involved. Mock rate: 1 ALGO ≈ ₹{MOCK_ALGO_TO_INR.toFixed(0)}
          </p>
        </div>

        {/* Tab toggle */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => { setTab("add"); setAmount(""); }}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "add"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary text-muted-foreground border border-border"
            }`}
          >
            Add Funds (INR → ALGO)
          </button>
          <button
            onClick={() => { setTab("withdraw"); setAmount(""); }}
            className={`py-2 rounded-lg text-sm font-medium transition-colors ${
              tab === "withdraw"
                ? "bg-primary/20 text-primary border border-primary/30"
                : "bg-secondary text-muted-foreground border border-border"
            }`}
          >
            Withdraw (ALGO → INR)
          </button>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/50 border border-border p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">INR Balance</p>
            <p className="text-sm font-semibold text-foreground flex items-center justify-center gap-1">
              <IndianRupee className="w-3 h-3" />
              {inrBalance.toLocaleString()}
            </p>
          </div>
          <div className="rounded-lg bg-secondary/50 border border-border p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">ALGO Balance</p>
            <p className="text-sm font-semibold text-primary">{algoBalance.toFixed(2)} ALGO</p>
          </div>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-xs text-muted-foreground">
            {tab === "add" ? "Amount in INR" : "Amount in ALGO"}
          </label>
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder={tab === "add" ? "Enter INR amount" : "Enter ALGO amount"}
            className="bg-secondary border-border text-foreground"
            min="0"
          />
          {numAmount > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-muted-foreground flex items-center gap-1"
            >
              <ArrowRightLeft className="w-3 h-3" />
              {tab === "add"
                ? `You'll receive ≈ ${converted} ALGO`
                : `You'll receive ≈ ₹${converted}`}
            </motion.p>
          )}
        </div>

        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => onOpenChange(false)}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || numAmount <= 0}
            className="flex-1 gradient-primary text-primary-foreground shadow-[var(--glow-primary)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing...
              </>
            ) : tab === "add" ? (
              "Add Funds"
            ) : (
              "Withdraw"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FundsModal;
