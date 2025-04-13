
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { format } from "date-fns";
import { TransfersPrintDialog } from "@/components/transfers/TransfersPrintDialog";
import { Transfer } from "@/types/transfer";

interface TransfersHeaderProps {
  transfers: Transfer[];
  onNewTransferClick: () => void;
}

export const TransfersHeader = ({ transfers, onNewTransferClick }: TransfersHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-4xl font-bold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
          Transferts
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestion des transferts de stock entre entrepôts et points de vente
        </p>
      </div>
      <div className="flex gap-4 w-full sm:w-auto justify-end">
        <TransfersPrintDialog 
          transfers={transfers}
          transferItems={[]}
        />
        <Button 
          onClick={onNewTransferClick}
          className="glass-effect hover:neon-glow transition-all duration-300 bg-gradient-to-r from-purple-500/10 to-blue-500/10 hover:from-purple-500/20 hover:to-blue-500/20"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau transfert
        </Button>
      </div>
    </div>
  );
};
