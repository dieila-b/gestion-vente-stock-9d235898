
import { ColumnDef } from "@tanstack/react-table";
import { PurchaseOrder } from "@/types/purchase-order";
import { formatGNF } from "@/lib/currency";

export const columns: ColumnDef<PurchaseOrder>[] = [
  {
    accessorKey: "order_number",
    header: "N° Commande"
  },
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return date.toLocaleDateString("fr-FR");
    }
  },
  {
    accessorKey: "supplier.name",
    header: "Fournisseur"
  },
  {
    accessorKey: "items",
    header: "Articles",
    cell: ({ row }) => {
      const items = row.original.items || [];
      const count = items.length;
      
      if (count === 0) return "0 article";
      if (count === 1) return `1 article`;
      return `${count} articles`;
    }
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("status") as string;
      const statusMap: Record<string, string> = {
        draft: "Brouillon",
        pending: "En attente",
        delivered: "Livré",
        approved: "Approuvé"
      };
      
      return statusMap[status] || status;
    }
  },
  {
    accessorKey: "total_amount",
    header: "Montant net",
    cell: ({ row }) => {
      return formatGNF(row.getValue("total_amount") as number);
    }
  }
];
