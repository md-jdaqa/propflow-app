import { TopNav } from "@/components/nav/TopNav";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { NavOrderProvider } from "@/components/nav/NavOrderProvider";
import { GlobalAiBar } from "@/components/ai/GlobalAiBar";
import { Footer } from "@/components/Footer";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NavOrderProvider>
      <div className="min-h-screen flex flex-col">
        <TopNav />
        <Sidebar />
        <div className="flex-1 md:pl-60 w-full">
          <main
            data-testid="app-main"
            className="px-4 sm:px-6 py-4 max-w-7xl w-full mx-auto"
          >
            {children}
          </main>
          <Footer />
        </div>
        <BottomNav />
        {/* Global AI command bar — floats on every page */}
        <GlobalAiBar />
      </div>
    </NavOrderProvider>
  );
}
