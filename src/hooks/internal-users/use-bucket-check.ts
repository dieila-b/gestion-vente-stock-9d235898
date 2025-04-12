
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useBucketCheck = () => {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);
  const [isBucketCheckLoading, setIsBucketCheckLoading] = useState(true);

  useEffect(() => {
    const checkBucket = async () => {
      try {
        setIsBucketCheckLoading(true);
        
        // Check if bucket exists
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking buckets:", error);
          toast.error("Erreur lors de la vérification du stockage");
          return;
        }
        
        const lovableBucket = buckets.find(bucket => bucket.name === 'lovable-uploads');
        setBucketExists(!!lovableBucket);
        
        if (!lovableBucket) {
          console.warn("Le bucket 'lovable-uploads' n'existe pas");
          toast.warning("Stockage pour les téléchargements d'images non configuré. Les images de profil ne seront pas enregistrées.");
        }
      } catch (err) {
        console.error("Exception checking bucket:", err);
      } finally {
        setIsBucketCheckLoading(false);
      }
    };
    
    checkBucket();
  }, []);
  
  return { bucketExists, isBucketCheckLoading };
};
