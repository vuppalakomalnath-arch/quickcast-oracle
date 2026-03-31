import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const [connected, setConnected] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-card border-t-0 border-x-0 rounded-none">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <span className="font-display font-bold text-primary-foreground text-sm">Q</span>
          </div>
          <span className="font-display font-bold text-lg gradient-text">QuickCast</span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Markets</Link>
          <Link to="/leaderboard" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Leaderboard</Link>
        </div>

        <div className="flex items-center gap-3">
          <Button
            onClick={() => setConnected(!connected)}
            variant={connected ? "secondary" : "default"}
            size="sm"
            className={connected ? "" : "gradient-primary text-primary-foreground shadow-[var(--glow-primary)] hover:opacity-90"}
          >
            <Wallet className="w-4 h-4 mr-2" />
            {connected ? "ALGO...X7K2" : "Connect Wallet"}
          </Button>
          <button className="md:hidden text-foreground" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden glass-card border-t-0 rounded-t-none px-4 pb-4 flex flex-col gap-3"
        >
          <Link to="/" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Markets</Link>
          <Link to="/leaderboard" onClick={() => setMobileOpen(false)} className="text-sm text-muted-foreground hover:text-foreground py-2">Leaderboard</Link>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
