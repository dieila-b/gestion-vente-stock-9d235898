
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";

interface SupplierActionsProps {
  onNavigate: (path: string) => void;
}

export const SupplierActions = ({ onNavigate }: SupplierActionsProps) => {
  return (
    <div className="mt-12 flex flex-col sm:flex-row gap-4 justify-center items-center p-6 rounded-lg backdrop-blur-sm bg-black/20 shadow-lg border border-white/10">
      <Button 
        variant="default"
        size="lg"
        className="w-full sm:w-auto min-w-[200px] font-medium hover:scale-105 transition-transform"
        onClick={() => onNavigate("/suppliers")}
      >
        <Package className="h-5 w-5 mr-2" />
        Accéder aux Fournisseurs
      </Button>
      <Button 
        variant="default"
        size="lg"
        className="w-full sm:w-auto min-w-[200px] font-medium hover:scale-105 transition-transform"
        onClick={() => onNavigate("/dashboard")}
      >
        <Package className="h-5 w-5 mr-2" />
        Accéder au Tableau de Bord
      </Button>
    </div>
  );
};
