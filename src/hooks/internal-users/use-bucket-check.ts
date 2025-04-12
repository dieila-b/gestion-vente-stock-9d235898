
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
          
          try {
            // Try to create the bucket if it doesn't exist
            const { error: createError } = await supabase.storage.createBucket('lovable-uploads', {
              public: true,
              fileSizeLimit: 20971520 // 20MB in bytes
            });
            
            if (createError) {
              console.error("Error creating bucket:", createError);
              setBucketExists(false);
            } else {
              console.log("Bucket 'lovable-uploads' created successfully");
              
              // Update the public access policy for the bucket
              const { error: policyError } = await supabase.storage.from('lovable-uploads')
                .createSignedUrl('test-policy.txt', 60);
              
              if (policyError && policyError.message.includes('not found')) {
                // Create a temporary file to make sure the bucket is properly initialized
                const testContent = new Blob(['test'], { type: 'text/plain' });
                const testFile = new File([testContent], 'test-policy.txt', { type: 'text/plain' });
                
                await supabase.storage.from('lovable-uploads').upload('test-policy.txt', testFile);
                console.log("Created test file to initialize bucket");
              }
              
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
