
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { toast } from "sonner";

interface ReceivedQuantity {
  id: string;
  quantity_received: number;
}

export const purchaseInvoiceService = {
  async createPurchaseInvoice(deliveryNote: DeliveryNote, receivedItems: ReceivedQuantity[]) {
    try {
      console.log('Creating purchase invoice for delivery note:', deliveryNote.delivery_number);
      console.log('Received items:', receivedItems);
      
      // Generate invoice number based on delivery number
      const invoiceNumber = `FA-${deliveryNote.delivery_number?.replace('BL-', '') || Date.now()}`;
      
      // Calculate total amount based on received quantities
      let totalAmount = 0;
      receivedItems.forEach(receivedItem => {
        const originalItem = deliveryNote.items.find(item => item.id === receivedItem.id);
        if (originalItem && receivedItem.quantity_received > 0) {
          totalAmount += receivedItem.quantity_received * originalItem.unit_price;
        }
      });

      console.log('Calculated total amount:', totalAmount);

      if (totalAmount <= 0) {
        console.warn('No items received or total amount is 0, skipping invoice creation');
        toast.warning("Aucun article reçu, facture d'achat non créée");
        return null;
      }

      // Create purchase invoice with proper field mapping
      const invoiceData = {
        invoice_number: invoiceNumber,
        supplier_id: deliveryNote.supplier_id,
        total_amount: totalAmount,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      console.log('Creating invoice with data:', invoiceData);

      const { data: invoice, error: invoiceError } = await supabase
        .from('purchase_invoices')
        .insert(invoiceData)
        .select()
        .single();

      if (invoiceError) {
        console.error('Error creating purchase invoice:', invoiceError);
        throw new Error(`Erreur lors de la création de la facture: ${invoiceError.message}`);
      }

      console.log('Purchase invoice created successfully:', invoice);
      toast.success(`Facture d'achat ${invoiceNumber} créée automatiquement`);
      
      return invoice;
    } catch (error: any) {
      console.error('Error in createPurchaseInvoice:', error);
      toast.error(`Erreur lors de la création de la facture d'achat: ${error.message}`);
      // Re-throw the error to make sure the approval process is aware of the failure
      throw error;
    }
  }
};
