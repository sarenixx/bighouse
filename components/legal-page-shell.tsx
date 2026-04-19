import type { ReactNode } from "react";
import Link from "next/link";

export function LegalPageShell({
  title,
  effectiveDate,
  children
}: {
  title: string;
  effectiveDate: string;
  children: ReactNode;
}) {
  return (
    <div className="legal-page">
      <main className="legal-paper">
        <div className="legal-topbar">
          <Link href="/" className="legal-home-link">
            Back to Amseta
          </Link>
        </div>

        <header className="legal-header">
          <h1>{title}</h1>
          <p className="legal-effective-date">Effective Date: {effectiveDate}</p>
        </header>

        <article className="legal-content">{children}</article>
      </main>
    </div>
  );
}
