import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import OraclePanel from "@/components/OraclePanel";
import ClaimReward from "@/components/ClaimReward";
import TradeConfirmation from "@/components/TradeConfirmation";
import CountdownTimer from "@/components/CountdownTimer";
import { initialMarkets } from "@/data/mockData";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";

const MarketDetails = () => {
  const { connected, balance, placeTrade } = useWallet();
  const { id } = useParams<{ id: string }>();
  const baseMarket = initialMarkets.find(m => m.id === id);

  const [yesPrice, setYesPrice] = useState(baseMarket?.yesPrice ?? 0.5);
  const [noPrice, setNoPrice] = useState(baseMarket?.noPrice ?? 0.5);
  const [yesPool, setYesPool] = useState(baseMarket?.yesPool ?? 0);
  const [noPool, setNoPool] = useState(baseMarket?.noPool ?? 0);
  const [volume, setVolume] = useState(baseMarket?.totalVolume ?? 0);
  const [stake, setStake] = useState("10");
  const [confirmation, setConfirmation] = useState<{ side: "YES" | "NO"; price: number } | null>(null);
  const [priceHistory, setPriceHistory] = useState<number[]>([0.5]);

  if (!baseMarket) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Market not found</p>
      </div>
    );
  }

  const handleBuy = (side: "YES" | "NO") => {
  if (!connected) {
    toast.error("Connect your Pera Wallet to trade");
    return;
  }

  const stakeNum = parseFloat(stake) || 10;

  if (stakeNum <= 0) {
    toast.error("Enter a valid stake amount");
    return;
  }

  if (stakeNum > balance) {
    toast.error("Insufficient wallet balance");
    return;
  }

  const tradePrice = side === "YES" ? yesPrice : noPrice;
  const success = placeTrade(baseMarket.id, side, stakeNum, tradePrice);

  if (!success) {
    toast.error("Trade could not be placed");
    return;
  }

  const delta = 0.02;

  setYesPrice((prev) => {
    const next = side === "YES" ? prev + delta : prev - delta;
    return Math.max(0.10, Math.min(0.90, parseFloat(next.toFixed(2))));
  });

  setNoPrice((prev) => {
    const next = side === "NO" ? prev + delta : prev - delta;
    return Math.max(0.10, Math.min(0.90, parseFloat(next.toFixed(2))));
  });

  if (side === "YES") {
    setYesPool((prev) => parseFloat((prev + stakeNum).toFixed(2)));
  } else {
    setNoPool((prev) => parseFloat((prev + stakeNum).toFixed(2)));
  }

  setVolume((prev) => prev + stakeNum * 100);

  setPriceHistory((prev) => {
    const lastYes = prev[prev.length - 1];
    const newYes =
      side === "YES"
        ? Math.min(0.90, lastYes + delta)
        : Math.max(0.10, lastYes - delta);
    return [...prev, parseFloat(newYes.toFixed(2))];
  });

  setConfirmation({ side, price: tradePrice });

  toast.success(`${side} position placed successfully`);
};

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Markets
          </Link>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {baseMarket.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-success" />
                    </span>
                    <span className="text-xs text-success font-medium">LIVE</span>
                  </div>
                </div>

                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground leading-tight">
                  {baseMarket.title}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">{baseMarket.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>Vol: ${volume.toLocaleString()}</span>
                  </div>
                  <CountdownTimer endTime={baseMarket.endTime} />
                </div>
              </motion.div>

              {/* Price Chart Mini */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-5 space-y-3">
                <h3 className="font-display font-semibold text-sm text-foreground">Price History</h3>
                <div className="h-20 flex items-end gap-[2px]">
                  {priceHistory.map((p, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t bg-primary/60 transition-all duration-300"
                      style={{ height: `${p * 100}%` }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Start</span>
                  <span>Now</span>
                </div>
              </motion.div>

              {/* Trade Panel */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 space-y-5">
                <h3 className="font-display font-semibold text-foreground">Place Your Prediction</h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-yes/10 border border-yes/20 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Yes Price</p>
                    <p className="text-3xl font-display font-bold text-yes">${yesPrice.toFixed(2)}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingUp className="w-3 h-3 text-yes" />
                      <span className="text-[10px] text-yes">{((yesPrice - 0.5) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                  <div className="rounded-xl bg-no/10 border border-no/20 p-4 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">No Price</p>
                    <p className="text-3xl font-display font-bold text-no">${noPrice.toFixed(2)}</p>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <TrendingDown className="w-3 h-3 text-no" />
                      <span className="text-[10px] text-no">{((noPrice - 0.5) * 100).toFixed(0)}%</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs text-muted-foreground">Stake (ALGO)</label>
                  <Input
                    type="number"
                    value={stake}
                    onChange={e => setStake(e.target.value)}
                    className="bg-secondary border-border text-foreground"
                    min="1"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="rounded-lg bg-secondary/50 border border-border p-3">
                      <p className="text-[10px] text-muted-foreground mb-1">Wallet Balance</p>
                      <p className="text-sm font-semibold text-foreground">{balance.toFixed(2)} ALGO</p>
                    </div>
                    <div className="rounded-lg bg-yes/10 border border-yes/20 p-3">
                      <p className="text-[10px] text-muted-foreground mb-1">YES Pool</p>
                      <p className="text-sm font-semibold text-yes">{yesPool.toFixed(2)} ALGO</p>
                    </div>
                    <div className="rounded-lg bg-no/10 border border-no/20 p-3">
                      <p className="text-[10px] text-muted-foreground mb-1">NO Pool</p>
                      <p className="text-sm font-semibold text-no">{noPool.toFixed(2)} ALGO</p>
                    </div>
                  </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    onClick={() => handleBuy("YES")}
                    className="bg-yes text-yes-foreground hover:bg-yes/90 shadow-[var(--glow-yes)] font-semibold"
                  >
                    Buy YES
                  </Button>
                  <Button
                    onClick={() => handleBuy("NO")}
                    className="bg-no text-no-foreground hover:bg-no/90 shadow-[var(--glow-no)] font-semibold"
                  >
                    Buy NO
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <OraclePanel sources={baseMarket.oracleSources} />
              <ClaimReward resolved={baseMarket.resolved} outcome={baseMarket.resolvedOutcome} />
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {confirmation && (
          <TradeConfirmation
            side={confirmation.side}
            amount={parseFloat(stake) || 10}
            price={confirmation.price}
            onClose={() => setConfirmation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketDetails;
