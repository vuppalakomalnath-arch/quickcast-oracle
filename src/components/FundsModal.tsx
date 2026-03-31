import { useState } from "react";
import { motion } from "framer-motion";
import { IndianRupee, ArrowRightLeft, AlertTriangle, ExternalLink, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useWallet } from "@/context/WalletContext";
import { ALGORAND_CONFIG } from "@/algorand/config";

interface FundsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const FundsModal = ({ open, onOpenChange }: FundsModalProps) => {
  const { algoBalance, inrBalance, address } = useWallet();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-card border-glass-border max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <Wallet className="w-5 h-5 text-primary" />
            Wallet Balances
          </DialogTitle>
          <DialogDescription>
            Your on-chain ALGO balance and INR conversion.
          </DialogDescription>
        </DialogHeader>

        <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
          <p className="text-[11px] text-warning/80">
            ALGO balance is read from Algorand Testnet. INR is a display conversion only (1 ALGO ≈ ₹{ALGORAND_CONFIG.ALGO_TO_INR.toFixed(0)}).
            Do not store sensitive personal information on-chain.
          </p>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-secondary/50 border border-border p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">On-Chain ALGO</p>
            <p className="text-lg font-semibold text-primary">{algoBalance.toFixed(4)} ALGO</p>
          </div>
          <div className="rounded-lg bg-secondary/50 border border-border p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">INR Equivalent</p>
            <p className="text-lg font-semibold text-foreground flex items-center justify-center gap-1">
              <IndianRupee className="w-3.5 h-3.5" />
              {inrBalance.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            To add Testnet ALGO, use the Algorand Testnet Dispenser:
          </p>
          <a
            href="https://bank.testnet.algorand.network/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs text-primary hover:underline"
          >
            <ExternalLink className="w-3 h-3" />
            Algorand Testnet Dispenser
          </a>
          {address && (
            <div className="rounded-lg bg-secondary/50 border border-border p-3">
              <p className="text-[10px] text-muted-foreground mb-1">Your Wallet Address</p>
              <p className="font-mono text-[10px] text-foreground break-all">{address}</p>
            </div>
          )}
        </div>

        <Button
          variant="secondary"
          onClick={() => onOpenChange(false)}
          className="w-full"
        >
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default FundsModal;
