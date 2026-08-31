import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import type { ReactNode } from "react";
const inter = Inter({ subsets: ["latin"], variable: "--font-body" });
import "./globals.css";
import "../styles/app.css";
import "../styles/radical-redesign.css";

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
    <html className={inter.variable} data-scroll-behavior="smooth" lang="en">
      <body className="bg-ink text-white font-sans antialiased min-h-screen selection:bg-orange/30 selection:text-white">
        {children}
        <style dangerouslySetInnerHTML={{ __html: `
          html body.bg-ink *, html body [class], html body [class] *, html body .public-page *,
          html body .legal-page *, html body .site-nav *, html body .app-frame *,
          html body .app-sidebar *, html body .app-content *, html body .app-topbar * {
            color: #fff !important;
          }
          html body input::placeholder, html body textarea::placeholder { color: rgba(255,255,255,.62) !important; }
        ` }} />
      </body>
    </html>
  );
}
