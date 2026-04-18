"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("trustee@halcyonfamilyoffice.com");
  const [password, setPassword] = useState("bighouse-demo");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error ?? "Unable to sign in.");
      return;
    }

    startTransition(() => {
      router.push(redirectTo ?? "/");
      router.refresh();
    });
  };

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">Work email</span>
        <input
          className="h-12 w-full rounded-full border border-border bg-white/80 px-4 outline-none"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">Access code</span>
        <input
          className="h-12 w-full rounded-full border border-border bg-white/80 px-4 outline-none"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </label>
      {error ? <div className="rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}
      <Button className="w-full" size="lg" type="submit" disabled={isPending}>
        {isPending ? "Entering..." : "Enter dashboard"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
