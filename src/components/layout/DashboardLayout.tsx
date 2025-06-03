
import { SidebarProvider } from "@/components/ui/sidebar";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <Sidebar />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Header className="flex-shrink-0" />
          <main className="flex-1 h-full w-full overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
