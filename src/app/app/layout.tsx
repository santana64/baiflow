import { AppShell } from "@/components/ui";
import { SubscriptionNotice } from "@/components/subscription-notice";
import { ToastProvider } from "@/components/toast-provider";
import { OnboardingGuard } from "@/components/onboarding-guard";
import { getCurrentUser } from "@/server/auth";
import { getOnboardingState } from "@/server/onboarding";

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  const onboarding = await getOnboardingState(user.id);
  return (
    <ToastProvider>
      <AppShell userName={user.name ?? user.email}>
        <OnboardingGuard completed={onboarding.completed} progress={onboarding.progress} />
        <SubscriptionNotice />
        {children}
      </AppShell>
    </ToastProvider>
  );
}
