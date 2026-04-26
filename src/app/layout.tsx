import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeBootstrap } from "@/components/themes/ThemeBootstrap";

export const metadata: Metadata = {
  title: "PropFlow — Smart Property Management",
  description: "AI-powered property management for landlords. Mobile-first, dark-mode-first.",
  applicationName: "PropFlow",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0D1B2A",
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" data-theme="midnight-pro" suppressHydrationWarning>
      <head>
        <ThemeBootstrap />
      </head>
      <body className="min-h-screen bg-bg text-body antialiased">
        {children}
      </body>
    </html>
  );
}
