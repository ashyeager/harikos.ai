import type { Metadata } from "next";
import type { ReactNode } from "react";

import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "HARIKOS AI — Project Truth for AI-built software",
    template: "%s — HARIKOS AI",
  },
  description:
    "One continuously verified understanding of your software, for every coding agent.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html data-scroll-behavior="smooth" lang="en">
      <body>{children}</body>
    </html>
  );
}
