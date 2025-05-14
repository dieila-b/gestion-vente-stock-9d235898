
import { Card } from "@/components/ui/card";
import { SearchTransfer } from "@/components/transfers/SearchTransfer";
import { TransferList } from "@/components/transfers/TransferList";
import { Transfer } from "@/types/transfer";
import { DataTable } from "@/components/ui/data-table";
import { useEffect, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { safeFormatDate } from "@/utils/date-utils";

interface TransfersContentProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  filteredTransfers: Transfer[];
  onEdit: (transfer: Transfer) => void;
  onDelete: (transferId: string) => void;
}

export const TransfersContent = ({
  searchQuery,
  onSearchChange,
  filteredTransfers,
  onEdit,
  onDelete
}: TransfersContentProps) => {
  const [useDatatable, setUseDatatable] = useState(false);

  useEffect(() => {
    // Check if window width is above 1024px (lg breakpoint)
    const checkWidth = () => {
      setUseDatatable(window.innerWidth >= 1024);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  const columns: ColumnDef<Transfer>[] = [
    {
      accessorKey: "reference",
      header: "Référence",
      cell: ({ row }) => <span className="font-medium">
        {row.original.reference || `Transfer-${row.original.id?.substring(0, 8)}` || "-"}
      </span>
    },
    {
      accessorKey: "transfer_date",
      header: "Date",
      cell: ({ row }) => safeFormatDate(row.original.transfer_date || row.original.created_at)
    },
    {
      accessorKey: "transfer_type",
      header: "Type",
      cell: ({ row }) => {
        const type = row.original.transfer_type;
        return (
          <span>
            {type === "depot_to_pos" ? "Dépôt → Point de vente" :
             type === "pos_to_depot" ? "Point de vente → Dépôt" :
             type === "depot_to_depot" ? "Dépôt → Dépôt" : 
             "Type inconnu"}
          </span>
        );
      }
    },
    {
      accessorKey: "status",
      header: "Statut",
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <span className={`px-2 py-1 rounded-full text-xs ${
            status === "completed" ? "bg-green-500/20 text-green-500" :
            status === "cancelled" ? "bg-red-500/20 text-red-500" :
            "bg-yellow-500/20 text-yellow-500"
          }`}>
            {status === "completed" ? "Terminé" :
             status === "cancelled" ? "Annulé" :
             "En attente"}
          </span>
        );
      }
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(row.original)}
            className="h-8 w-8 hover:bg-blue-500/20"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(row.original.id)}
            className="h-8 w-8 hover:bg-red-500/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <Card className="enhanced-glass p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
          Liste des Transferts
        </h2>
        <SearchTransfer 
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />
      </div>

      {useDatatable ? (
        <DataTable 
          columns={columns} 
          data={filteredTransfers} 
          searchPlaceholder="Rechercher un transfert..."
          searchColumn="reference"
        />
      ) : (
        <TransferList
          transfers={filteredTransfers}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )}
    </Card>
  );
};
