import { SettingsPage } from "@/components/settings/SettingsPage";

export const metadata = {
  title: "Settings — PropFlow",
};

export default function SettingsRoute() {
  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold text-heading">Settings</h1>
        <p className="text-sm text-muted">
          Configure your appearance, AI assistant, push notifications, and account.
        </p>
      </header>
      <SettingsPage />
    </div>
  );
}
