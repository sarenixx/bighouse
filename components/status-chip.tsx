import { AlertTriangle, CheckCircle2, Clock3, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { RiskLevel, StatusTone } from "@/lib/types";

export function RiskBadge({ risk }: { risk: RiskLevel }) {
  if (risk === "critical") return <Badge variant="alert">Critical</Badge>;
  if (risk === "elevated") return <Badge variant="watch">Elevated</Badge>;
  if (risk === "moderate") return <Badge variant="outline">Moderate</Badge>;
  return <Badge variant="good">Low risk</Badge>;
}

export function ToneBadge({ tone }: { tone: StatusTone }) {
  if (tone === "alert") return <Badge variant="alert">Needs attention</Badge>;
  if (tone === "watch") return <Badge variant="watch">Watch</Badge>;
  if (tone === "good") return <Badge variant="good">Strong</Badge>;
  return <Badge variant="neutral">Neutral</Badge>;
}

export function StatusIcon({ tone }: { tone: StatusTone }) {
  if (tone === "alert") return <ShieldAlert className="h-4 w-4 text-rose-600" />;
  if (tone === "watch") return <AlertTriangle className="h-4 w-4 text-amber-600" />;
  if (tone === "good") return <CheckCircle2 className="h-4 w-4 text-emerald-600" />;
  return <Clock3 className="h-4 w-4 text-slate-500" />;
}
