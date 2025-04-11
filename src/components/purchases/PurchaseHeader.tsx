
import React from 'react';
import { PageHeader } from '../ui/page-header';

export interface PurchaseHeaderProps {
  title: string;
  description: string;
}

export const PurchaseHeader: React.FC<PurchaseHeaderProps> = ({ title, description }) => {
  return (
    <PageHeader>
      <PageHeader.Title>{title}</PageHeader.Title>
      <PageHeader.Description>{description}</PageHeader.Description>
    </PageHeader>
  );
};
