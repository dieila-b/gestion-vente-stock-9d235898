
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useBucketCheck = () => {
  useEffect(() => {
    const checkBucket = async () => {
      try {
        // Vérifier si le bucket existe
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking buckets:", error);
          return;
        }
        
        const bucketExists = buckets.some(bucket => bucket.name === 'lovable-uploads');
        
        if (bucketExists) {
          console.log("Bucket 'lovable-uploads' exists");
        } else {
          console.log("Bucket 'lovable-uploads' does not exist");
        }
      } catch (err) {
        console.error("Error in bucket check:", err);
      }
    };
    
    checkBucket();
  }, []);
};
