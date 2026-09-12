import type { ReactNode } from "react";

import { RevealObserver } from "./reveal-observer";
import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";

export function MarketingShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className="marketing-root">
      <SiteNav />
      <div id="main-content" tabIndex={-1}>{children}</div>
      {footer ? <SiteFooter /> : null}
      <RevealObserver />
    </div>
  );
}
