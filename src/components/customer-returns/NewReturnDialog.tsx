
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
    handleItemCheckboxChange,
    handleQuantityChange,
    addItemToReturn,
    removeItemFromReturn,
    onSubmit,
    isSubmitting,
    isLoading
  } = returnDialogHook;

  const [selectedInvoiceItems, setSelectedInvoiceItems] = useState<{ [key: string]: boolean }>({});

  // Load data when dialog opens
  useEffect(() => {
    if (isOpen) {
      // Nothing to do - clients are already loaded by the hook
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    await onSubmit(form.getValues());
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
              clientId={form.getValues("client_id")} 
              onClientChange={handleClientChange} 
            />

            <ReturnInvoiceSelect 
              clientId={form.getValues("client_id")}
              invoiceId={form.getValues("invoice_id")}
              filteredInvoices={invoices}
              onInvoiceChange={handleInvoiceChange}
            />

            <ReturnReasonField 
              reason={form.getValues("reason")} 
              onChange={(e) => form.setValue("reason", e.target.value)} 
            />

            <InvoiceItemsList 
              invoiceItems={invoiceItems}
              selectedItems={selectedInvoiceItems}
              onItemCheckboxChange={handleItemCheckboxChange}
              onQuantityChange={handleQuantityChange}
              getItemQuantity={(productId) => {
                const item = selectedItems.find(item => item.product_id === productId);
                return item ? item.quantity : 0;
              }}
              getInvoiceItemQuantity={(productId) => {
                const item = invoiceItems.find(item => item.product_id === productId);
                return item ? item.original_quantity : 0;
              }}
            />

            <ManualItemsList 
              items={selectedItems}
              products={[]} // We'll pass an empty array for now as we're not implementing this feature yet
              invoiceItems={invoiceItems}
              onManualProductChange={(index, field, value) => {
                // Not implemented in this version
              }}
              onRemoveManualProduct={removeItemFromReturn}
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
