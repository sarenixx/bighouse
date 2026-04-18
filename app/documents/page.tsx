import { AppShell } from "@/components/app-shell";
import { DocumentUploadForm } from "@/components/document-upload-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentTenantDataset } from "@/lib/server/portfolio-service";
import { formatDate } from "@/lib/utils";

const groups = [
  "Property Manager Report",
  "Financial Statement",
  "Lease",
  "Lender Doc",
  "Tax Doc",
  "Insurance Doc",
  "Inspection Report",
  "Trustee Memo"
] as const;

export default async function DocumentsPage() {
  const { dataset } = await getCurrentTenantDataset();

  return (
    <AppShell
      title="Documents"
      subtitle="Centralized portfolio reporting, leases, lender material, tax files, insurance documents, and trustee memoranda."
    >
      <div className="space-y-6">
        <DocumentUploadForm properties={dataset.properties} />
        <div className="grid gap-6 xl:grid-cols-2">
        {groups.map((group) => (
          <Card key={group}>
            <CardHeader>
              <CardTitle>{group}s</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {dataset.documents.filter((document) => document.category === group).map((document) => (
                <div key={document.id} className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-medium text-foreground">{document.title}</div>
                    <div className="text-xs uppercase tracking-[0.16em] text-muted-foreground">{document.status}</div>
                  </div>
                  <div className="mt-2 text-sm text-muted-foreground">
                    {document.source} · updated {formatDate(document.updatedAt)}
                  </div>
                  {document.fileUrl ? (
                    <a
                      href={document.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-block text-sm font-medium text-primary"
                    >
                      Open file
                    </a>
                  ) : null}
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
        </div>
      </div>
    </AppShell>
  );
}
