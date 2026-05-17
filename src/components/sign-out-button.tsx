"use client";

import { LogOut } from "lucide-react";
import { logoutUser } from "@/server/account-actions";

export function SignOutButton() {
  return (
    <form action={logoutUser}>
      <button
        className="flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1.5 text-xs font-semibold text-ink/60 transition-colors hover:border-ink/20 hover:text-ink"
        title="Se déconnecter"
      >
        <LogOut className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Déconnexion</span>
      </button>
    </form>
  );
}
