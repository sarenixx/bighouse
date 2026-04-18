import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  delta,
  tone = "neutral",
  detail
}: {
  label: string;
  value: string;
  delta?: string;
  tone?: "neutral" | "good" | "watch" | "alert";
  detail?: string;
}) {
  const icon =
    tone === "good" ? (
      <ArrowUpRight className="h-4 w-4" />
    ) : tone === "alert" ? (
      <ArrowDownRight className="h-4 w-4" />
    ) : (
      <Minus className="h-4 w-4" />
    );

  return (
    <Card className="overflow-hidden">
      <CardContent className="space-y-4 p-5">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{label}</div>
        <div className="text-3xl font-semibold tracking-tight text-primary">{value}</div>
        <div className="flex items-center justify-between gap-3 text-sm">
          {delta ? (
            <div
              className={cn("flex items-center gap-1", {
                "text-emerald-700": tone === "good",
                "text-amber-700": tone === "watch",
                "text-rose-700": tone === "alert",
                "text-muted-foreground": tone === "neutral"
              })}
            >
              {icon}
              <span>{delta}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">Current view</span>
          )}
          {detail ? <span className="text-right text-muted-foreground">{detail}</span> : null}
        </div>
      </CardContent>
    </Card>
  );
}
