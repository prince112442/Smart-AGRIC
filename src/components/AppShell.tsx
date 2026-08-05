"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex bg-[#f4f6f4]">
      <Sidebar />
      <div className="flex-1 min-w-0">
        <Topbar title={title} subtitle={subtitle} />
        <main className="px-4 lg:px-8 py-6">{children}</main>
      </div>
    </div>
  );
}
