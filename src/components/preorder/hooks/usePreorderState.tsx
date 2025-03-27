
import { useState } from "react";
import { Client } from "@/types/client";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";

export function usePreorderState() {
  const navigate = useNavigate();
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [showInvoiceDialog, setShowInvoiceDialog] = useState(false);
  const [currentPreorder, setCurrentPreorder] = useState<any>(null);
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [isEditing, setIsEditing] = useState(false);

  const handleCancel = () => {
    if (isEditing) {
      navigate('/preorder-invoices');
    } else {
      setSelectedClient(null);
    }
  };

  const handleCloseInvoice = () => {
    setShowInvoiceDialog(false);
    setSelectedClient(null);
    setCurrentPreorder(null);
    navigate('/preorder-invoices');
  };

  return {
    selectedClient,
    setSelectedClient,
    isLoading,
    setIsLoading,
    showPaymentDialog,
    setShowPaymentDialog,
    showInvoiceDialog,
    setShowInvoiceDialog,
    currentPreorder,
    setCurrentPreorder,
    editId,
    isEditing,
    setIsEditing,
    handleCancel,
    handleCloseInvoice,
  };
}
