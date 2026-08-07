"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Bell } from "lucide-react";
import { getUser } from "@/lib/api";

const MOBILE_LINKS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/farms", label: "Farms" },
  { href: "/soil", label: "Soil" },
  { href: "/weather", label: "Weather" },
  { href: "/irrigation", label: "Irrigation" },
  { href: "/crops", label: "Crops" },
  { href: "/pests", label: "Pests" },
  { href: "/yield", label: "Yield" },
  { href: "/analytics", label: "Analytics" },
  { href: "/assistant", label: "Assistant" },
];

export default function Topbar({ title, subtitle }: { title: string; subtitle?: string }) {
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
  }, []);

  const initials = user?.name
    ?.split(" ")
    .map((p: string) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="sticky top-0 z-10 bg-[#f4f6f4]/90 backdrop-blur border-b border-primary-100">
      <div className="h-16 px-4 lg:px-8 flex items-center justify-between gap-4">
        <div className="min-w-0 flex items-center gap-3">
          <span className="w-1.5 h-8 rounded-full bg-amber-500 hidden sm:block" />
          <div className="min-w-0">
            <h1 className="text-lg font-extrabold text-amber-700 truncate">{title}</h1>
            {subtitle && <p className="text-xs text-gray-500 truncate hidden sm:block">{subtitle}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-400 w-64">
            <Search size={15} />
            <span>Search farms, sensors...</span>
          </div>
          <button className="w-9 h-9 rounded-lg bg-white border border-gray-200 flex items-center justify-center text-gray-500 relative">
            <Bell size={16} />
          </button>
          {user && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary-700 text-white text-xs font-semibold flex items-center justify-center">
                {initials}
              </div>
              <div className="hidden sm:block leading-tight">
                <p className="text-sm font-medium text-gray-800">{user.name}</p>
                <p className="text-xs text-gray-400">{user.email}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      <nav className="lg:hidden flex gap-1 overflow-x-auto px-4 pb-2">
        {MOBILE_LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              pathname === l.href ? "bg-primary-800 text-white" : "bg-white text-gray-600 border border-gray-200"
            }`}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
