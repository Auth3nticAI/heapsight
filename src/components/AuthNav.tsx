"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

interface AuthNavProps {
  variant?: "light" | "dark";
}

export default function AuthNav({ variant = "dark" }: AuthNavProps) {
  const [user, setUser] = useState<{ email: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user: u } }) => {
      if (u) setUser({ email: u.email || "User" });
      setLoading(false);
    });
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSignOut = useCallback(async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    setUser(null);
    setOpen(false);
    router.push("/");
    router.refresh();
  }, [router]);

  if (loading) return null;

  if (!user) {
    return (
      <Link
        href="/login"
        className={`px-3 py-1.5 border rounded-lg text-xs font-mono transition-colors ${
          variant === "dark"
            ? "border-white/[0.08] text-[#AFBCD5]/70 hover:border-primary/40 hover:text-white"
            : "border-[#ddd] text-[#AFBCD5]/50 hover:border-primary hover:text-black"
        }`}
      >
        Sign In
      </Link>
    );
  }

  const initials = user.email
    .split("@")[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 rounded-full bg-primary/20 border border-primary/30 flex items-center justify-center text-[10px] font-mono font-bold text-primary hover:bg-primary/30 transition-colors"
      >
        {initials}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-[#071528] border border-white/[0.08] rounded-xl shadow-xl z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-white/[0.05]">
            <p className="text-xs font-mono text-white truncate">{user.email}</p>
          </div>

          {/* Links */}
          <div className="py-1">
            <Link
              href="/learn"
              onClick={() => setOpen(false)}
              className="block px-4 py-2 text-xs font-mono text-[#AFBCD5]/70 hover:bg-white/[0.05] hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-white/[0.05] py-1">
            <button
              onClick={handleSignOut}
              className="w-full text-left px-4 py-2 text-xs font-mono text-[#AFBCD5]/50 hover:bg-danger/10 hover:text-danger transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
