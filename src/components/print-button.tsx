"use client";

import { Printer } from "lucide-react";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold text-navy transition-colors hover:bg-paper"
    >
      <Printer className="h-4 w-4" />
      Imprimer
    </button>
  );
}
