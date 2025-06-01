
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  console.log("DashboardLayout: Rendu du layout");
  
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Header className="sticky top-0 z-50" />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-background/90 w-full">
            <div className="w-full max-w-none p-4 md:p-6 lg:p-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
