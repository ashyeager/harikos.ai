"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ThemePreference = "light" | "dark";
type ToastTone = "loading" | "success" | "error" | "info";
type ToastInput = { message: string; tone?: ToastTone; action?: { label: string; run: () => void } };
type ToastRecord = ToastInput & { id: number };

const ThemeContext = createContext<{ preference: ThemePreference; setPreference: (value: ThemePreference) => void } | null>(null);
const ToastContext = createContext<{ notify: (toast: ToastInput) => void } | null>(null);

function applyTheme(preference: ThemePreference) {
  document.documentElement.dataset.theme = preference;
  document.documentElement.dataset.themePreference = preference;
}

export function UXProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("light");
  const [toasts, setToasts] = useState<ToastRecord[]>([]);
  const [scrollProgress, setScrollProgress] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const saved = window.localStorage.getItem("harikos-theme");
    const initial: ThemePreference = saved === "light" || saved === "dark" ? saved : pathname.startsWith("/app") ? "dark" : "light";
    setPreferenceState(initial);
    applyTheme(initial);
  }, [pathname]);

  useEffect(() => {
    const update = () => { const available = document.documentElement.scrollHeight - window.innerHeight; setScrollProgress(available > 0 ? Math.min(1, window.scrollY / available) : 0); };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [pathname]);

  const setPreference = useCallback((value: ThemePreference) => {
    window.localStorage.setItem("harikos-theme", value);
    setPreferenceState(value);
    applyTheme(value);
  }, []);

  const notify = useCallback((input: ToastInput) => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { ...input, id }]);
    if (input.tone !== "loading") window.setTimeout(() => setToasts((current) => current.filter((toast) => toast.id !== id)), 4200);
  }, []);

  const themeValue = useMemo(() => ({ preference, setPreference }), [preference, setPreference]);
  const toastValue = useMemo(() => ({ notify }), [notify]);

  return <ThemeContext.Provider value={themeValue}><ToastContext.Provider value={toastValue}><div aria-hidden="true" className="scroll-progress" style={{ transform: `scaleX(${scrollProgress})` }} />{children}<div aria-atomic="true" aria-live="polite" className="toast-viewport"><AnimatePresence initial={false}>{toasts.map((toast) => <motion.div animate={{ opacity: 1, y: 0 }} className={`harikos-toast toast-${toast.tone ?? "info"}`} exit={{ opacity: 0, y: 8 }} initial={{ opacity: 0, y: 8 }} key={toast.id} role={toast.tone === "error" ? "alert" : "status"}><i aria-hidden="true" /><span>{toast.message}</span>{toast.action ? <button onClick={() => { toast.action?.run(); setToasts((current) => current.filter((item) => item.id !== toast.id)); }} type="button">{toast.action.label}</button> : null}</motion.div>)}</AnimatePresence></div></ToastContext.Provider></ThemeContext.Provider>;
}

export function useToast() {
  const value = useContext(ToastContext);
  if (!value) throw new Error("useToast must be used within UXProvider");
  return value;
}

export function ThemeToggle() {
  const value = useContext(ThemeContext);
  if (!value) return null;
  const next: ThemePreference = value.preference === "light" ? "dark" : "light";
  return <span className="tooltip-root"><button aria-label={`Color theme: ${value.preference === "light" ? "white" : "black"}. Switch to ${next === "light" ? "white" : "black"}.`} className="theme-toggle" onClick={() => value.setPreference(next)} type="button"><span aria-hidden="true">{value.preference === "light" ? "◐" : "◑"}</span><small>{value.preference === "light" ? "WHITE" : "BLACK"}</small></button><span className="tooltip-content" role="tooltip">Use {next === "light" ? "white" : "black"} theme</span></span>;
}

export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = useReducedMotion();
  return <motion.div animate={{ opacity: 1, y: 0 }} initial={reducedMotion ? false : { opacity: 0, y: 4 }} key={pathname} transition={{ duration: reducedMotion ? 0 : .18, ease: "easeOut" }}>{children}</motion.div>;
}
