import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { ScanResultData } from "@/lib/phishingAnalyzer";
import ParameterCard from "./ParameterCard";

const verdictConfig = {
  Legitimate: {
    icon: ShieldCheck,
    color: "text-safe",
    bg: "bg-safe/10",
    border: "border-safe/40",
    glow: "glow-safe",
    message: "This URL appears to be legitimate.",
  },
  Suspicious: {
    icon: ShieldAlert,
    color: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/40",
    glow: "glow-warning",
    message: "This URL has some suspicious indicators. Proceed with caution.",
  },
  Phishing: {
    icon: ShieldX,
    color: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/40",
    glow: "glow-danger",
    message: "This URL is likely a phishing attempt. Do NOT visit this site.",
  },
};

interface ScanResultProps {
  result: ScanResultData;
}

const ScanResult = ({ result }: ScanResultProps) => {
  const config = verdictConfig[result.verdict];
  const Icon = config.icon;
  const maxScore = 6;
  const percentage = Math.min((result.totalScore / maxScore) * 100, 100);

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Verdict Banner */}
      <div className={`rounded-xl border ${config.border} ${config.bg} ${config.glow} p-6 text-center`}>
        <Icon className={`mx-auto h-12 w-12 ${config.color}`} />
        <h2 className={`mt-3 text-2xl font-bold ${config.color}`}>{result.verdict}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{config.message}</p>

        {/* Score Bar */}
        <div className="mx-auto mt-4 max-w-xs">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Risk Score</span>
            <span>{result.totalScore} / {maxScore}</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-1000 ease-out ${
                result.verdict === "Legitimate"
                  ? "bg-safe"
                  : result.verdict === "Suspicious"
                  ? "bg-warning"
                  : "bg-danger"
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Scanned URL */}
      <div className="rounded-lg border border-border bg-secondary/50 p-3">
        <p className="text-xs text-muted-foreground mb-1">Scanned URL</p>
        <p className="text-sm text-foreground font-mono break-all">{result.url}</p>
      </div>

      {/* Parameter Cards */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Analysis Details</h3>
        {result.parameters.map((param, i) => (
          <ParameterCard key={param.name} result={param} index={i} />
        ))}
      </div>
    </div>
  );
};

export default ScanResult;
