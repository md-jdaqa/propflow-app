"use client";

import { AppearanceSection } from "./AppearanceSection";
import { AiSection } from "./AiSection";
import { NtfySection } from "./NtfySection";
import { AccountSection } from "./AccountSection";
import { DangerZoneSection } from "./DangerZoneSection";

export function SettingsPage() {
  return (
    <div data-testid="settings-page" className="space-y-6 pb-24">
      <AppearanceSection />
      <AiSection />
      <NtfySection />
      <AccountSection />
      <DangerZoneSection />
    </div>
  );
}
