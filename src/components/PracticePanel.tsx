import { Wallet, TrendingUp, ShieldCheck, Trophy, SearchCheck } from "lucide-react";

const steps = [
  {
    icon: Wallet,
    title: "1. Connect Wallet",
    desc: "Connect your Pera Wallet to start interacting with live prediction markets.",
  },
  {
    icon: TrendingUp,
    title: "2. Pick a Market",
    desc: "Choose a live market and take a YES or NO position based on your forecast.",
  },
  {
    icon: SearchCheck,
    title: "3. Dynamic Pricing",
    desc: "Prices update instantly as users place positions, simulating market movement.",
  },
  {
    icon: ShieldCheck,
    title: "4. Oracle Resolution",
    desc: "Multiple trusted sources are compared to generate a transparent final outcome.",
  },
  {
    icon: Trophy,
    title: "5. Claim Rewards",
    desc: "Winning users can claim their rewards once the market reaches final resolution.",
  },
];

const PracticePanel = () => {
  return (
    <section className="pb-16 px-4">
      <div className="container mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-display font-bold text-2xl md:text-3xl text-foreground mb-3">
            How QuickCast Works
          </h2>
          <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
            A simple demo flow to help users and judges understand how the platform works from trade to oracle-based resolution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="glass-card-hover p-5 text-center space-y-3">
                <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center mx-auto">
                  <Icon className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-foreground text-sm">
                  {step.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {step.desc}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PracticePanel;
