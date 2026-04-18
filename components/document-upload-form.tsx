"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { Property, DocumentRecord } from "@/lib/types";

const categories: DocumentRecord["category"][] = [
  "Property Manager Report",
  "Financial Statement",
  "Lease",
  "Lender Doc",
  "Tax Doc",
  "Insurance Doc",
  "Inspection Report",
  "Trustee Memo"
];

export function DocumentUploadForm({
  properties,
  initialPropertyId
}: {
  properties: Property[];
  initialPropertyId?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setMessage(null);
    const formData = new FormData(event.currentTarget);
    const response = await fetch("/api/documents", {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setMessage(payload?.error ?? "Unable to upload document.");
      return;
    }

    startTransition(() => {
      setMessage("Uploaded.");
      event.currentTarget.reset();
      router.refresh();
    });
  };

  return (
    <form className="space-y-4 rounded-[1.5rem] border border-border/70 bg-white/75 p-5" onSubmit={submit}>
      <div className="flex items-center gap-2 text-sm font-medium text-foreground">
        <Upload className="h-4 w-4 text-muted-foreground" />
        Upload document
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <input name="title" className="h-11 rounded-full border border-border bg-white px-4 text-sm outline-none" placeholder="Document title" />
        <input name="source" className="h-11 rounded-full border border-border bg-white px-4 text-sm outline-none" placeholder="Source / uploader" defaultValue="BigHouse Oversight" />
        <select name="category" className="h-11 rounded-full border border-border bg-white px-4 text-sm outline-none" defaultValue="Property Manager Report">
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        <select name="status" className="h-11 rounded-full border border-border bg-white px-4 text-sm outline-none" defaultValue="Needs review">
          <option value="Current">Current</option>
          <option value="Needs review">Needs review</option>
          <option value="Awaiting upload">Awaiting upload</option>
        </select>
        <select
          name="propertyId"
          className="h-11 rounded-full border border-border bg-white px-4 text-sm outline-none"
          defaultValue={initialPropertyId ?? ""}
        >
          <option value="">Portfolio-level document</option>
          {properties.map((property) => (
            <option key={property.id} value={property.id}>
              {property.name}
            </option>
          ))}
        </select>
        <input name="file" type="file" className="h-11 rounded-full border border-border bg-white px-4 py-2 text-sm outline-none" />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm text-muted-foreground">{message}</div>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Uploading..." : "Save document"}
        </Button>
      </div>
    </form>
  );
}
