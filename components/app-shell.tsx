"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, Building2, FileStack, FolderOpen, LayoutDashboard, Menu, Settings2, ShieldCheck, Sparkles, Users2, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { SessionControls } from "@/components/session-controls";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const navigation = [
  { label: "Portfolio Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/properties", icon: Building2 },
  { label: "Managers / Vendors", href: "/managers", icon: Users2 },
  { label: "Tasks & Reviews", href: "/tasks", icon: ShieldCheck },
  { label: "Reporting", href: "/reporting", icon: FileStack },
  { label: "Documents", href: "/documents", icon: FolderOpen },
  { label: "Settings", href: "/settings", icon: Settings2 }
];

export function AppShell({
  children,
  title,
  subtitle,
  action,
  chromeHiddenOnPrint = false
}: {
  children: React.ReactNode;
  title: string;
  subtitle: string;
  action?: React.ReactNode;
  chromeHiddenOnPrint?: boolean;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className={cn("min-h-screen", chromeHiddenOnPrint && "print:bg-white")}>
      <div className="mx-auto flex max-w-[1700px] gap-4 p-4 lg:p-6">
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-40 w-[290px] -translate-x-full transition-transform duration-300 lg:static lg:translate-x-0",
            chromeHiddenOnPrint && "print:hidden",
            open && "translate-x-0"
          )}
        >
          <Card className="data-grid flex h-full flex-col justify-between rounded-[2rem] p-4">
            <div className="space-y-6">
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Amseta</div>
                  <div className="mt-2 font-serif text-2xl text-primary">Oversight</div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Trust, but verify across managers, lenders, and specialists.
                  </p>
                </div>
                <Button className="lg:hidden" variant="ghost" size="sm" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="rounded-[1.35rem] border border-white/70 bg-white/75 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                  <Sparkles className="h-3.5 w-3.5" />
                  Presentation mode
                </div>
                <p className="mt-3 text-sm text-foreground">
                  Use the demo script and trustee report preview when presenting the product to families, trustees, or family office teams.
                </p>
                <div className="mt-4 flex gap-2">
                  <Button asChild size="sm" variant="secondary">
                    <Link href="/demo">Demo script</Link>
                  </Button>
                  <Button asChild size="sm" variant="ghost">
                    <Link href="/login">Client entry</Link>
                  </Button>
                </div>
              </div>

              <nav className="space-y-1">
                {navigation.map((item) => {
                  const active =
                    item.href === "/" ? pathname === item.href : pathname === item.href || pathname.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-colors",
                        active
                          ? "bg-primary text-primary-foreground shadow-soft"
                          : "text-muted-foreground hover:bg-white/70 hover:text-foreground"
                      )}
                      onClick={() => setOpen(false)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
            </div>

            <div className="rounded-[1.5rem] border border-white/70 bg-white/70 p-4">
              <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground">Concierge Workflow</div>
              <p className="mt-3 text-sm text-foreground">
                4 escalations need owner attention this week. Two relate to fees, one to refinance timing, and one to capex scope.
              </p>
            </div>
          </Card>
        </aside>

        {open ? (
          <button
            className="fixed inset-0 z-30 bg-slate-950/20 lg:hidden"
            onClick={() => setOpen(false)}
            aria-label="Close navigation"
          />
        ) : null}

        <div className="min-w-0 flex-1">
          <header
            className={cn(
              "mb-6 rounded-[2rem] border border-white/60 bg-white/70 px-5 py-4 shadow-panel backdrop-blur-sm md:px-7",
              chromeHiddenOnPrint && "print:hidden"
            )}
          >
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-start gap-3">
                <Button className="lg:hidden" variant="outline" size="sm" onClick={() => setOpen(true)}>
                  <Menu className="mr-2 h-4 w-4" />
                  Menu
                </Button>
                <div>
                  <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Owner oversight dashboard</div>
                  <h1 className="mt-1 font-serif text-3xl tracking-tight text-primary">{title}</h1>
                  <p className="mt-1 max-w-3xl text-sm text-muted-foreground">{subtitle}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <SessionControls />
                <Button asChild variant="ghost" size="sm">
                  <Link href="/reporting/trustee-report">Preview trustee report</Link>
                </Button>
                {action}
                <div className="flex items-center gap-2 rounded-full border border-border bg-white/80 px-4 py-2.5 text-sm text-muted-foreground">
                  <Bell className="h-4 w-4" />
                  6 active alerts
                </div>
              </div>
            </div>
          </header>

          <main className={cn(chromeHiddenOnPrint && "print:m-0")}>{children}</main>
        </div>
      </div>
    </div>
  );
}
