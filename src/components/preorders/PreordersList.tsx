
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

export function PreordersList() {
  const { data: preorders = [], isLoading } = useQuery({
    queryKey: ['preorders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('preorders')
        .select(`
          *,
          client:clients(company_name, contact_name)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Terminée</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">En attente</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800">Annulée</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="h-5 w-5" />
        <h2 className="text-lg font-semibold">Précommandes</h2>
      </div>
      
      <div className="space-y-4">
        {preorders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Aucune précommande
          </p>
        ) : (
          preorders.map((preorder) => (
            <div key={preorder.id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium">Précommande #{preorder.id.slice(0, 8)}</h3>
                <p className="text-sm text-muted-foreground">
                  {preorder.client?.company_name || preorder.client?.contact_name || 'Client inconnu'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {new Date(preorder.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                {getStatusBadge(preorder.status)}
                <p className="text-sm text-muted-foreground mt-1">
                  {preorder.total_amount?.toLocaleString('fr-FR')} GNF
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
