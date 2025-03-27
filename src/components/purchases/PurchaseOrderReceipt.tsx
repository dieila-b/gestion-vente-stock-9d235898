
import { formatGNF } from "@/lib/currency";
import { CartItem } from "@/types/pos";
import { PurchaseOrder, PurchaseOrderItem } from "@/types/purchaseOrder";
import { useRef } from "react";
import { PurchaseOrderReceiptActions } from "./receipt/PurchaseOrderReceiptActions";
import { PurchaseOrderReceiptHeader } from "./receipt/PurchaseOrderReceiptHeader";
import { PurchaseOrderReceiptItems } from "./receipt/PurchaseOrderReceiptItems";
import { PurchaseOrderReceiptSummary } from "./receipt/PurchaseOrderReceiptSummary";

interface PurchaseOrderReceiptProps {
  order: PurchaseOrder;
  showPrintButton?: boolean;
  showShareButtons?: boolean;
}

// Enhanced interface for CartItem to include the total property
interface EnhancedCartItem extends CartItem {
  total: number;
}

export const PurchaseOrderReceipt = ({ 
  order, 
  showPrintButton = false,
  showShareButtons = false 
}: PurchaseOrderReceiptProps) => {
  const printRef = useRef<HTMLDivElement>(null);
  
  const items: EnhancedCartItem[] = order.items.map((item) => ({
    id: item.id,
    name: item.designation || "Produit",
    quantity: item.quantity || 0,
    price: item.unit_price || 0,
    total: item.total_price || 0,
    discount: 0,
    category: "default"
  }));

  return (
    <div className="bg-white text-black">
      {/* Print and share actions at the top */}
      <PurchaseOrderReceiptActions
        showPrintButton={showPrintButton}
        showShareButtons={showShareButtons}
        orderNumber={order.order_number}
        supplierName={order.supplier.name}
        supplierPhone={order.supplier.phone || null}
        supplierEmail={order.supplier.email || null}
        totalAmount={order.total_amount}
        printRef={printRef}
        formatGNF={formatGNF}
      />
      
      <div 
        ref={printRef} 
        className="bg-white text-black print:bg-white print:text-black p-4 max-w-[210mm] mx-auto min-h-[297mm]"
        style={{
          width: '210mm',
          minHeight: '297mm',
          padding: '10mm',
          boxSizing: 'border-box'
        }}
      >
        <PurchaseOrderReceiptHeader
          orderNumber={order.order_number}
          createdAt={order.created_at}
          supplier={order.supplier}
        />

        <PurchaseOrderReceiptItems
          items={items}
          formatGNF={formatGNF}
        />

        <PurchaseOrderReceiptSummary
          totalAmount={order.total_amount}
          formatGNF={formatGNF}
        />
      </div>
    </div>
  );
};
