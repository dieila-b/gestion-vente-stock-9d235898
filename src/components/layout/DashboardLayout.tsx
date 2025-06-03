
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0 max-w-full">
          <Header className="sticky top-0 z-50 flex-shrink-0" />
          <main className="flex-1 overflow-y-auto bg-gradient-to-br from-background via-background/95 to-background/90 w-full h-full">
            <div className="h-full w-full p-0 m-0">
              {children}
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
