
import { useState } from "react";
import { Link } from "react-router-dom";
import { LucideIcon, LucideProps } from "lucide-react";
import {
  SidebarMenuItem as BaseSidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

type IconComponent = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

interface MenuItem {
  label: string;
  icon: IconComponent;
  path?: string;
  submenu?: MenuItem[];
}

export function SidebarMenuItem({ label, icon: Icon, path, submenu }: MenuItem) {
  const [isOpen, setIsOpen] = useState(false);
  
  if (!submenu) {
    return (
      <BaseSidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link 
            to={path!} 
            className="flex items-center gap-3 px-3 py-2 hover:bg-gradient-to-r hover:from-purple-900/50 hover:to-pink-900/30 rounded-lg group transition-all duration-300"
          >
            <Icon className="h-5 w-5 text-purple-300 group-hover:text-purple-200 group-hover:scale-110 transition-all duration-300" />
            <span className="text-gray-200 group-hover:text-purple-200 transition-colors">{label}</span>
          </Link>
        </SidebarMenuButton>
      </BaseSidebarMenuItem>
    );
  }

  const renderSubmenuItem = (item: MenuItem) => {
    if (item.submenu) {
      return (
        <SidebarMenuItem 
          key={item.label}
          label={item.label}
          icon={item.icon}
          submenu={item.submenu}
        />
      );
    }

    return (
      <SidebarMenuSubItem 
        key={item.path}
        className="transform transition-transform duration-300 hover:translate-x-1"
      >
        <SidebarMenuSubButton asChild>
          <Link 
            to={item.path!}
            className="flex items-center gap-3 px-3 py-2 hover:bg-gradient-to-r hover:from-purple-900/50 hover:to-pink-900/30 rounded-lg group transition-all duration-300"
          >
            <item.icon className="h-4 w-4 text-purple-300 group-hover:text-purple-200 group-hover:scale-110 transition-all duration-300" />
            <span className="text-gray-300 group-hover:text-purple-200 transition-colors text-sm">{item.label}</span>
          </Link>
        </SidebarMenuSubButton>
      </SidebarMenuSubItem>
    );
  };

  return (
    <BaseSidebarMenuItem>
      <SidebarMenuButton
        className="flex items-center gap-3 px-3 py-2 hover:bg-gradient-to-r hover:from-purple-900/50 hover:to-pink-900/30 rounded-lg group transition-all duration-300 w-full"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Icon className={`h-5 w-5 text-purple-300 group-hover:text-purple-200 transition-all duration-300 ${isOpen ? 'scale-110' : ''}`} />
        <span className="text-gray-200 group-hover:text-purple-200 transition-colors flex-1">{label}</span>
        <svg
          className={`w-4 h-4 text-purple-300 transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </SidebarMenuButton>
      <SidebarMenuSub 
        className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} py-2 pl-4 space-y-1 border-l border-purple-900/30 ml-3`}
      >
        {submenu.map((subItem) => renderSubmenuItem(subItem))}
      </SidebarMenuSub>
    </BaseSidebarMenuItem>
  );
}
