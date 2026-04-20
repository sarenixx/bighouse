import type { Metadata } from "next";

import "@/app/globals.css";

export const metadata: Metadata = {
  title: "Amseta | Real Estate Fiduciary",
  description:
    "Amseta is a real estate fiduciary providing independent oversight for third-party managed real estate portfolios."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
