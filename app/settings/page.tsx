import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const settingsGroups = [
  {
    title: "Portfolio settings",
    items: ["Default reporting currency: USD", "Portfolio review timezone: Eastern Time", "Reporting period closes on the 10th business day"]
  },
  {
    title: "Review cadences",
    items: ["Monthly manager review", "Quarterly debt and tax review", "Annual site visit and insurance review"]
  },
  {
    title: "KPI thresholds",
    items: ["Occupancy alert below 90%", "Turn time alert above 35 days", "NOI variance alert below -3%"]
  },
  {
    title: "Risk alert thresholds",
    items: ["Escalate refinance maturities within 12 months", "Flag fee increases above 5%", "Flag capex variance above 8%"]
  },
  {
    title: "Branding / white-label",
    items: ["Client-facing trustee packet cover page", "Family office logo lockup", "Board-ready neutral theme"]
  },
  {
    title: "Team members and roles",
    items: ["Trust officer", "Owner representative", "Controller", "Tax director", "Capital markets lead"]
  }
];

export default function SettingsPage() {
  return (
    <AppShell title="Settings" subtitle="Calibrate oversight rules, review cadence, white-label branding, and the internal team structure.">
      <div className="grid gap-6 xl:grid-cols-2">
        {settingsGroups.map((group) => (
          <Card key={group.title}>
            <CardHeader>
              <CardTitle>{group.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {group.items.map((item) => (
                <div key={item} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
