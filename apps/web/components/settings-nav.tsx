import Link from "next/link";

export function SettingsNav({ active }: { active: "profile" | "billing" | "security" }) {
  return <nav aria-label="Settings sections" className="settings-nav">{[["profile", "Profile"], ["billing", "Billing"], ["security", "Security"]].map(([id, label]) => <Link aria-current={active === id ? "page" : undefined} className={active === id ? "active" : ""} href={`/app/settings/${id}`} key={id}><span>{label}</span><b>&rarr;</b></Link>)}</nav>;
}
