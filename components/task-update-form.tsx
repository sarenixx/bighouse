"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import type { TaskItem } from "@/lib/types";
import { Button } from "@/components/ui/button";

export function TaskUpdateForm({ task }: { task: TaskItem }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [form, setForm] = useState({
    status: task.status,
    owner: task.owner,
    dueDate: task.dueDate,
    decisionNeeded: task.decisionNeeded
  });

  const save = async () => {
    await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    startTransition(() => router.refresh());
  };

  return (
    <div className="mt-3 grid gap-3 md:grid-cols-4 text-sm text-muted-foreground">
      <label className="space-y-1">
        <span>Status</span>
        <select className="h-10 w-full rounded-full border border-border bg-white px-4 text-sm outline-none" value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskItem["status"] }))}>
          <option value="Open">Open</option>
          <option value="In progress">In progress</option>
          <option value="Complete">Complete</option>
        </select>
      </label>
      <label className="space-y-1">
        <span>Owner</span>
        <input className="h-10 w-full rounded-full border border-border bg-white px-4 text-sm outline-none" value={form.owner} onChange={(event) => setForm((current) => ({ ...current, owner: event.target.value }))} />
      </label>
      <label className="space-y-1">
        <span>Due date</span>
        <input data-testid={`task-due-date-${task.id}`} type="date" className="h-10 w-full rounded-full border border-border bg-white px-4 text-sm outline-none" value={form.dueDate} onChange={(event) => setForm((current) => ({ ...current, dueDate: event.target.value }))} />
      </label>
      <div className="flex items-end">
        <Button data-testid={`task-save-${task.id}`} className="w-full" size="sm" onClick={save} disabled={isPending}>
          {isPending ? "Saving..." : "Update task"}
        </Button>
      </div>
      <label className="space-y-1 md:col-span-4">
        <span>Decision needed</span>
        <input data-testid={`task-decision-${task.id}`} className="h-10 w-full rounded-full border border-border bg-white px-4 text-sm outline-none" value={form.decisionNeeded} onChange={(event) => setForm((current) => ({ ...current, decisionNeeded: event.target.value }))} />
      </label>
    </div>
  );
}
