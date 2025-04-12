
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
          // Try to create the bucket
          try {
            const { error: createError } = await supabase.storage.createBucket('lovable-uploads', {
              public: true,
              fileSizeLimit: 5242880, // 5MB in bytes
              allowedMimeTypes: ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp']
            });
            
            if (createError) {
              console.error("Error creating bucket:", createError);
              toast.warning("Impossible de créer le stockage pour les téléchargements d'images");
            } else {
              console.log("Bucket 'lovable-uploads' created successfully");
              setBucketExists(true);
              toast.success("Stockage pour les téléchargements configuré avec succès");
            }
          } catch (createErr) {
            console.error("Exception creating bucket:", createErr);
            toast.warning("Stockage non configuré pour les téléchargements");
          }
        }
      } catch (err) {
        console.error("Exception checking bucket:", err);
      }
    };
    
    checkBucket();
  }, []);
  
  return { bucketExists };
};
