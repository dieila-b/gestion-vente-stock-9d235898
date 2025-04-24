
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PurchaseOrder } from "@/types/purchase-order";
import { validatePurchaseOrder } from "./utils/validate-purchase-order";
import { updatePurchaseOrderToApproved } from "./utils/update-purchase-order-status";
import { createDeliveryNote } from "./utils/create-delivery-note";
import { createDeliveryNoteItems } from "./utils/create-delivery-note-items";
import { constructPurchaseOrder } from "./utils/construct-purchase-order";

export function useApprovePurchaseOrder() {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (id: string): Promise<PurchaseOrder> => {
      try {
        console.log("Starting approval process for order:", id);
        
        // 1. Valider le bon de commande
        const orderCheck = await validatePurchaseOrder(id);
        
        // Vérifier si la commande est déjà approuvée
        if (orderCheck.status === 'approved') {
          console.log("Order was already approved");
          toast.info("Ce bon de commande est déjà approuvé");
          
          // Construire un objet minimal pour les commandes déjà approuvées
          return constructPurchaseOrder({ 
            id: orderCheck.id,
            status: orderCheck.status,
            delivery_note_created: false
          });
        }
        
        // 2. Mettre à jour le statut du bon de commande
        const updatedOrder = await updatePurchaseOrderToApproved(id);
        console.log("Order updated to approved:", updatedOrder.id);
        
        // Variable pour suivre si un bon de livraison a été créé avec succès
        let deliveryNoteCreated = false;
        let deliveryNoteId = null;
        
        try {
          // 3. Créer le bon de livraison
          const deliveryNote = await createDeliveryNote(updatedOrder);
          console.log("Delivery note creation result:", deliveryNote);
          
          if (deliveryNote && deliveryNote.id) {
            deliveryNoteId = deliveryNote.id;
            
            // 4. Créer les éléments du bon de livraison
            const deliveryItems = await createDeliveryNoteItems(deliveryNote.id, id);
            console.log("Delivery note items created:", deliveryItems?.length || 0);
            
            // Marquer comme créé uniquement si on a bien créé les items
            deliveryNoteCreated = true;
          } else {
            console.warn("No delivery note ID returned or creation failed");
          }
        } catch (deliveryError: any) {
          // En cas d'erreur lors de la création du bon de livraison, on continue
          // mais on marque delivery_note_created comme false
          console.error("Error creating delivery note:", deliveryError?.message || deliveryError);
          toast.error(`Erreur lors de la création du bon de livraison: ${deliveryError?.message || "Erreur inconnue"}`);
        }
        
        // 5. Actualiser les requêtes affectées
        await queryClient.invalidateQueries({ queryKey: ['purchase-orders'] });
        if (deliveryNoteCreated) {
          await queryClient.invalidateQueries({ queryKey: ['delivery-notes'] });
        }
        
        // 6. Afficher une notification appropriée
        if (deliveryNoteCreated) {
          toast.success("Bon de commande approuvé et bon de livraison créé");
        } else {
          toast.success("Bon de commande approuvé");
          toast.warning("Création du bon de livraison échouée");
        }
        
        // 7. Construire l'objet de retour avec la valeur correcte de delivery_note_created
        const finalResult = constructPurchaseOrder({
          ...updatedOrder,
          delivery_note_created: deliveryNoteCreated
        });
        
        console.log("Final approval result:", {
          id: finalResult.id,
          status: finalResult.status,
          delivery_note_created: finalResult.delivery_note_created
        });
        
        return finalResult;
      } catch (error: any) {
        console.error("Error in useApprovePurchaseOrder:", error);
        toast.error(`Erreur lors de l'approbation: ${error?.message || "Erreur inconnue"}`);
        throw error;
      }
    }
  });

  return mutation.mutateAsync;
}
