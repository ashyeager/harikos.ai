import type { Metadata, Viewport } from "next";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";

import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading", display: "swap" });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });

export const viewport: Viewport = {
  themeColor: "#050505",
};

export const metadata: Metadata = {
  title: {
    default: "HARIKOS — Verified Project State for AI Coding Agents",
    template: "%s — HARIKOS AI",
  },
  description:
    "Continuously verified project state, evidence, memory, and task-specific context for AI coding agents.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL?.trim() || "https://harikos-ai.vercel.app"),
  icons: { icon: "/harikos-mark.svg", shortcut: "/harikos-mark.svg", apple: "/harikos-mark.svg" },
  alternates: { canonical: "/" },
  openGraph: {
    title: "HARIKOS — Verified Project State for AI Coding Agents",
    description: "The truth layer for AI coding agents: current evidence, memory, changes, and task-specific context.",
    siteName: "HARIKOS AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HARIKOS — Verified Project State for AI Coding Agents",
    description: "One verified project state. Every agent.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html className={`${inter.variable} ${spaceGrotesk.variable} ${jetBrainsMono.variable}`} data-scroll-behavior="smooth" lang="en">
      <body><a className="skip-link" href="#main-content">Skip to content</a>{children}</body>
    </html>
  );
}
