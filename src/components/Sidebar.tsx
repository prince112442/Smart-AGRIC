"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  Sprout,
  FlaskConical,
  CloudSun,
  Droplets,
  Bug,
  TrendingUp,
  BarChart3,
  Bot,
  LogOut,
  Leaf,
  Wheat,
} from "lucide-react";
import { clearSession, getUser } from "@/lib/api";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
  { href: "/farms", label: "My Farms", icon: Sprout },
  { href: "/soil", label: "Soil Monitoring", icon: FlaskConical },
  { href: "/weather", label: "Weather", icon: CloudSun },
  { href: "/irrigation", label: "Irrigation", icon: Droplets },
  { href: "/crops", label: "Crop Management", icon: Leaf },
  { href: "/pests", label: "Pest & Disease", icon: Bug },
  { href: "/yield", label: "Yield Prediction", icon: TrendingUp },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/assistant", label: "Farm Assistant", icon: Bot },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState("");

  useEffect(() => {
    const user = getUser();
    if (user) setName(user.name);
  }, []);

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-white border-r border-primary-100 h-screen sticky top-0">
      <div className="h-16 flex items-center gap-2 px-6 border-b border-primary-100">
        <div className="w-8 h-8 rounded-lg bg-primary-800 text-white flex items-center justify-center">
          <Wheat size={16} />
        </div>
        <span className="font-bold text-primary-900 text-lg">AgriSense</span>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 text-[11px] font-semibold tracking-wider text-gray-400 uppercase mb-2">Menu</p>
        <div className="space-y-0.5">
          {LINKS.map((l) => {
            const Icon = l.icon;
            const active = pathname === l.href;
            return (
              <Link
                key={l.href}
                href={l.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active ? "bg-primary-800 text-white" : "text-gray-600 hover:bg-primary-50"
                }`}
              >
                <Icon size={17} strokeWidth={2} />
                {l.label}
              </Link>
            );
          })}
        </div>
      </nav>

      <div className="p-3 border-t border-primary-100">
        {name && <p className="px-3 pb-2 text-xs text-gray-400 truncate">Signed in as {name}</p>}
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-primary-50"
        >
          <LogOut size={17} />
          Log out
        </button>
      </div>
    </aside>
  );
}
