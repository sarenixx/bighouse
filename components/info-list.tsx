import { ChevronRight } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function InfoList({
  title,
  description,
  items
}: {
  title: string;
  description?: string;
  items: Array<{ title: string; detail: string; meta?: string; tone?: "good" | "watch" | "alert" | "neutral" }>;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div key={item.title} className="flex items-start justify-between gap-3 rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
            <div className="space-y-1">
              <div className="font-medium text-foreground">{item.title}</div>
              <div className="text-sm text-muted-foreground">{item.detail}</div>
            </div>
            <div className="flex items-center gap-2">
              {item.meta ? <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{item.meta}</div> : null}
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
