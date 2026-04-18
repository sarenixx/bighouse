import { AppShell } from "@/components/app-shell";
import { TaskUpdateForm } from "@/components/task-update-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantDataset } from "@/lib/server/portfolio-service";
import { formatDate } from "@/lib/utils";

const cadences = ["Monthly", "Quarterly", "Annual", "Trustee"] as const;

export default async function TasksPage() {
  const { dataset } = await getCurrentTenantDataset();

  return (
    <AppShell
      title="Tasks & Reviews"
      subtitle="Operationalize monthly, quarterly, annual, and fiduciary review work so exceptions are documented and decisions do not drift."
    >
      <div className="space-y-6">
        {cadences.map((cadence) => (
          <Card key={cadence}>
            <CardHeader>
              <CardTitle>{cadence} review tasks</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataset.tasks.filter((task) => task.cadence === cadence).map((task) => {
                const property = dataset.properties.find((item) => item.id === task.propertyId);
                const provider = dataset.providers.find((item) => item.id === task.providerId);
                return (
                  <div key={task.id} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                    <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                      <div>
                        <div className="font-medium text-foreground">{task.title}</div>
                        <div className="text-sm text-muted-foreground">
                          {property?.name ?? "Portfolio-wide"} {provider ? `· ${provider.name}` : ""}
                        </div>
                      </div>
                      <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">
                        {task.status} · due {formatDate(task.dueDate)}
                      </div>
                    </div>
                    <div className="mt-3 grid gap-3 md:grid-cols-3 text-sm text-muted-foreground">
                      <div>Assigned owner: {task.owner}</div>
                      <div>Decision needed: {task.decisionNeeded}</div>
                      <div>Cadence: {task.cadence}</div>
                    </div>
                    <TaskUpdateForm task={task} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
