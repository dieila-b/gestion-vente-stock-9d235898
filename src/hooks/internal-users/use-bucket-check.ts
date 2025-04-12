
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
          console.warn("Le bucket 'lovable-uploads' n'existe pas, tentative de création...");
          
          try {
            const { error: createError } = await supabase.storage.createBucket('lovable-uploads', {
              public: true,
              fileSizeLimit: 5242880, // 5MB in bytes
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
            });
            
            if (createError) {
              console.error("Error creating bucket:", createError);
              toast.warning("Impossible de créer le stockage pour les téléchargements d'images. Les images ne fonctionneront pas.");
            } else {
              console.log("Bucket 'lovable-uploads' created successfully");
              setBucketExists(true);
              
              // Add a bucket policy to make files publicly readable
              const { error: policyError } = await supabase.storage.from('lovable-uploads').createSignedUrl('test-policy', 3600);
              
              if (policyError && !policyError.message.includes('no such object')) {
                console.error("Error setting bucket policy:", policyError);
              }
              
              toast.success("Stockage pour les téléchargements configuré avec succès");
            }
          } catch (createErr) {
            console.error("Exception creating bucket:", createErr);
            toast.warning("Stockage non configuré pour les téléchargements d'images");
          }
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
