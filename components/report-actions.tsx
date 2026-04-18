"use client";

import { useState, useTransition } from "react";
import { Check, Download, Printer, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ReportActions({ downloadUrl }: { downloadUrl: string }) {
  const [shareLabel, setShareLabel] = useState("Share");
  const [exported, setExported] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handlePrint = () => {
    window.print();
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setShareLabel("Link copied");
      window.setTimeout(() => setShareLabel("Share"), 1800);
    } catch {
      setShareLabel("Copy failed");
      window.setTimeout(() => setShareLabel("Share"), 1800);
    }
  };

  const handleExport = () => {
    startTransition(() => {
      setExported(true);
      window.open(downloadUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => setExported(false), 2200);
    });
  };

  return (
    <div className="flex flex-wrap gap-2 print:hidden">
      <Button variant="outline" onClick={handlePrint}>
        <Printer className="mr-2 h-4 w-4" />
        Print
      </Button>
      <Button variant="outline" onClick={handleShare}>
        <Share2 className="mr-2 h-4 w-4" />
        {shareLabel}
      </Button>
      <Button onClick={handleExport} disabled={isPending}>
        {exported ? <Check className="mr-2 h-4 w-4" /> : <Download className="mr-2 h-4 w-4" />}
        {exported ? "Prepared for export" : "Export PDF"}
      </Button>
    </div>
  );
}
