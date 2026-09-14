import type { ReactNode } from "react";

import { SiteFooter } from "./site-footer";
import { SiteNav } from "./site-nav";
import { PageTransition } from "../ux-provider";

export function MarketingShell({ children, footer = true }: { children: ReactNode; footer?: boolean }) {
  return (
    <div className="marketing-root">
      <SiteNav />
      <PageTransition><div id="main-content" tabIndex={-1}>{children}</div></PageTransition>
      {footer ? <SiteFooter /> : null}
    </div>
  );
}
