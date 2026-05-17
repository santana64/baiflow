"use client";

import { useFormStatus } from "react-dom";

export function SubmitButton({
  children,
  loadingText,
  className
}: {
  children: React.ReactNode;
  loadingText?: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
    >
      {pending ? (loadingText ?? "Enregistrement…") : children}
    </button>
  );
}
