
import { Bell, Search } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
  className?: string;
}

export function Header({ className }: HeaderProps) {
  return (
    <header className={cn("border-b border-purple-900/20 bg-[#1A1F2C]/95 backdrop-blur supports-[backdrop-filter]:bg-[#1A1F2C]/60 z-40", className)}>
      <div className="flex h-14 md:h-16 items-center gap-4 px-4 md:px-6">
        <SidebarTrigger />
        
        <div className="flex-1 flex items-center gap-4">
          <div className="relative max-w-md flex-1 hidden md:flex">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 bg-muted/30 border-purple-900/20 focus:border-primary/50 transition-colors"
            />
          </div>
        </div>

        <div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center">
          <span className="text-sm font-medium text-purple-400">JD</span>
        </div>
      </div>
    </header>
  );
}
