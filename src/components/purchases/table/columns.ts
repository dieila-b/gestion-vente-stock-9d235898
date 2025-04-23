
import { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrder } from "@/types/purchase-order";

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "order_number",
    header: "N° Commande"
  },
  {
    accessorKey: "created_at",
    header: "Date"
  },
  {
    accessorKey: "supplier.name",
    header: "Fournisseur"
  },
  {
    accessorKey: "items",
    header: "Nombre d'articles",
    cell: ({ row }) => {
      return row.original.items?.length || 0;
    }
  },
  {
    accessorKey: "status",
    header: "Statut"
  },
  {
    accessorKey: "total_amount",
    header: "Montant net"
  }
];
