
import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { formatGNF } from "@/lib/currency";

// Define the invoice type based on what's returned from the hook
export type UnpaidInvoice = {
  id: string;
  created_at: string;
  client?: { company_name?: string };
  client_id: string;
  invoice_number: string;
  total_amount: number;
  paid_amount: number;
  remaining_amount: number;
  payment_status: string;
};

export const columns: ColumnDef<UnpaidInvoice>[] = [
  {
    accessorKey: "created_at",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return <div>{date.toLocaleDateString("fr-FR")}</div>;
    },
  },
  {
    accessorKey: "client",
    header: "Client",
    cell: ({ row }) => {
      const client = row.original.client;
      return <div>{client?.company_name || "Client particulier"}</div>;
    },
  },
  {
    accessorKey: "invoice_number",
    header: "N° Facture",
  },
  {
    accessorKey: "total_amount",
    header: "Total",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("total_amount"));
      return <div className="text-right">{formatGNF(amount)}</div>;
    },
  },
  {
    accessorKey: "paid_amount",
    header: "Payé",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("paid_amount"));
      return <div className="text-right text-green-500">{formatGNF(amount)}</div>;
    },
  },
  {
    accessorKey: "remaining_amount",
    header: "Reste",
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("remaining_amount"));
      return <div className="text-right text-yellow-500">{formatGNF(amount)}</div>;
    },
  },
  {
    accessorKey: "payment_status",
    header: "Statut",
    cell: ({ row }) => {
      const status = row.getValue("payment_status") as string;
      return (
        <Badge
          className={
            status === "partial"
              ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20"
              : "bg-red-500/10 text-red-500 hover:bg-red-500/20"
          }
        >
          {status === "partial" ? "Partiel" : "En attente"}
        </Badge>
      );
    },
  },
];
