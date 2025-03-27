
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { Info } from "lucide-react";
import { CashRegister } from "@/types/cash-register";

interface CashRegisterHeaderProps {
  onRefreshData: () => Promise<void>;
  cashRegister: CashRegister | null;
}

export function CashRegisterHeader({ onRefreshData, cashRegister }: CashRegisterHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <div className="flex items-center gap-2">
        <h1 className="text-2xl font-bold">Caisse</h1>
        <Info className="text-blue-500 h-5 w-5" />
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={onRefreshData}
          className="bg-black border-gray-700 hover:bg-gray-800 text-white"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Rafraîchir
        </Button>
        <Button 
          variant="destructive"
          className="hover:bg-red-700"
        >
          Ouverture tiroir
        </Button>
        <Button 
          variant="outline" 
          className="bg-[#15222e] border-gray-700 hover:bg-[#1c2c3d] text-white"
        >
          Exporter
        </Button>
      </div>
    </div>
  );
}
