"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PropertyNoteForm({ propertyId }: { propertyId: string }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    author: "Owner rep",
    label: "Review Note",
    note: ""
  });

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const response = await fetch(`/api/property-records/${propertyId}/notes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });

    if (!response.ok) return;

    startTransition(() => {
      setForm((current) => ({ ...current, note: "" }));
      setIsOpen(false);
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Button variant={isOpen ? "outline" : "secondary"} size="sm" onClick={() => setIsOpen((value) => !value)}>
        <Plus className="mr-2 h-4 w-4" />
        {isOpen ? "Close note form" : "Add note"}
      </Button>
      {isOpen ? (
        <form className="space-y-3 rounded-[1.25rem] border border-border/70 bg-white/70 p-4" onSubmit={submit}>
          <div className="grid gap-3 md:grid-cols-2">
            <input
              className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
              value={form.author}
              onChange={(event) => setForm((current) => ({ ...current, author: event.target.value }))}
            />
            <input
              className="h-10 rounded-full border border-border bg-white px-4 text-sm outline-none"
              value={form.label}
              onChange={(event) => setForm((current) => ({ ...current, label: event.target.value }))}
            />
          </div>
          <textarea
            className="min-h-24 w-full rounded-[1.25rem] border border-border bg-white px-4 py-3 text-sm outline-none"
            value={form.note}
            onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
          />
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save note"}
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
