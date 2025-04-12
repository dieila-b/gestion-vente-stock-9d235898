
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { 
  ReturnClientSelect,
  ReturnInvoiceSelect,
  ReturnReasonField,
  InvoiceItemsList,
  ManualItemsList,
  ReturnNotesField,
  ReturnItemSummary,
  useReturnDialog
} from "./new-return";

interface NewReturnDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function NewReturnDialog({ isOpen, onClose, onSuccess }: NewReturnDialogProps) {
  const {
    clients,
    filteredInvoices,
    invoiceItems,
    products,
    selectedItems,
    newReturn,
    setClients,
    fetchInvoices,
    fetchProducts,
    handleInputChange,
    handleSelectChange,
    handleItemCheckboxChange,
    handleQuantityChange,
    handleAddManualProduct,
    handleRemoveManualProduct,
    handleManualProductChange,
    handleSubmitNewReturn,
    getItemQuantity,
    getInvoiceItemQuantity
  } = useReturnDialog(onSuccess, onClose);

  // Initialize data when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchInvoices();
      fetchProducts();
    }
  }, [isOpen]);

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
              clientId={newReturn.client_id} 
              onClientChange={(value) => handleSelectChange('client_id', value)} 
            />

            <ReturnInvoiceSelect 
              clientId={newReturn.client_id}
              invoiceId={newReturn.invoice_id}
              filteredInvoices={filteredInvoices}
              onInvoiceChange={(value) => handleSelectChange('invoice_id', value)}
            />

            <ReturnReasonField 
              reason={newReturn.reason} 
              onChange={handleInputChange} 
            />

            <InvoiceItemsList 
              invoiceItems={invoiceItems}
              selectedItems={selectedItems}
              onItemCheckboxChange={handleItemCheckboxChange}
              onQuantityChange={handleQuantityChange}
              getItemQuantity={getItemQuantity}
              getInvoiceItemQuantity={getInvoiceItemQuantity}
            />

            <ManualItemsList 
              items={newReturn.items}
              products={products}
              invoiceItems={invoiceItems}
              onManualProductChange={handleManualProductChange}
              onRemoveManualProduct={handleRemoveManualProduct}
              onAddManualProduct={handleAddManualProduct}
            />

            <ReturnItemSummary itemsCount={newReturn.items.length} />

            <ReturnNotesField 
              notes={newReturn.notes} 
              onChange={handleInputChange} 
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button onClick={handleSubmitNewReturn}>
            Créer le retour
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
