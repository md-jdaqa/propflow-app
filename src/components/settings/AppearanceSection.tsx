"use client";

import { Card } from "@/components/ui/Card";
import { ThemePicker } from "@/components/themes/ThemePicker";

export function AppearanceSection() {
  return (
    <Card testId="settings-appearance">
      <div className="mb-3 space-y-1">
        <h2 className="text-lg font-semibold text-heading">Appearance — Theme</h2>
        <p className="text-sm text-muted">
          Pick a theme. Updates instantly. Saved to this device.
        </p>
      </div>
      <ThemePicker />
    </Card>
  );
}
