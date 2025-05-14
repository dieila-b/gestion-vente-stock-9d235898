
import React from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { TransfersPrintDialog } from "../TransfersPrintDialog";
import { Transfer } from "@/types/transfer";

interface TransfersHeaderProps {
  transfers: Transfer[];
  onNewTransferClick: () => void;
}

export function TransfersHeader({ 
  transfers, 
  onNewTransferClick 
}: TransfersHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:justify-between gap-4 items-start sm:items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Transferts</h2>
        <p className="text-muted-foreground">
          Gérez les transferts de stock entre vos entrepôts et points de vente
        </p>
      </div>
      
      <div className="flex gap-4 w-full sm:w-auto justify-end">
        <TransfersPrintDialog transfers={transfers} />
        <Button 
          onClick={onNewTransferClick}
          className="gap-2 bg-orange-500 hover:bg-orange-600"
        >
          <Plus className="h-4 w-4" />
          Nouveau Transfert
        </Button>
      </div>
    </div>
  );
}
