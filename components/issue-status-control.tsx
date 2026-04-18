"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export function IssueStatusControl({
  issueId,
  status
}: {
  issueId: string;
  status: "Open" | "Watching" | "Escalated";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <select
      className="rounded-full border border-border bg-white px-3 py-1.5 text-xs uppercase tracking-[0.12em] text-muted-foreground outline-none"
      value={status}
      disabled={isPending}
      onChange={async (event) => {
        await fetch(`/api/issues/${issueId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: event.target.value })
        });
        startTransition(() => router.refresh());
      }}
    >
      <option value="Open">Open</option>
      <option value="Watching">Watching</option>
      <option value="Escalated">Escalated</option>
    </select>
  );
}
