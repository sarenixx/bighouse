import Link from "next/link";
import { LockKeyhole, ShieldCheck, Sparkles } from "lucide-react";

import { LoginForm } from "@/components/login-form";
import { Card, CardContent } from "@/components/ui/card";

const trustSignals = [
  "Portfolio-level visibility without replacing property managers",
  "Trustee-ready reporting and issue documentation",
  "Coordinated oversight across lenders, CPAs, brokers, and specialists"
];

export default async function LoginPage({
  searchParams
}: {
  searchParams: Promise<{ from?: string }>;
}) {
  const params = await searchParams;

  return (
    <div className="min-h-screen px-4 py-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] max-w-[1500px] gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card className="data-grid relative overflow-hidden rounded-[2.25rem] border-white/70">
          <CardContent className="flex h-full flex-col justify-between p-8 lg:p-10">
            <div>
              <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Amseta Oversight</div>
              <h1 className="mt-6 max-w-2xl font-serif text-5xl leading-tight tracking-tight text-primary lg:text-6xl">
                Private portfolio oversight for owners who already have operators.
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-muted-foreground">
                A white-glove monitoring layer for trustees, family offices, and owner representatives who need consolidated visibility, sharper accountability, and cleaner executive reporting.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {trustSignals.map((signal) => (
                <div key={signal} className="rounded-[1.5rem] border border-white/70 bg-white/75 p-5 text-sm text-muted-foreground">
                  {signal}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2.25rem] border-white/70">
          <CardContent className="flex h-full flex-col justify-between p-8 lg:p-10">
            <div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                <LockKeyhole className="h-4 w-4" />
                Secure client entry
              </div>
              <h2 className="mt-4 font-serif text-3xl tracking-tight text-primary">Enter the oversight portal</h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                This mock access screen is designed for a client-facing demo. It frames the product as a premium service portal rather than a manager-facing software tool.
              </p>

              <LoginForm redirectTo={params.from} />
            </div>

            <div className="space-y-3">
              <div className="rounded-[1.5rem] border border-border/70 bg-secondary/50 p-4">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                  Why this entry experience matters
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  It positions the service as a trusted owner portal with curated oversight outputs, not another proptech operating system.
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                Demo shortcut: use the dashboard entry above, or open the <Link href="/demo" className="font-medium text-foreground">guided demo script</Link> for a narrated walkthrough.
              </div>
              <div className="rounded-[1.5rem] border border-border/70 bg-white/70 p-4 text-sm text-muted-foreground">
                Access is provisioned per environment. Use the credentials issued for your demo tenant rather than shared source-level defaults.
              </div>
              <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5" />
                White-label ready for family office branding
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
