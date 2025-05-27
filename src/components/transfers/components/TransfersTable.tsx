
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
        return <ArrowRight className="h-5 w-5 text-blue-600" />;
      case "pos_to_depot":
        return <ArrowLeft className="h-5 w-5 text-green-600" />;
      case "depot_to_depot":
        return <ArrowUpDown className="h-5 w-5 text-purple-600" />;
      case "pos_to_pos":
        return <ArrowUpDown className="h-5 w-5 text-orange-600" />;
      default:
        return <ArrowUpDown className="h-5 w-5 text-gray-600" />;
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
        return <Badge variant="success" className="font-medium">Terminé</Badge>;
      case "cancelled":
        return <Badge variant="destructive" className="font-medium">Annulé</Badge>;
      case "pending":
      default:
        return <Badge variant="default" className="font-medium">En attente</Badge>;
    }
  };

  return (
    <div className="w-full overflow-auto rounded-lg border border-gray-300 shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-100 border-b-2 border-gray-300">
            <TableHead className="font-bold text-gray-800 px-6 py-5 text-sm">Référence</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Date</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Type</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Source</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Destination</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Article(s)</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Quantité</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Statut</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm">Notes</TableHead>
            <TableHead className="font-bold text-gray-800 px-4 py-5 text-sm text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transfers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={10} className="h-40 text-center text-gray-600">
                <div className="flex flex-col items-center justify-center space-y-3">
                  <ArrowUpDown className="h-12 w-12 text-gray-400" />
                  <p className="text-lg font-medium">Aucun transfert trouvé</p>
                  <p className="text-sm text-gray-500">Créez votre premier transfert pour commencer</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            transfers.map((transfer, index) => (
              <TableRow 
                key={transfer.id}
                className={`hover:bg-blue-50 transition-colors border-b border-gray-200 ${
                  index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                }`}
              >
                <TableCell className="font-semibold text-gray-900 px-6 py-5 text-sm">
                  {transfer.reference || `Transfer-${transfer.id?.substring(0, 8)}` || "-"}
                </TableCell>
                <TableCell className="px-4 py-5 text-sm text-gray-800">
                  {safeFormatDate(transfer.transfer_date || transfer.created_at)}
                </TableCell>
                <TableCell className="px-4 py-5">
                  <div className="flex items-center space-x-3">
                    {getTransferTypeIcon(transfer.transfer_type || "depot_to_depot")}
                    <span className="text-sm font-medium text-gray-800">
                      {getTransferTypeLabel(transfer.transfer_type || "depot_to_depot")}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-4 py-5 text-sm font-medium text-gray-800">
                  {getSourceName(transfer)}
                </TableCell>
                <TableCell className="px-4 py-5 text-sm font-medium text-gray-800">
                  {getDestinationName(transfer)}
                </TableCell>
                <TableCell className="px-4 py-5">
                  <Badge variant="outline" className="font-medium text-gray-800 border-gray-300">
                    <div className="flex flex-col items-start">
                      <span className="font-semibold">
                        {transfer.product?.name || "Produit non trouvé"}
                      </span>
                      {transfer.product?.reference && (
                        <span className="text-xs text-gray-600 mt-1">
                          Réf: {transfer.product.reference}
                        </span>
                      )}
                    </div>
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-5 text-sm font-bold text-gray-900 text-center">
                  {transfer.quantity || 0}
                </TableCell>
                <TableCell className="px-4 py-5">
                  {getStatusBadge(transfer.status || "pending")}
                </TableCell>
                <TableCell className="px-4 py-5 max-w-32">
                  <span className="text-sm text-gray-700 truncate block">
                    {transfer.notes || "-"}
                  </span>
                </TableCell>
                <TableCell className="px-4 py-5 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(transfer)}
                      className="h-9 w-9 p-0 border-2 border-blue-300 bg-blue-50 hover:bg-blue-100 hover:border-blue-400 transition-all"
                    >
                      <Edit2 className="h-4 w-4 text-blue-700" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(transfer.id)}
                      className="h-9 w-9 p-0 border-2 border-red-300 bg-red-50 hover:bg-red-100 hover:border-red-400 transition-all"
                    >
                      <Trash2 className="h-4 w-4 text-red-700" />
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
