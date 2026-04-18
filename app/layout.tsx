import type { Metadata } from "next";
import { Instrument_Sans, Newsreader } from "next/font/google";

import "@/app/globals.css";

const sans = Instrument_Sans({
  variable: "--font-sans",
  subsets: ["latin"]
});

const serif = Newsreader({
  variable: "--font-serif",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "BigHouse Oversight",
  description: "Executive dashboard mockup for portfolio oversight and owner representation."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${sans.variable} ${serif.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
