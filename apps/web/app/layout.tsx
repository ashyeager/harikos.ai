import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CommandPalette } from "../components/command-palette";
import "./globals.css";

export const viewport: Viewport = {
  themeColor: "#050505",
};

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
      <body className="bg-ink text-white font-sans antialiased min-h-screen selection:bg-cyan/30 selection:text-white">
        {children}
        <CommandPalette />
      </body>
    </html>
  );
}
