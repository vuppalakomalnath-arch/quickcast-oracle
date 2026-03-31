import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, TrendingUp, TrendingDown, BarChart3, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import OraclePanel from "@/components/OraclePanel";
import ClaimReward from "@/components/ClaimReward";
import TradeConfirmation from "@/components/TradeConfirmation";
import CountdownTimer from "@/components/CountdownTimer";
import { useSupabaseMarket } from "@/hooks/useSupabaseMarkets";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";

const MarketDetails = () => {
  const { connected, algoBalance, placeTrade } = useWallet();
  const { id } = useParams<{ id: string }>();
  const { market, loading } = useSupabaseMarket(id);

  const [stake, setStake] = useState("10");
  const [confirmation, setConfirmation] = useState<{
    side: "YES" | "NO";
    price: number;
    txId?: string;
    confirmedRound?: number;
  } | null>(null);
  const [placing, setPlacing] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (!market) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Market not found</p>
      </div>
    );
  }

  const oracleSources = Array.isArray(market.oracle_sources) ? market.oracle_sources : [];

  const handleBuy = async (side: "YES" | "NO") => {
    if (!connected) {
      toast.error("Connect your Pera Wallet to trade");
      return;
    }

    const stakeNum = parseFloat(stake) || 10;

    if (stakeNum <= 0) {
      toast.error("Enter a valid stake amount");
      return;
    }

    if (stakeNum > algoBalance) {
      toast.error("Insufficient wallet balance");
      return;
    }

    setPlacing(true);
    const tradePrice = side === "YES" ? Number(market.yes_price) : Number(market.no_price);
    const result = await placeTrade(market.id, side, stakeNum, tradePrice);
    setPlacing(false);

    if (!result) {
      return; // error toast already shown by WalletContext
    }

    setConfirmation({
      side,
      price: tradePrice,
      txId: result.txId,
      confirmedRound: result.confirmedRound,
    });

    toast.success(`${side} position confirmed on Algorand`, {
      description: `Tx: ${result.txId.slice(0, 12)}... · Round #${result.confirmedRound}`,
      duration: 5000,
    });
  };

  const yesPrice = Number(market.yes_price);
  const noPrice = Number(market.no_price);
  const yesPool = Number(market.yes_pool);
  const noPool = Number(market.no_pool);
  const volume = Number(market.total_volume);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-20 pb-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <Link to="/" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Markets
          </Link>

          {/* On-chain privacy warning */}
          <div className="rounded-lg bg-warning/5 border border-warning/20 p-3 flex items-start gap-2 mb-6">
            <AlertTriangle className="w-4 h-4 text-warning mt-0.5 shrink-0" />
            <p className="text-[11px] text-warning/80">
              All transactions are recorded on Algorand Testnet. Do not store sensitive personal information in transaction notes or on-chain state.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 space-y-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                    {market.category}
                  </span>
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

                <h1 className="font-display font-bold text-2xl md:text-3xl text-foreground leading-tight">
                  {market.title}
                </h1>
                <p className="text-sm text-muted-foreground leading-relaxed">{market.description}</p>

                <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2 border-t border-border">
                  <div className="flex items-center gap-1">
                    <BarChart3 className="w-3 h-3" />
                    <span>Vol: ${volume.toLocaleString()}</span>
                  </div>
                  {market.end_time && <CountdownTimer endTime={market.end_time} />}
                </div>
              </motion.div>

              {/* Trade Panel */}
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 space-y-5">
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
                    <p className="text-[10px] text-muted-foreground mb-1">On-Chain Balance</p>
                    <p className="text-sm font-semibold text-foreground">{algoBalance.toFixed(4)} ALGO</p>
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
                    disabled={placing}
                    className="bg-yes text-yes-foreground hover:bg-yes/90 shadow-[var(--glow-yes)] font-semibold"
                  >
                    {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy YES"}
                  </Button>
                  <Button
                    onClick={() => handleBuy("NO")}
                    disabled={placing}
                    className="bg-no text-no-foreground hover:bg-no/90 shadow-[var(--glow-no)] font-semibold"
                  >
                    {placing ? <Loader2 className="w-4 h-4 animate-spin" /> : "Buy NO"}
                  </Button>
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <OraclePanel sources={oracleSources} />
              <ClaimReward
                marketId={market.id}
                resolved={market.resolved}
                outcome={market.resolved_outcome as "YES" | "NO" | undefined}
                yesPool={yesPool}
                noPool={noPool}
              />
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
            txId={confirmation.txId}
            confirmedRound={confirmation.confirmedRound}
            onClose={() => setConfirmation(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketDetails;
