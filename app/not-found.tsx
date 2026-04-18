import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function NotFound() {
  return (
    <AppShell title="Not Found" subtitle="The requested portfolio view could not be located.">
      <Card>
        <CardContent className="flex flex-col items-start gap-4 p-8">
          <p className="max-w-xl text-sm text-muted-foreground">
            This mockup includes seeded routes for the demo portfolio. If you followed a stale link, return to the overview and continue from there.
          </p>
          <Button asChild>
            <Link href="/">Return to overview</Link>
          </Button>
        </CardContent>
      </Card>
    </AppShell>
  );
}
