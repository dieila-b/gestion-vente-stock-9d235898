
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatGNF } from '@/lib/currency';
import { ReturnItem } from '@/types/customer-return';
import { CatalogProduct } from '@/types/catalog';

interface CustomerReturnItemProps {
  item: ReturnItem;
  product: CatalogProduct;
}

const CustomerReturnItem: React.FC<CustomerReturnItemProps> = ({ item, product }) => {
  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{product.name}</h3>
            <p className="text-sm text-muted-foreground">{product.reference || "Sans référence"}</p>
            <div className="mt-2 flex items-center gap-2">
              <Badge variant="outline" className="flex items-center gap-1">
                Qté: {item.quantity}
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                Prix: {formatGNF(item.price || 0)}
              </Badge>
            </div>
          </div>
          <Badge variant={item.quantity > 0 ? "destructive" : "outline"}>
            {formatGNF((item.price || 0) * item.quantity)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomerReturnItem;
