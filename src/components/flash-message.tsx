"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast, type ToastType } from "./toast-provider";

const FLASH_MAP: Record<string, { message: string; type: ToastType }> = {
  saved:      { message: "Modifications enregistrées avec succès.", type: "success" },
  "1":        { message: "Modifications enregistrées avec succès.", type: "success" },
  created:    { message: "Créé avec succès.", type: "success" },
  deleted:    { message: "Supprimé avec succès.", type: "success" },
  sent:       { message: "Email envoyé avec succès.", type: "success" },
  registered: { message: "Bienvenue sur BailFlow !", type: "success" },
  error:      { message: "Une erreur est survenue. Veuillez réessayer.", type: "error" }
};

export function FlashMessage({ flash }: { flash?: string | null }) {
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (!flash) return;
    const entry = FLASH_MAP[flash];
    if (!entry) return;

    toast(entry.message, entry.type);

    // Clean the flash param from URL without page reload
    const url = new URL(window.location.href);
    url.searchParams.delete("flash");
    url.searchParams.delete("saved");
    url.searchParams.delete("registered");
    const clean = url.pathname + (url.searchParams.size > 0 ? `?${url.searchParams}` : "");
    router.replace(clean, { scroll: false });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
