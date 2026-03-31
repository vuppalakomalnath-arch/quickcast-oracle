import type { OracleSource } from "@/data/mockData";
import { Shield, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface OraclePanelProps {
  sources: OracleSource[];
}

const OraclePanel = ({ sources }: OraclePanelProps) => {
  const resolved = sources.filter((s) => s.result !== "PENDING");

  const agreement =
    resolved.length > 0
      ? Math.round(
          (resolved.filter((s) => s.result === resolved[0].result).length /
            resolved.length) *
            100
        )
      : 0;

  const avgConfidence = Math.round(
    sources.reduce((a, s) => a + s.confidence, 0) / sources.length
  );

  const confidenceLevel =
    avgConfidence >= 90 ? "High" : avgConfidence >= 70 ? "Medium" : "Low";

  const confidenceColor =
    avgConfidence >= 90
      ? "text-success"
      : avgConfidence >= 70
      ? "text-warning"
      : "text-no";

  const finalOutcome =
    resolved.length > 0
      ? resolved.filter((s) => s.result === "YES").length >=
        resolved.filter((s) => s.result === "NO").length
        ? "YES"
        : "NO"
      : "PENDING";

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-accent" />
          <h3 className="font-display font-semibold text-foreground">
            Oracle Confidence Engine
          </h3>
        </div>
        <span className="text-[10px] px-2 py-1 rounded-full border border-primary/20 bg-primary/10 text-primary">
          Updated 2m ago
        </span>
      </div>

      <div className="space-y-3">
        {sources.map((source, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 border border-border"
          >
            <div className="flex items-center gap-2">
              {source.result === "PENDING" ? (
                <Clock className="w-4 h-4 text-muted-foreground" />
              ) : source.result === "YES" ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-no" />
              )}
              <div>
                <p className="text-sm text-foreground">{source.name}</p>
                <p className="text-[11px] text-muted-foreground">Verified source</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs font-semibold px-2 py-1 rounded-full ${
                  source.result === "YES"
                    ? "bg-success/10 text-success"
                    : source.result === "NO"
                    ? "bg-no/10 text-no"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {source.result}
              </span>
              <span className="text-xs text-muted-foreground">
                {source.confidence}%
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-2 pt-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Source Agreement</span>
          <span>{resolved.length > 0 ? `${agreement}%` : "—"}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-secondary overflow-hidden">
          <div
            className="h-full bg-success transition-all duration-500"
            style={{ width: `${agreement}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Confidence
          </p>
          <p className={`text-lg font-display font-bold ${confidenceColor}`}>
            {confidenceLevel}
          </p>
        </div>

        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
            Final Resolution
          </p>
          <p
            className={`text-lg font-display font-bold ${
              finalOutcome === "YES"
                ? "text-success"
                : finalOutcome === "NO"
                ? "text-no"
                : "text-muted-foreground"
            }`}
          >
            {finalOutcome}
          </p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20">
        <p className="text-xs text-accent font-medium mb-1">Transparency Layer</p>
        <p className="text-xs text-muted-foreground">
          QuickCast resolves markets using multi-source consensus instead of a single blind data feed.
        </p>
      </div>
    </div>
  );
};

export default OraclePanel;
