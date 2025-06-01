
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Eye, Edit, Trash2 } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";

export function DeliveryNotesList() {
  const { data: deliveryNotes = [], isLoading, error } = useQuery({
    queryKey: ['delivery-notes'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('delivery_notes')
          .select(`
            *,
            supplier:suppliers(name),
            purchase_order:purchase_orders(order_number)
          `)
          .eq('deleted', false)
          .order('created_at', { ascending: false });

        if (error) throw error;
        return data || [];
      } catch (error) {
        console.error('Error fetching delivery notes:', error);
        return [];
      }
    }
  });

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8 text-red-500">
          Erreur lors du chargement des bons de livraison
        </div>
      </Card>
    );
  }

  const columns = [
    {
      accessorKey: 'delivery_number',
      header: 'N° Bon',
    },
    {
      accessorKey: 'supplier.name',
      header: 'Fournisseur',
      cell: ({ row }: any) => row.original.supplier?.name || 'N/A',
    },
    {
      accessorKey: 'status',
      header: 'Statut',
      cell: ({ row }: any) => {
        const status = row.original.status;
        const variant = status === 'pending' ? 'secondary' : 
                       status === 'received' ? 'default' : 'outline';
        return <Badge variant={variant}>{status}</Badge>;
      },
    },
    {
      accessorKey: 'created_at',
      header: 'Date',
      cell: ({ row }: any) => new Date(row.original.created_at).toLocaleDateString(),
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }: any) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            <Eye className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Bons de Livraison</h2>
      </div>
      
      <DataTable 
        columns={columns} 
        data={deliveryNotes}
        searchKey="delivery_number"
      />
    </Card>
  );
}
