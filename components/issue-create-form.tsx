"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import type { Property } from "@/lib/types";

export function IssueCreateForm({ properties }: { properties: Property[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    propertyId: properties[0]?.id ?? "",
    title: "",
    detail: "",
    severity: "elevated",
    category: "reporting",
    owner: "Owner rep",
    dueDate: "2026-04-30",
    status: "Open"
  });
  const [error, setError] = useState<string | null>(null);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/issues", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Unable to create issue.");
      return;
    }

    startTransition(() => {
      setIsOpen(false);
      setForm((current) => ({ ...current, title: "", detail: "" }));
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Button variant={isOpen ? "outline" : "secondary"} onClick={() => setIsOpen((value) => !value)}>
        <Plus className="mr-2 h-4 w-4" />
        {isOpen ? "Close issue form" : "Log new issue"}
      </Button>
      {isOpen ? (
        <form className="grid gap-3 rounded-[1.5rem] border border-border/70 bg-white/75 p-4" onSubmit={submit}>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Property</span>
            <select
              className="h-11 w-full rounded-full border border-border bg-white px-4 text-sm outline-none"
              value={form.propertyId}
              onChange={(event) => setForm((current) => ({ ...current, propertyId: event.target.value }))}
            >
              {properties.map((property) => (
                <option key={property.id} value={property.id}>
                  {property.name}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Issue title</span>
            <input
              className="h-11 w-full rounded-full border border-border bg-white px-4 text-sm outline-none"
              value={form.title}
              onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="text-muted-foreground">Detail</span>
            <textarea
              className="min-h-24 w-full rounded-[1.25rem] border border-border bg-white px-4 py-3 text-sm outline-none"
              value={form.detail}
              onChange={(event) => setForm((current) => ({ ...current, detail: event.target.value }))}
            />
          </label>
          <div className="grid gap-3 md:grid-cols-3">
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Severity</span>
              <select className="h-11 w-full rounded-full border border-border bg-white px-4 text-sm outline-none" value={form.severity} onChange={(event) => setForm((current) => ({ ...current, severity: event.target.value }))}>
                <option value="moderate">Moderate</option>
                <option value="elevated">Elevated</option>
                <option value="critical">Critical</option>
                <option value="low">Low</option>
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Category</span>
              <select className="h-11 w-full rounded-full border border-border bg-white px-4 text-sm outline-none" value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}>
                {["reporting", "fees", "leasing", "capex", "debt", "vacancy"].map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="text-muted-foreground">Due date</span>
              <input type="date" className="h-11 w-full rounded-full border border-border bg-white px-4 text-sm outline-none" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
            </label>
          </div>
          {error ? <div className="text-sm text-rose-700">{error}</div> : null}
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Create issue"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
