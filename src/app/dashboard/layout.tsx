import Link from "next/link";
import { requireSession } from "@/lib/requireSession";
import LogoutButton from "@/components/LogoutButton";

const NAV = [
  { href: "/dashboard", label: "Overview", icon: "home" },
  { href: "/dashboard/members", label: "Members", icon: "people" },
  { href: "/dashboard/scan", label: "Scan", icon: "scan" },
  { href: "/dashboard/settings", label: "Settings", icon: "gear" },
];

function Icon({ name }: { name: string }) {
  const common = "h-5 w-5";
  switch (name) {
    case "home":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M4 11.5 12 5l8 6.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M6 10.5V19a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-8.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "people":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M3.5 19c.7-3 2.9-4.5 5.5-4.5s4.8 1.5 5.5 4.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="17" cy="9" r="2.3" stroke="currentColor" strokeWidth="1.6" />
          <path d="M15.8 14.8c2.1.2 3.7 1.6 4.2 4.2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "scan":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <path d="M4 8V5a1 1 0 0 1 1-1h3M20 8V5a1 1 0 0 0-1-1h-3M4 16v3a1 1 0 0 0 1 1h3M20 16v3a1 1 0 0 1-1 1h-3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case "gear":
      return (
        <svg viewBox="0 0 24 24" fill="none" className={common}>
          <circle cx="12" cy="12" r="2.8" stroke="currentColor" strokeWidth="1.6" />
          <path d="M12 4v2M12 18v2M4 12h2M18 12h2M6.3 6.3l1.4 1.4M16.3 16.3l1.4 1.4M6.3 17.7l1.4-1.4M16.3 7.7l1.4-1.4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    default:
      return null;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();

  return (
    <div className="min-h-dvh md:flex">
      <aside className="hidden w-60 shrink-0 flex-col border-r border-paper/10 bg-surface/40 p-5 md:flex">
        <Link href="/dashboard" className="font-display text-lg font-semibold">
          Gym Pass
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-paper/5 hover:text-paper"
            >
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
          {session.role === "OWNER" && (
            <Link
              href="/dashboard/staff"
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-paper/5 hover:text-paper"
            >
              <Icon name="people" />
              Staff
            </Link>
          )}
        </nav>
        <div className="mt-auto rounded-xl border border-paper/10 p-3.5">
          <p className="text-sm">{session.name}</p>
          <p className="text-xs text-muted">{session.role === "OWNER" ? "Owner" : "Staff"}</p>
          <div className="mt-3">
            <LogoutButton />
          </div>
        </div>
      </aside>

      <div className="flex-1 pb-20 md:pb-0">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-20 flex border-t border-paper/10 bg-ink/95 backdrop-blur md:hidden">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-muted"
          >
            <Icon name={item.icon} />
            <span className="text-[11px]">{item.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
