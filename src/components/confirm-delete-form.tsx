"use client";

import { useRef, useState } from "react";
import { AlertTriangle, Trash2, X } from "lucide-react";

export function ConfirmDeleteForm({
  action,
  message,
  children
}: {
  action: (formData: FormData) => void | Promise<void>;
  message: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmitClick(e: React.MouseEvent) {
    e.preventDefault();
    setOpen(true);
  }

  function handleConfirm() {
    setOpen(false);
    // Submit the real form after modal closes
    requestAnimationFrame(() => formRef.current?.requestSubmit());
  }

  return (
    <>
      {/* Real form — submits only after confirmation */}
      <form ref={formRef} action={action}>
        {/* Children provide hidden inputs + we intercept the button click */}
        <div onClick={handleSubmitClick} className="contents">
          {children}
        </div>
      </form>

      {/* Confirm modal */}
      {open && (
        <div
          className="fixed inset-0 z-[250] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-ink/40 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
          />

          {/* Dialog */}
          <div className="animate-modal-in relative w-full max-w-md rounded-2xl border border-line bg-white p-6 shadow-soft">
            {/* Close */}
            <button
              onClick={() => setOpen(false)}
              className="absolute right-4 top-4 rounded-lg p-1 text-ink/30 transition-colors hover:bg-paper hover:text-ink/60"
              aria-label="Annuler"
            >
              <X className="h-4 w-4" />
            </button>

            {/* Icon */}
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-danger/8 mb-4">
              <AlertTriangle className="h-5 w-5 text-danger" />
            </div>

            <h2 className="text-base font-bold text-navy">Confirmer la suppression</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink/60">{message}</p>
            <p className="mt-1 text-xs text-ink/40">Cette action est irréversible.</p>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 rounded-lg border border-line bg-white px-4 py-2.5 text-sm font-semibold text-navy transition-colors hover:bg-paper"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-danger px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:opacity-90"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
