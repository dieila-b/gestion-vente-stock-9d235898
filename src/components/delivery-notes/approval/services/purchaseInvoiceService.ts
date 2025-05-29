
import { supabase } from "@/integrations/supabase/client";
import { DeliveryNote } from "@/types/delivery-note";
import { toast } from "sonner";

interface ReceivedQuantity {
  id: string;
  quantity_received: number;
}

export const purchaseInvoiceService = {
  // Cette fonction n'est plus utilisée car le déclencheur de base de données 
  // gère automatiquement la création des factures d'achat
  async createPurchaseInvoice(deliveryNote: DeliveryNote, receivedItems: ReceivedQuantity[]) {
    console.log('Note: Purchase invoice creation is now handled by database trigger');
    console.log('Delivery note:', deliveryNote.delivery_number);
    
    // Le déclencheur de base de données s'occupe de la création automatique
    // Nous gardons cette fonction pour la compatibilité mais elle ne fait plus rien
    return null;
  }
};
