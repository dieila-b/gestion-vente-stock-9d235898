
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useBucketCheck = () => {
  const [bucketExists, setBucketExists] = useState<boolean | null>(null);

  useEffect(() => {
    const checkBucket = async () => {
      try {
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
          // We don't create it automatically, as it requires admin privileges
          // Just notify the user that uploads may fail
          toast.warning("Stockage non configuré pour les téléchargements");
        }
      } catch (err) {
        console.error("Exception checking bucket:", err);
      }
    };
    
    checkBucket();
  }, []);
  
  return { bucketExists };
};
