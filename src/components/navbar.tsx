"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { FileText, Database, LayoutDashboard, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ProfileButton } from "./profile-button";

export function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vault", label: "Career Vault", icon: Database },
    { href: "/resumes", label: "My Resumes", icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-xs no-print">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold shadow-xs group-hover:bg-indigo-700 transition-colors">
              <Sparkles className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
                ResumeOS
              </span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase mt-0.5">
                Local Prototype
              </span>
            </div>
          </Link>

          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname?.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-slate-100 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ProfileButton />
          <Badge variant="success" className="gap-1 font-mono text-[11px] hidden sm:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Local-First
          </Badge>
        </div>
      </div>
    </header>
  );
}
