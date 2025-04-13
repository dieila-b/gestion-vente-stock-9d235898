
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Fonction pour vérifier l'existence du bucket
const checkBucket = async () => {
  try {
    // Récupération de la liste des buckets disponibles
    const { data: buckets, error } = await supabase.storage.listBuckets();
    
    if (error) {
      console.error("Erreur lors de la récupération des buckets:", error);
      return false;
    }
    
    console.info("Available buckets:", buckets);
    
    // Vérification de l'existence du bucket 'lovable-uploads'
    const bucketExists = buckets.some(bucket => bucket.name === 'lovable-uploads');
    
    if (!bucketExists) {
      console.warn("Le bucket 'lovable-uploads' n'existe pas ou n'est pas accessible");
      
      // En mode développement, on peut afficher un toast
      if (import.meta.env.MODE !== 'production') {
        toast.warning("Le bucket de stockage 'lovable-uploads' n'est pas configuré. Les téléchargements d'images ne fonctionneront pas.");
      }
      
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Exception lors de la vérification du bucket:", error);
    return false;
  }
};

export const useBucketCheck = () => {
  useEffect(() => {
    // Vérifier l'existence du bucket au chargement du composant
    checkBucket().catch(console.error);
  }, []);
};
