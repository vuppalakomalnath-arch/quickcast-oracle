import { useState } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, Menu, X, CircleDot, Briefcase, ChevronDown, LogOut, Copy, ExternalLink, IndianRupee, ArrowRightLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/context/WalletContext";
import { toast } from "sonner";
import FundsModal from "@/components/FundsModal";

const Navbar = () => {
  const { connected, connecting, address, algoBalance, inrBalance, network, portfolioValue, openPositions, connect, disconnect } = useWallet();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [walletDropdown, setWalletDropdown] = useState(false);
  const [fundsOpen, setFundsOpen] = useState(false);

  const shortAddr = address ? address.slice(0, 6) + "..." + address.slice(-4) : "";

  const handleConnect = async () => {
    await connect();
    toast.success("Pera Wallet Connected", {
      description: `Connected to ${network}`,
    });
  };

  const handleDisconnect = () => {
    disconnect();
    setWalletDropdown(false);
    toast.info("Wallet Disconnected");
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    toast.success("Address copied to clipboard");
  };

  return (
    <>
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

          <div className="flex items-center gap-2">
            {/* DEMO badge */}
            {connected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning/10 border border-warning/20"
              >
                <span className="text-[10px] font-medium text-warning">DEMO</span>
              </motion.div>
            )}

            {/* Network badge */}
            {connected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success/10 border border-success/20"
              >
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75" />
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-success" />
                </span>
                <span className="text-[10px] font-medium text-success">Testnet</span>
              </motion.div>
            )}

            {/* Portfolio pill */}
            {connected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.05 }}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary border border-border"
              >
                <Briefcase className="w-3.5 h-3.5 text-primary" />
                <span className="text-xs font-medium text-foreground">{portfolioValue.toLocaleString()} ALGO</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">{openPositions} positions</span>
              </motion.div>
            )}

            {/* Wallet button */}
            <div className="relative">
              {connected ? (
                <Button
                  onClick={() => setWalletDropdown(!walletDropdown)}
                  variant="secondary"
                  size="sm"
                  className="border border-border gap-2"
                >
                  <div className="w-5 h-5 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                    <CircleDot className="w-3 h-3 text-primary-foreground" />
                  </div>
                  <span className="hidden sm:inline text-xs">{shortAddr}</span>
                  <ChevronDown className="w-3 h-3 text-muted-foreground" />
                </Button>
              ) : (
                <Button
                  onClick={handleConnect}
                  size="sm"
                  className="gradient-primary text-primary-foreground shadow-[var(--glow-primary)] hover:opacity-90 gap-2"
                >
                  {connecting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Wallet className="w-4 h-4" />
                  )}
                  <span className="hidden sm:inline">{connecting ? "Connecting..." : "Connect Pera Wallet"}</span>
                  <span className="sm:hidden">{connecting ? "..." : "Connect"}</span>
                </Button>
              )}

              {/* Wallet dropdown */}
              <AnimatePresence>
                {walletDropdown && connected && (
                  <motion.div
                    initial={{ opacity: 0, y: -5, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -5, scale: 0.97 }}
                    className="absolute right-0 top-full mt-2 w-80 glass-card p-4 space-y-3 z-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                          <CircleDot className="w-4 h-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">{shortAddr}</p>
                          <p className="text-[10px] text-muted-foreground">{network}</p>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button onClick={copyAddress} className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <Copy className="w-3.5 h-3.5 text-muted-foreground" />
                        </button>
                        <a href="#" className="p-1.5 rounded-lg hover:bg-secondary transition-colors">
                          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                        </a>
                      </div>
                    </div>

                    <div className="border-t border-border pt-3 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">ALGO Balance</span>
                        <span className="font-semibold text-foreground">{algoBalance.toFixed(2)} ALGO</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <IndianRupee className="w-3 h-3" /> INR Balance
                        </span>
                        <span className="font-semibold text-foreground">₹{inrBalance.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Portfolio</span>
                        <span className="font-semibold text-primary">{portfolioValue.toLocaleString()} ALGO</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Open Positions</span>
                        <span className="font-semibold text-foreground">{openPositions}</span>
                      </div>
                    </div>

                    <Button
                      onClick={() => { setFundsOpen(true); setWalletDropdown(false); }}
                      variant="secondary"
                      size="sm"
                      className="w-full border border-primary/20 text-primary hover:bg-primary/10 gap-2"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Add / Withdraw Funds
                    </Button>

                    <Button
                      onClick={handleDisconnect}
                      variant="secondary"
                      size="sm"
                      className="w-full border border-destructive/20 text-destructive hover:bg-destructive/10 gap-2"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Disconnect
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

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
            {connected && (
              <div className="flex flex-col gap-2 py-2 border-t border-border">
                <div className="flex items-center gap-2">
                  <Briefcase className="w-3.5 h-3.5 text-primary" />
                  <span className="text-xs text-foreground">{portfolioValue.toLocaleString()} ALGO · {openPositions} positions</span>
                </div>
                <Button
                  onClick={() => { setFundsOpen(true); setMobileOpen(false); }}
                  variant="secondary"
                  size="sm"
                  className="border border-primary/20 text-primary gap-2"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  Add / Withdraw Funds
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </nav>

      <FundsModal open={fundsOpen} onOpenChange={setFundsOpen} />
    </>
  );
};

export default Navbar;
