"use client";

import { useState } from "react";
import { ArrowRight, Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDisabled = isSubmitting || !email.trim() || !password;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
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
        setIsSubmitting(false);
        return;
      }

      // Use a full navigation so the new session cookie is definitely present
      // before protected dashboard routes are evaluated.
      window.location.assign(redirectTo ?? "/");
    } catch {
      setError("Unable to sign in.");
      setIsSubmitting(false);
    }
  };

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-2 text-sm">
        <span className="text-muted-foreground">Work email</span>
        <input
          data-testid="login-email"
          type="email"
          autoComplete="username"
          className="h-12 w-full rounded-full border border-border bg-white/80 px-4 outline-none"
          placeholder="name@firm.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      <div className="space-y-2 text-sm">
        <label htmlFor="login-password" className="block text-muted-foreground">
          Access code
        </label>
        <div className="relative">
          <input
            id="login-password"
            data-testid="login-password"
            className="h-12 w-full rounded-full border border-border bg-white/80 px-4 pr-12 outline-none"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your access code"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
          <button
            type="button"
            data-testid="login-password-toggle"
            className="absolute right-2 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-white/90 text-muted-foreground shadow-sm transition hover:border-border hover:bg-white hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Hide access code" : "Show access code"}
            aria-pressed={showPassword}
          >
            {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
          </button>
        </div>
      </div>
      {error ? (
        <div aria-live="polite" className="rounded-[1rem] bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
      {!error && isSubmitting ? (
        <div aria-live="polite" className="rounded-[1rem] bg-secondary/60 px-4 py-3 text-sm text-muted-foreground">
          Verifying access and opening the dashboard...
        </div>
      ) : null}
      <Button className="w-full" size="lg" type="submit" disabled={isDisabled} data-testid="login-submit">
        {isSubmitting ? "Entering..." : "Enter dashboard"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </form>
  );
}
