
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2, ArrowRight, ArrowLeft, ArrowUpDown } from "lucide-react";
import { Transfer } from "@/types/transfer";
import { safeFormatDate } from "@/utils/date-utils";

interface TransfersTableProps {
  transfers: Transfer[];
  onEdit: (transfer: Transfer) => void;
  onDelete: (transferId: string) => void;
}

export const TransfersTable = ({ transfers, onEdit, onDelete }: TransfersTableProps) => {
  const getTransferTypeIcon = (type: string) => {
    switch (type) {
      case "depot_to_pos":
        return <ArrowRight className="h-4 w-4 text-blue-500" />;
      case "pos_to_depot":
        return <ArrowLeft className="h-4 w-4 text-green-500" />;
      case "depot_to_depot":
        return <ArrowUpDown className="h-4 w-4 text-purple-500" />;
      case "pos_to_pos":
        return <ArrowUpDown className="h-4 w-4 text-orange-500" />;
      default:
        return <ArrowUpDown className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTransferTypeLabel = (type: string) => {
    switch (type) {
      case "depot_to_pos":
        return "Dépôt → Point de vente";
      case "pos_to_depot":
        return "Point de vente → Dépôt";
      case "depot_to_depot":
        return "Dépôt → Dépôt";
      case "pos_to_pos":
        return "Point de vente → Point de vente";
      default:
        return "Type inconnu";
    }
  };

  const getSourceName = (transfer: Transfer): string => {
    if (transfer.transfer_type === "depot_to_pos" || transfer.transfer_type === "depot_to_depot") {
      return transfer.source_warehouse?.name || "N/A";
    } else {
      return transfer.source_pos?.name || "N/A";
    }
  };

  const getDestinationName = (transfer: Transfer): string => {
    if (transfer.transfer_type === "depot_to_pos") {
      return transfer.destination_pos?.name || "N/A";
    } else {
      return transfer.destination_warehouse?.name || "N/A";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">Terminé</Badge>;
      case "cancelled":
        return <Badge variant="destructive">Annulé</Badge>;
      case "pending":
      default:
        return <Badge variant="default">En attente</Badge>;
    }
  };

  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-200">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50/50">
            <TableHead className="font-semibold text-gray-700 px-6 py-4">Référence</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Date</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Type</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Source</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Destination</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Article(s)</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Quantité</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Statut</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4">Notes</TableHead>
            <TableHead className="font-semibold text-gray-700 px-4 py-4 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-32 text-center text-gray-500">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <ArrowUpDown className="h-8 w-8 text-gray-400" />
                  <p>Aucun transfert trouvé</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer, index) => (
              <TableRow 
                key={transfer.id}
                className={`hover:bg-gray-50/50 transition-colors ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                }`}
              >
                <TableCell className="font-medium px-6 py-4">
                  {transfer.reference || `Transfer-${transfer.id?.substring(0, 8)}` || "-"}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {safeFormatDate(transfer.transfer_date || transfer.created_at)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex items-center space-x-2">
                    {getTransferTypeIcon(transfer.transfer_type || "depot_to_depot")}
                    <span className="text-sm">
                      {getTransferTypeLabel(transfer.transfer_type || "depot_to_depot")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getSourceName(transfer)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getDestinationName(transfer)}
                </TableCell>
                <TableCell className="px-4 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {transfer.product?.name || "Produit non trouvé"}
                    </span>
                    {transfer.product?.reference && (
                      <span className="text-xs text-gray-500">
                        Réf: {transfer.product.reference}
                      </span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="px-4 py-4 font-medium">
                  {transfer.quantity || 0}
                </TableCell>
                <TableCell className="px-4 py-4">
                  {getStatusBadge(transfer.status || "pending")}
                </TableCell>
                <TableCell className="px-4 py-4 max-w-32">
                  <span className="text-sm text-gray-600 truncate block">
                    {transfer.notes || "-"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(transfer)}
                      className="h-8 w-8 p-0 hover:bg-blue-50"
                    >
                      <Edit2 className="h-4 w-4 text-blue-600" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(transfer.id)}
                      className="h-8 w-8 p-0 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 text-red-600" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};
