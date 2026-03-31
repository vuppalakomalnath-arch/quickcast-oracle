import type { OracleSource } from "@/data/mockData";
import { Shield, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface OraclePanelProps {
  sources: OracleSource[];
}

const OraclePanel = ({ sources }: OraclePanelProps) => {
  const resolved = sources.filter(s => s.result !== "PENDING");
  const agreement = resolved.length > 0
    ? Math.round((resolved.filter(s => s.result === resolved[0].result).length / resolved.length) * 100)
    : 0;
  const avgConfidence = Math.round(sources.reduce((a, s) => a + s.confidence, 0) / sources.length);
  const confidenceLevel = avgConfidence >= 90 ? "High" : avgConfidence >= 70 ? "Medium" : "Low";
  const confidenceColor = avgConfidence >= 90 ? "text-success" : avgConfidence >= 70 ? "text-warning" : "text-no";

  return (
    <div className="glass-card p-5 space-y-4">
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5 text-accent" />
        <h3 className="font-display font-semibold text-foreground">Oracle Confidence Engine</h3>
      </div>

      <div className="space-y-3">
        {sources.map((source, i) => (
          <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50">
            <div className="flex items-center gap-2">
              {source.result === "PENDING" ? (
                <Clock className="w-4 h-4 text-muted-foreground" />
              ) : source.result === "YES" ? (
                <CheckCircle className="w-4 h-4 text-success" />
              ) : (
                <AlertCircle className="w-4 h-4 text-no" />
              )}
              <span className="text-sm text-foreground">{source.name}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-xs font-medium ${source.result === "YES" ? "text-success" : source.result === "NO" ? "text-no" : "text-muted-foreground"}`}>
                {source.result}
              </span>
              <span className="text-xs text-muted-foreground">{source.confidence}%</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border">
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Agreement</p>
          <p className="text-lg font-display font-bold text-foreground">{resolved.length > 0 ? `${agreement}%` : "—"}</p>
        </div>
        <div className="text-center">
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1">Confidence</p>
          <p className={`text-lg font-display font-bold ${confidenceColor}`}>{confidenceLevel}</p>
        </div>
      </div>

      <div className="p-3 rounded-lg bg-accent/10 border border-accent/20 text-center">
        <p className="text-xs text-muted-foreground mb-1">Final Resolution</p>
        <p className="text-sm font-medium text-accent">Awaiting oracle consensus...</p>
      </div>
    </div>
  );
};

export default OraclePanel;
