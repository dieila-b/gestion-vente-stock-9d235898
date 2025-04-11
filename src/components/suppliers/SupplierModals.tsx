
import { SupplierOrderForm } from "./SupplierOrderForm";
import { PriceRequestForm } from "./PriceRequestForm";
import type { Supplier } from "@/types/supplier";

interface SupplierModalsProps {
  isOrderFormOpen: boolean;
  isPriceRequestFormOpen: boolean;
  selectedSupplier: Supplier | null;
  onCloseOrderForm: () => void;
  onClosePriceForm: () => void;
}

export const SupplierModals = ({
  isOrderFormOpen,
  isPriceRequestFormOpen,
  selectedSupplier,
  onCloseOrderForm,
  onClosePriceForm,
}: SupplierModalsProps) => {
  return (
    <>
      {isOrderFormOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto transform perspective-1000 rotate-x-1 hover:rotate-x-0 transition-transform duration-300"
          >
            <SupplierOrderForm
              supplier={selectedSupplier}
              onClose={onCloseOrderForm}
            />
          </div>
        </div>
      )}

      {isPriceRequestFormOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-lg z-50 flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div 
            className="w-full max-w-4xl max-h-[90vh] overflow-y-auto transform perspective-1000 rotate-x-1 hover:rotate-x-0 transition-transform duration-300"
          >
            <PriceRequestForm
              supplier={selectedSupplier}
              onClose={onClosePriceForm}
              isOpen={isPriceRequestFormOpen}
              onSuccess={() => {
                // You might want to refresh supplier data or show a success message
                onClosePriceForm();
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};
