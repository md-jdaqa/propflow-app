import { TopNav } from "@/components/nav/TopNav";
import { Sidebar } from "@/components/nav/Sidebar";
import { BottomNav } from "@/components/nav/BottomNav";
import { Footer } from "@/components/Footer";

export default function AppShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
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
    </div>
  );
}
