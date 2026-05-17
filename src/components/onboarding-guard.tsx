"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

export function OnboardingGuard({
  completed,
  progress
}: {
  completed: boolean;
  progress: number;
}) {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (completed) return;
    if (pathname === "/app/onboarding" || pathname === "/app/account") return;
    router.replace("/app/onboarding");
  }, [completed, pathname, router]);

  if (completed || pathname === "/app/onboarding") return null;

  return (
    <div className="mb-6 rounded-xl border border-navy/10 bg-white p-4 shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-sage" />
            <p className="text-sm font-semibold text-navy">Onboarding requis</p>
          </div>
          <div className="mt-2 h-1.5 max-w-md overflow-hidden rounded-full bg-paper">
            <div className="h-full rounded-full bg-sage" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <Link href="/app/onboarding" className="rounded-full bg-ink px-4 py-2 text-sm font-semibold text-white">
          Finaliser
        </Link>
      </div>
    </div>
  );
}
