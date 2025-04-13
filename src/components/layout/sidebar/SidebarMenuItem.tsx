
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { MenuItem } from "./menu-items";
import { SidebarMenu, SidebarMenuItem as SidebarMenuItemComponent, SidebarMenuButton } from "@/components/ui/sidebar";

interface SidebarMenuItemProps extends MenuItem {
  level?: number;
}

export function SidebarMenuItem({
  label,
  path,
  icon: Icon,
  submenu,
  level = 0,
}: SidebarMenuItemProps) {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = path ? location.pathname === path : false;
  const hasSubmenu = submenu && submenu.length > 0;

  const toggleSubMenu = () => {
    if (hasSubmenu) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <>
      <SidebarMenuItemComponent className={isActive ? "bg-slate-700/50" : ""}>
        {hasSubmenu ? (
          <button
            onClick={toggleSubMenu}
            className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-slate-700/50"
          >
            <span className="flex items-center gap-2">
              {Icon && <Icon className="h-4 w-4" />}
              <span>{label}</span>
            </span>
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <SidebarMenuButton asChild>
            <Link
              to={path || "#"}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-slate-700/50"
            >
              {Icon && <Icon className="h-4 w-4" />}
              <span>{label}</span>
            </Link>
          </SidebarMenuButton>
        )}
      </SidebarMenuItemComponent>

      {hasSubmenu && isOpen && (
        <div className={`ml-${level > 0 ? 6 : 3} border-l border-slate-700/50 pl-3`}>
          <SidebarMenu>
            {submenu.map((item) => (
              <SidebarMenuItem key={item.label} {...item} level={level + 1} />
            ))}
          </SidebarMenu>
        </div>
      )}
    </>
  );
}
