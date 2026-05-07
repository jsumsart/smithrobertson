import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  brandName: string;
  children: ReactNode;
};

export function DashboardShell({ brandName, children }: Props) {
  return (
    <div className="dashboardShell">
      <aside className="dashboardRail">
        <div className="dashboardBrand">
          <p className="eyebrow">Museum Platform</p>
          <strong>{brandName}</strong>
        </div>
        <nav className="dashboardNav">
          <Link href="/dashboard">Overview</Link>
          <Link href="/dashboard/records">Records</Link>
          <Link href="/dashboard/media">Media</Link>
          <Link href="/dashboard/taxonomies">Taxonomies</Link>
          <Link href="/dashboard/exhibits">Exhibits</Link>
          <Link href="/dashboard/settings">Settings</Link>
        </nav>
      </aside>
      <main className="dashboardContent">{children}</main>
    </div>
  );
}
