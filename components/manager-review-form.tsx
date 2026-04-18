"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export function ManagerReviewForm({
  propertyId,
  reviewerNotes,
  feeNotes,
  annualSiteVisitComplete
}: {
  propertyId: string;
  reviewerNotes: string;
  feeNotes: string;
  annualSiteVisitComplete: boolean;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    reviewerNotes,
    feeNotes,
    annualSiteVisitComplete
  });
  const [message, setMessage] = useState<string | null>(null);

  const save = async () => {
    setMessage(null);
    const response = await fetch(`/api/property-records/${propertyId}/manager-review`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) {
      setMessage("Unable to save manager review notes.");
      return;
    }

    startTransition(() => {
      setMessage("Saved.");
      router.refresh();
    });
  };

  return (
    <div className="rounded-[1.25rem] border border-border/70 bg-white/70 p-4 md:col-span-2 xl:col-span-3">
      <div className="font-medium text-foreground">Update review narrative</div>
      <div className="mt-3 grid gap-4 md:grid-cols-2">
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">Reviewer notes</span>
          <textarea
            className="min-h-28 w-full rounded-[1.25rem] border border-border bg-white px-4 py-3 outline-none"
            value={form.reviewerNotes}
            onChange={(event) => setForm((current) => ({ ...current, reviewerNotes: event.target.value }))}
          />
        </label>
        <label className="space-y-2 text-sm">
          <span className="text-muted-foreground">Fee notes</span>
          <textarea
            className="min-h-28 w-full rounded-[1.25rem] border border-border bg-white px-4 py-3 outline-none"
            value={form.feeNotes}
            onChange={(event) => setForm((current) => ({ ...current, feeNotes: event.target.value }))}
          />
        </label>
      </div>
      <label className="mt-4 flex items-center gap-3 text-sm text-muted-foreground">
        <input
          type="checkbox"
          checked={form.annualSiteVisitComplete}
          onChange={(event) =>
            setForm((current) => ({
              ...current,
              annualSiteVisitComplete: event.target.checked
            }))
          }
        />
        Annual site visit completed
      </label>
      <div className="mt-4 flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{message}</div>
        <Button onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Save review update"}
        </Button>
      </div>
    </div>
  );
}
