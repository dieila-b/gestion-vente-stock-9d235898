
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function setupPreorderSubscription(preorderId: string): () => void {
  const preorderSubscription = supabase
    .channel(`preorder-${preorderId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'preorders',
        filter: `id=eq.${preorderId}`,
      },
      (payload) => {
        if (payload.new.status === 'available' && payload.old.status === 'pending') {
          toast.success("Bonne nouvelle! Votre précommande est maintenant disponible.");
        }
      }
    )
    .subscribe();
    
  // Return cleanup function
  return () => {
    preorderSubscription.unsubscribe();
  };
}
