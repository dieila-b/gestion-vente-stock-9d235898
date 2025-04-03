
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";

interface UpdateUserData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
  password?: string;
}

export const updateUser = async (data: UpdateUserData, user: InternalUser): Promise<boolean> => {
  try {
    // En mode développement, simuler le succès de l'opération sans faire d'appel à Supabase
    // puisque nous n'avons pas les droits RLS nécessaires
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log("Mode développement: Simulation de mise à jour d'utilisateur");
      
      // Simulation de succès
      toast({
        title: "Utilisateur mis à jour (simulation)",
        description: `${data.first_name} ${data.last_name} a été mis à jour avec succès (mode développement)`,
      });

      return true;
    } else {
      // En production, on vérifie les permissions
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      
      if (currentUser) {
        const { data: userData, error: roleCheckError } = await supabase
          .from("internal_users")
          .select("role")
          .eq("id", currentUser.id)
          .single();
          
        if (roleCheckError || !userData || !['admin', 'manager'].includes(userData.role)) {
          toast({
            title: "Permissions insuffisantes",
            description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
            variant: "destructive",
          });
          return false;
        }
      }

      // En production, un appel direct à la base de données avec un client service_role serait utilisé
      // Mais pour cette démonstration, nous restons avec l'approche client
      const { error: updateError } = await supabase
        .from("internal_users")
        .update({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          role: data.role,
          is_active: data.is_active
        })
        .eq("id", user.id);

      if (updateError) {
        console.error("Erreur lors de la mise à jour de l'utilisateur:", updateError);
        toast({
          title: "Erreur", 
          description: "Impossible de mettre à jour l'utilisateur: " + updateError.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Utilisateur mis à jour",
        description: `${data.first_name} ${data.last_name} a été mis à jour avec succès`,
      });

      return true;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    toast({
      title: "Erreur",
      description: "Impossible de mettre à jour l'utilisateur",
      variant: "destructive",
    });
    return false;
  }
};
