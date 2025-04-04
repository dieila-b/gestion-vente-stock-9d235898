
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatGNF } from "@/lib/currency";
import { Eye, Edit } from "lucide-react";

interface OrderProps {
  order: {
    id: string;
    order_number: string;
    client_name: string;
    order_date: string;
    total_amount: number;
    status: string;
  };
  onView: () => void;
  onEdit: () => void;
}

export function Order({ order, onView, onEdit }: OrderProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">En attente</Badge>;
      case "in-progress":
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">En cours</Badge>;
      case "completed":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Terminé</Badge>;
      case "canceled":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Annulé</Badge>;
      default:
        return <Badge variant="outline">Inconnu</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{order.order_number}</CardTitle>
          {getStatusBadge(order.status)}
        </div>
        <CardDescription>{order.client_name}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date:</span>
            <span>{new Date(order.order_date).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between font-medium">
            <span>Total:</span>
            <span>{formatGNF(order.total_amount)}</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <div className="flex justify-between w-full">
          <Button variant="outline" size="sm" onClick={onView}>
            <Eye className="h-4 w-4 mr-2" />
            Voir
          </Button>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
