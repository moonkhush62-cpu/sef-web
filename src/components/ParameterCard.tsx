import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { ParameterResult } from "@/lib/phishingAnalyzer";

const statusConfig = {
  safe: {
    icon: ShieldCheck,
    label: "Safe",
    bg: "bg-safe/10",
    border: "border-safe/30",
    text: "text-safe",
    glow: "glow-safe",
  },
  suspicious: {
    icon: ShieldAlert,
    label: "Warning",
    bg: "bg-warning/10",
    border: "border-warning/30",
    text: "text-warning",
    glow: "glow-warning",
  },
  danger: {
    icon: ShieldX,
    label: "Danger",
    bg: "bg-danger/10",
    border: "border-danger/30",
    text: "text-danger",
    glow: "glow-danger",
  },
};

interface ParameterCardProps {
  result: ParameterResult;
  index: number;
}

const ParameterCard = ({ result, index }: ParameterCardProps) => {
  const config = statusConfig[result.status];
  const Icon = config.icon;

  return (
    <div
      className={`animate-fade-in-up rounded-lg border ${config.border} ${config.bg} p-4 transition-all hover:scale-[1.02]`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 rounded-md p-1.5 ${config.bg} ${config.glow}`}>
          <Icon className={`h-4 w-4 ${config.text}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-semibold text-foreground text-sm">{result.name}</h3>
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${config.bg} ${config.text} border ${config.border}`}>
              {config.label}
            </span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{result.description}</p>
          <p className={`mt-2 text-xs ${config.text} font-medium`}>{result.detail}</p>
        </div>
      </div>
    </div>
  );
};

export default ParameterCard;
