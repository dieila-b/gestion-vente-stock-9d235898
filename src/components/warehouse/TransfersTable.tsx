
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
import { Edit, Trash2 } from "lucide-react";

interface TransfersTableProps {
  transfers: any[];
  isLoading: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export const TransfersTable: React.FC<TransfersTableProps> = ({
  transfers,
  isLoading,
  onEdit,
  onDelete,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading transfers...</p>
        </div>
      </div>
    );
  }

  if (transfers.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <p className="mb-2 text-lg font-semibold">No transfers found</p>
        <p className="text-sm text-muted-foreground">
          Create a new transfer to get started
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Reference</TableHead>
          <TableHead>Source</TableHead>
          <TableHead>Destination</TableHead>
          <TableHead>Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Quantity</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {transfers.map((transfer) => (
          <TableRow key={transfer.id}>
            <TableCell className="font-medium">
              {transfer.reference || `Transfer-${transfer.id.slice(0, 8)}`}
            </TableCell>
            <TableCell>
              {transfer.source_warehouse?.name || transfer.source_pos?.name || 'N/A'}
            </TableCell>
            <TableCell>
              {transfer.destination_warehouse?.name || transfer.destination_pos?.name || 'N/A'}
            </TableCell>
            <TableCell>
              {new Date(transfer.transfer_date || transfer.created_at).toLocaleDateString()}
            </TableCell>
            <TableCell>
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                transfer.status === 'completed' 
                  ? 'bg-green-100 text-green-800' 
                  : transfer.status === 'pending' 
                  ? 'bg-yellow-100 text-yellow-800' 
                  : 'bg-red-100 text-red-800'
              }`}>
                {transfer.status || 'pending'}
              </span>
            </TableCell>
            <TableCell>{transfer.quantity || 0}</TableCell>
            <TableCell className="text-right">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(transfer.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(transfer.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
