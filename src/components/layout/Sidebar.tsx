
import {
  Sidebar as SidebarComponent,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { menuItems } from "./sidebar/menu-items";
import { SidebarMenuItem } from "./sidebar/SidebarMenuItem";
import { SidebarFooter } from "./sidebar/SidebarFooter";

export function Sidebar() {
  return (
    <SidebarComponent className="fixed left-0 top-0 h-screen border-r border-purple-900/30 flex-shrink-0 bg-[#1A1F2C]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1F2C]/60">
      <SidebarContent className="flex h-full flex-col">
        <div className="p-6">
          <Link to="/" className="block">
            <h1 className="text-2xl font-bold">
              <span className="text-purple-400">Ets AICHA</span><br/>
              <span className="text-purple-400">BUSINESS</span><br/>
              <span className="text-purple-400">ALPHAYA</span>
            </h1>
          </Link>
        </div>
        
        <SidebarGroup className="flex-1 overflow-hidden">
          <SidebarGroupLabel className="text-sm font-medium text-purple-300 px-3">Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent className="mt-2 py-2 space-y-1 overflow-y-auto">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem 
                  key={item.label}
                  {...item}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarFooter />
      </SidebarContent>
    </SidebarComponent>
  );
}
