"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { clearSession, getUser } from "@/lib/api";
import { useEffect, useState } from "react";

const LINKS = [
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

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [name, setName] = useState<string>("");

  useEffect(() => {
    const user = getUser();
    if (user) setName(user.name);
  }, []);

  function logout() {
    clearSession();
    router.push("/login");
  }

  return (
    <div className="bg-white border-b border-primary-100 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          <Link href="/dashboard" className="font-bold text-primary-700 text-lg">
            🌾 AgriSense
          </Link>
          <nav className="hidden md:flex gap-1 overflow-x-auto">
            {LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={`px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap ${
                  pathname === l.href ? "bg-primary-100 text-primary-800" : "text-gray-600 hover:bg-primary-50"
                }`}
              >
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            {name && <span className="text-sm text-gray-500 hidden sm:inline">Hi, {name}</span>}
            <button onClick={logout} className="btn-secondary text-sm">
              Log out
            </button>
          </div>
        </div>
        <nav className="flex md:hidden gap-1 overflow-x-auto pb-2">
          {LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
                pathname === l.href ? "bg-primary-100 text-primary-800" : "text-gray-600"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </div>
  );
}
