import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { CommandPalette } from "../components/command-palette";
import "./globals.css";
import "../styles/app.css";

export const viewport: Viewport = {
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: {
    default: "HARIKOS AI — A Project Brain for AI Coding Agents",
    template: "%s — HARIKOS AI",
  },
  description:
    "Build fast with AI. HARIKOS keeps the project straight with shared Truth, Memory, Context, and an agent-neutral bridge.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://harikos-ai.vercel.app"),
  alternates: { canonical: "/" },
  openGraph: {
    title: "HARIKOS AI — A Project Brain for AI Coding Agents",
    description: "One shared, continuously verified project brain for Codex, Claude, Cursor, and you.",
    siteName: "HARIKOS AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HARIKOS AI — A Project Brain for AI Coding Agents",
    description: "Build fast with AI. HARIKOS keeps the project straight.",
  },
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
