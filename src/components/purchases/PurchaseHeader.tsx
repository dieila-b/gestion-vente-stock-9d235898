
import React from 'react';
import { PageHeader } from "@/components/ui/page-header";

export interface PurchaseHeaderProps {
  title?: string;
  description?: string;
}

export const PurchaseHeader: React.FC<PurchaseHeaderProps> = ({ 
  title = "Achats", 
  description = "Gérez vos commandes et factures d'achat"
}) => {
  return (
    <div className="flex flex-col gap-1">
      <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
};
