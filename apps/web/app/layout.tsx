import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import type { ReactNode } from "react";
import { MotionProvider } from "../components/motion-provider";
import { UXProvider } from "../components/ux-provider";

import "./globals.css";

const geist = Geist({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const geistMono = Geist_Mono({ subsets: ["latin"], variable: "--font-code", display: "swap" });

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
    <html className={`${geist.variable} ${geistMono.variable}`} data-scroll-behavior="smooth" lang="en" suppressHydrationWarning>
      <body><MotionProvider><UXProvider><a className="skip-link" href="#main-content">Skip to content</a>{children}</UXProvider></MotionProvider></body>
    </html>
  );
}
