
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  ReturnClientSelect,
  ReturnInvoiceSelect,
  ReturnReasonField,
  InvoiceItemsList,
  ManualItemsList,
  ReturnNotesField,
  ReturnItemSummary
} from "./new-return";
import { useReturnDialog } from "@/components/customer-returns/new-return/useReturnDialog";

interface NewReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewReturnDialog({ isOpen, onClose, onSuccess }: NewReturnDialogProps) {
  const returnDialogHook = useReturnDialog();
  const {
    form,
    clients,
    invoices,
    invoiceItems,
    selectedItems,
    handleClientChange,
    handleInvoiceChange,
    addItemToReturn,
    removeItemFromReturn,
    onSubmit,
    isSubmitting,
    isLoading
  } = returnDialogHook;

  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState<{ [key: string]: boolean }>({});

  // Custom handlers to bridge between the component and the hook
  const handleItemCheckboxChange = (productId: string, checked: boolean) => {
    const newSelectedItems = { ...selectedInvoiceItems };
    newSelectedItems[productId] = checked;
    setSelectedInvoiceItems(newSelectedItems);
    
    // If checked, add to selected items, otherwise remove
    if (checked) {
      const item = invoiceItems.find(item => item.product_id === productId);
      if (item) {
        addItemToReturn({
          product_id: item.product_id,
          quantity: 1
        });
      }
    } else {
      removeItemFromReturn(productId);
    }
  };

  const handleQuantityChange = (productId: string, quantity: number) => {
    const existingItemIndex = selectedItems.findIndex(item => item.product_id === productId);
    if (existingItemIndex !== -1) {
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity = quantity;
      // Here we would update the form value
      form.setValue("items", updatedItems);
    }
  };

  const getItemQuantity = (productId: string) => {
    const item = selectedItems.find(item => item.product_id === productId);
    return item ? item.quantity : 0;
  };

  const getInvoiceItemQuantity = (productId: string) => {
    const item = invoiceItems.find(item => item.product_id === productId);
    return item ? item.original_quantity : 0;
  };

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Nothing to do - clients are already loaded by the hook
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    await onSubmit();
    onSuccess();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Nouveau retour client</DialogTitle>
          <DialogDescription>
            Créez un nouveau retour client en remplissant le formulaire ci-dessous.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-1 gap-4">
            <ReturnClientSelect 
              clientId={form.getValues("client_id") || ""} 
              onClientChange={handleClientChange} 
            />

            <ReturnInvoiceSelect 
              clientId={form.getValues("client_id") || ""}
              invoiceId={form.getValues("invoice_id") || ""}
              filteredInvoices={invoices}
              onInvoiceChange={handleInvoiceChange}
            />

            <ReturnReasonField 
              reason={form.getValues("reason") || ""} 
              onChange={(e) => form.setValue("reason", e.target.value)} 
            />

            <InvoiceItemsList 
              invoiceItems={invoiceItems}
              selectedItems={selectedInvoiceItems}
              onItemCheckboxChange={handleItemCheckboxChange}
              onQuantityChange={handleQuantityChange}
              getItemQuantity={getItemQuantity}
              getInvoiceItemQuantity={getInvoiceItemQuantity}
            />

            <ManualItemsList 
              items={selectedItems}
              products={[]} // Empty array since we're not implementing this feature yet
              invoiceItems={invoiceItems}
              onManualProductChange={() => {
                // Not implemented in this version
              }}
              onRemoveManualProduct={(index: number) => {
                // We need to find the product ID by index
                if (index >= 0 && index < selectedItems.length) {
                  const productId = selectedItems[index].product_id;
                  removeItemFromReturn(productId);
                }
              }}
              onAddManualProduct={() => {
                // Not implemented in this version
              }}
            />

            <ReturnItemSummary itemsCount={selectedItems.length} />

            <ReturnNotesField 
              notes={form.getValues("notes") || ""} 
              onChange={(e) => form.setValue("notes", e.target.value)} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Création..." : "Créer le retour"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
