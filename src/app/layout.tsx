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
  maximumScale: 1,      // Prevents iOS auto-zoom on input focus
  userScalable: false,  // Locks viewport — no pinch-zoom breaking layout
  themeColor: "#080C14",
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
