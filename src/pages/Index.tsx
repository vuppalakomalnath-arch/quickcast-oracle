import { motion } from "framer-motion";
import { ArrowRight, Zap, Shield, Eye, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import MarketCard from "@/components/MarketCard";
import { initialMarkets } from "@/data/mockData";
import Navbar from "@/components/Navbar";
import PracticePanel from "@/components/PracticePanel";

const features = [
  {
    icon: Shield,
    title: "Multi-Source Oracle Engine",
    description: "Every market resolution is backed by 3+ independent oracle sources, ensuring transparent and verifiable outcomes.",
  },
  {
    icon: Eye,
    title: "Confidence Scoring",
    description: "See real-time agreement percentages and confidence levels before a market resolves. No black boxes.",
  },
  {
    icon: Zap,
    title: "Built on Algorand",
    description: "Instant finality, near-zero fees, and carbon-negative infrastructure for sustainable prediction markets.",
  },
];

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero */}
      <section className="pt-24 pb-16 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
              <span className="text-xs text-primary font-medium">Live on Algorand Testnet</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="text-4xl md:text-6xl font-display font-bold leading-tight mb-4"
          >
            Trade the future with{" "}
            <span className="gradient-text">transparent truth signals</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto"
          >
            QuickCast is a decentralized prediction market powered by a multi-source oracle confidence engine on Algorand.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3"
          >
            <Link
              to="/market/btc-100k"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg gradient-primary text-primary-foreground font-semibold shadow-[var(--glow-primary)] hover:opacity-90 transition-opacity"
            >
              Start Trading <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/leaderboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border text-foreground hover:bg-secondary transition-colors font-medium"
            >
              <TrendingUp className="w-4 h-4" /> Leaderboard
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Markets */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-xl text-foreground">Live Markets</h2>
            <span className="text-xs text-muted-foreground">{initialMarkets.length} active</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
            {initialMarkets.map((market, i) => (
              <MarketCard key={market.id} market={market} index={i} />
            ))}
          </div>
        </div>
      </section>

      {/* Why QuickCast */}
      <section className="pb-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-3">
              Why QuickCast is <span className="gradient-text">unique</span>
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto text-sm">
              Unlike traditional prediction markets, QuickCast includes a multi-source oracle confidence engine so users can see exactly why a market resolves a certain way.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card-hover p-6 text-center space-y-3"
              >
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto">
                  <f.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded gradient-primary flex items-center justify-center">
              <span className="font-display font-bold text-primary-foreground text-[10px]">Q</span>
            </div>
            <span className="font-display font-semibold text-sm gradient-text">QuickCast</span>
          </div>
          <p className="text-xs text-muted-foreground">Built on Algorand · Hackathon Demo · 2025</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
