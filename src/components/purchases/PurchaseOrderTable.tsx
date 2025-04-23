
import { formatDate } from "@/lib/formatters";
import { formatGNF } from "@/lib/currency";
import { PurchaseOrder } from "@/types/purchase-order";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, Edit, Trash2, Box, Check, X, Loader } from "lucide-react";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface PurchaseOrderTableProps {
  orders: PurchaseOrder[];
  isLoading: boolean;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
  onPrint: (order: PurchaseOrder) => void;
}

export function PurchaseOrderTable({
  orders,
  isLoading,
  onApprove,
  onDelete,
  onEdit,
  onPrint
}: PurchaseOrderTableProps) {
  const [processingId, setProcessingId] = useState<string | null>(null);
  
  const handleApprove = async (id: string) => {
    setProcessingId(id);
    try {
      await onApprove(id);
    } finally {
      setProcessingId(null);
    }
  };
  
  const handleDelete = async (id: string) => {
    setProcessingId(id);
    try {
      await onDelete(id);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="py-8 text-center">
        <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
        <p>Chargement des bons de commande...</p>
      </div>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Alert>
        <Box className="h-5 w-5" />
        <AlertDescription>
          Aucun bon de commande trouvé. Créez votre premier bon de commande.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="rounded-md bg-background/95 border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>N° Commande</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Fournisseur</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Montant Total</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <TableRow key={order.id}>
              <TableCell className="font-medium">{order.order_number}</TableCell>
              <TableCell>{formatDate(order.created_at)}</TableCell>
              <TableCell>{order.supplier?.name || 'Non spécifié'}</TableCell>
              <TableCell>
                <StatusBadge
                  status={order.status}
                  statusMap={{
                    draft: { label: "Brouillon", variant: "outline" },
                    pending: { label: "En attente", variant: "warning" },
                    approved: { label: "Approuvé", variant: "success" },
                    delivered: { label: "Livré", variant: "info" }
                  }}
                />
              </TableCell>
              <TableCell>{formatGNF(order.total_amount)}</TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  {order.status === 'approved' || order.status === 'delivered' ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => onPrint(order)}
                            className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-500"
                          >
                            <Printer className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Imprimer</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <>
                      {order.status === 'pending' && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleApprove(order.id)}
                                disabled={processingId === order.id}
                                className="bg-green-500/10 hover:bg-green-500/20 text-green-500"
                              >
                                {processingId === order.id ? (
                                  <Loader className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Approuver</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => onEdit(order.id)}
                              className="bg-blue-500/10 hover:bg-blue-500/20 text-blue-500"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Modifier</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(order.id)}
                              disabled={processingId === order.id}
                              className="bg-red-500/10 hover:bg-red-500/20 text-red-500"
                            >
                              {processingId === order.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Supprimer</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
