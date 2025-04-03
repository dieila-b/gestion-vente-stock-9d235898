
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
    // En mode développement, utiliser directement la mise à jour sans vérification de rôle
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log("Mode développement: Contournement de la RLS pour mise à jour d'utilisateur");
      
      const { error } = await supabase
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

      if (error) {
        console.error("Erreur Supabase:", error);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'utilisateur: " + error.message,
          variant: "destructive",
        });
        return false;
      }

      toast({
        title: "Utilisateur mis à jour",
        description: `${data.first_name} ${data.last_name} a été mis à jour avec succès`,
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

      // Mise à jour via une fonction Supabase qui aura les droits service_role
      const { error: funcError } = await supabase
        .rpc('update_internal_user', {
          p_user_id: user.id,
          p_first_name: data.first_name,
          p_last_name: data.last_name,
          p_email: data.email,
          p_phone: data.phone || null,
          p_address: data.address || null,
          p_role: data.role,
          p_is_active: data.is_active
        });

      if (funcError) {
        console.error("Erreur fonction Supabase:", funcError);
        toast({
          title: "Erreur",
          description: "Impossible de mettre à jour l'utilisateur: " + funcError.message,
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
