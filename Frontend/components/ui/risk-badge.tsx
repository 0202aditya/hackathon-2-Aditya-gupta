import { ShieldAlert, AlertTriangle, CheckCircle2, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type RiskLevel = "high" | "medium" | "low";

interface RiskConfigItem {
  badgeClass: string;
  defaultLabel: string;
  icon: LucideIcon;
}

const RISK_CONFIG: Record<RiskLevel, RiskConfigItem> = {
  high: {
    badgeClass: "badge-risk-high",
    defaultLabel: "High risk",
    icon: ShieldAlert,
  },
  medium: {
    badgeClass: "badge-risk-medium",
    defaultLabel: "Medium risk",
    icon: AlertTriangle,
  },
  low: {
    badgeClass: "badge-risk-low",
    defaultLabel: "Low risk",
    icon: CheckCircle2,
  },
};

export interface RiskBadgeProps {
  level: RiskLevel;
  label?: string;
  score?: number;
  showIcon?: boolean;
  className?: string;
}

export function RiskBadge({
  level,
  label,
  score,
  showIcon = true,
  className,
}: RiskBadgeProps) {
  const config = RISK_CONFIG[level] ?? RISK_CONFIG.low;
  const Icon = config.icon;
  const displayLabel = label || config.defaultLabel;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm leading-5 font-sans font-bold border",
        config.badgeClass,
        className
      )}
      aria-label={`${displayLabel}${score !== undefined ? ` (Score: ${score})` : ""}`}
    >
      {showIcon && (
        <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} aria-hidden="true" />
      )}
      <span>{displayLabel}</span>
      {score !== undefined && (
        <span className="opacity-80 font-normal ml-0.5">({score})</span>
      )}
    </span>
  );
}
