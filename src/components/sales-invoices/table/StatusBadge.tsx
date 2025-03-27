
import React from 'react';

type StatusType = 'payment' | 'delivery';

interface StatusBadgeProps {
  status: string;
  type: StatusType;
}

export function StatusBadge({ status, type }: StatusBadgeProps) {
  const getStatusClasses = (status: string, type: StatusType) => {
    if (type === 'payment') {
      switch (status) {
        case 'paid': return 'bg-green-500/10 text-green-500';
        case 'partial': return 'bg-yellow-500/10 text-yellow-500';
        default: return 'bg-red-500/10 text-red-500';
      }
    } else {
      switch (status) {
        case 'delivered': return 'bg-green-500/10 text-green-500';
        case 'partial': return 'bg-yellow-500/10 text-yellow-500';
        case 'awaiting': return 'bg-blue-500/10 text-blue-500';
        default: return 'bg-gray-500/10 text-gray-500';
      }
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payé';
      case 'partial': return 'Partiel';
      default: return 'En attente';
    }
  };

  const getDeliveryStatusText = (status: string) => {
    switch (status) {
      case 'delivered': return 'Livré';
      case 'partial': return 'Partiel';
      case 'awaiting': return 'À livrer';
      default: return 'En attente';
    }
  };

  const text = type === 'payment' 
    ? getPaymentStatusText(status) 
    : getDeliveryStatusText(status);
  
  const classes = getStatusClasses(status, type);

  return (
    <span className={`px-2 py-1 rounded-full text-xs ${classes}`}>
      {text}
    </span>
  );
}
