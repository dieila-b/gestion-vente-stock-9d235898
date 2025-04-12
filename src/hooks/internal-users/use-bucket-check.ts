
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
        
        const lovableBucket = buckets.find(bucket => bucket.name === 'lovable-uploads');
        
        if (!lovableBucket) {
          console.warn("Le bucket 'lovable-uploads' n'existe pas ou n'est pas accessible");
          
          // Try to create the bucket if it doesn't exist
          try {
            const { error: createError } = await supabase.storage.createBucket('lovable-uploads', {
              public: true
            });
            
            if (createError) {
              console.error("Error creating bucket:", createError);
              setBucketExists(false);
            } else {
              console.log("Bucket 'lovable-uploads' created successfully");
              setBucketExists(true);
              toast.success("Stockage d'images configuré avec succès");
            }
          } catch (createErr) {
            console.error("Exception creating bucket:", createErr);
            setBucketExists(false);
          }
        } else {
          console.log("Bucket 'lovable-uploads' exists");
          setBucketExists(true);
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
