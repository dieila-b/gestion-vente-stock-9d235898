
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
      <PageHeader>
        <PageHeader.Title>{title}</PageHeader.Title>
        <PageHeader.Description>{description}</PageHeader.Description>
      </PageHeader>
    </div>
  );
};
