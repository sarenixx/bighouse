"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

interface SessionPayload {
  authenticated: boolean;
  session?: {
    tenantName: string;
    user: {
      name: string;
      role: string;
    };
  };
}

export function SessionControls() {
  const router = useRouter();
  const [data, setData] = useState<SessionPayload | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let active = true;

    fetch("/api/session", { cache: "no-store" })
      .then((response) => response.json() as Promise<SessionPayload>)
      .then((payload) => {
        if (active) setData(payload);
      })
      .catch(() => {
        if (active) setData({ authenticated: false });
      });

    return () => {
      active = false;
    };
  }, []);

  if (!data?.authenticated || !data.session) {
    return null;
  }

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    startTransition(() => {
      router.push("/login");
      router.refresh();
    });
  };

  return (
    <>
      <div className="rounded-full border border-border bg-white/80 px-4 py-2.5 text-sm text-muted-foreground">
        {data.session.user.name} · {data.session.user.role}
      </div>
      <Button data-testid="logout-button" variant="outline" size="sm" onClick={handleLogout} disabled={isPending}>
        <LogOut className="mr-2 h-4 w-4" />
        Sign out
      </Button>
    </>
  );
}
