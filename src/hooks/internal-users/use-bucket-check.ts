
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
          setIsBucketCheckLoading(false);
          return;
        }
        
        console.log("Available buckets:", buckets);
        const productImagesBucket = buckets.find(bucket => bucket.name === 'product-images' || bucket.id === 'product-images');
        
        if (!productImagesBucket) {
          console.warn("Le bucket 'product-images' n'existe pas ou n'est pas accessible");
          setBucketExists(false);
          toast.error("Le stockage d'images n'est pas configuré correctement. Contactez l'administrateur.");
        } else {
          console.log("Bucket 'product-images' exists:", productImagesBucket);
          setBucketExists(true);
        }
      } catch (err) {
        console.error("Exception checking bucket:", err);
        setBucketExists(false);
      } finally {
        setIsBucketCheckLoading(false);
      }
    };
    
    checkBucket();
  }, []);
  
  return { bucketExists, isBucketCheckLoading };
};
