
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { InternalUser } from "@/types/internal-user";

interface CreateUserData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
}

export const createUser = async (data: CreateUserData): Promise<InternalUser | null> => {
  try {
    // Vérifier les autorisations
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      const { data: userData, error: roleCheckError } = await supabase
        .from("internal_users")
        .select("role")
        .eq("id", user.id)
        .single();
        
      if (roleCheckError || !userData || !['admin', 'manager'].includes(userData.role)) {
        toast({
          title: "Permissions insuffisantes",
          description: "Vous n'avez pas les droits nécessaires pour effectuer cette action.",
          variant: "destructive",
        });
        return null;
      }
    }

    // En mode développement, utiliser une fonction RPC qui ignore les politiques RLS
    if (import.meta.env.DEV) {
      // Utiliser une fonction RPC qui contourne les RLS
      const { data: insertedUser, error: insertError } = await supabase
        .rpc('insert_internal_user', {
          p_first_name: data.first_name,
          p_last_name: data.last_name, 
          p_email: data.email,
          p_phone: data.phone || null,
          p_address: data.address || null,
          p_role: data.role,
          p_is_active: data.is_active
        });

      if (insertError) {
        console.error("Error inserting user:", insertError);
        toast({
          title: "Erreur",
          description: "Impossible de créer l'utilisateur: " + insertError.message,
          variant: "destructive",
        });
        return null;
      }

      // Si la fonction RPC renvoie un booléen mais pas l'utilisateur, récupérer l'utilisateur inséré
      if (insertedUser === true || (typeof insertedUser !== 'object')) {
        const { data: newUser, error: fetchError } = await supabase
          .from("internal_users")
          .select("*")
          .eq("email", data.email)
          .single();
          
        if (fetchError) {
          console.error("Error fetching inserted user:", fetchError);
          toast({
            title: "Avertissement",
            description: "Utilisateur créé mais impossible de récupérer ses détails",
            variant: "destructive",
          });
        } else {
          toast({
            title: "Utilisateur créé",
            description: `${data.first_name} ${data.last_name} a été créé avec succès`,
          });
          return newUser as InternalUser;
        }
      } else if (typeof insertedUser === 'object') {
        toast({
          title: "Utilisateur créé",
          description: `${data.first_name} ${data.last_name} a été créé avec succès`,
        });
        return insertedUser as InternalUser;
      }
    } else {
      // Méthode standard d'insertion (en production)
      const { data: insertedUser, error: insertError } = await supabase
        .from("internal_users")
        .insert({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          phone: data.phone || null,
          address: data.address || null,
          role: data.role,
          is_active: data.is_active
        })
        .select("*")
        .single();

      if (insertError) {
        console.error("Error inserting user:", insertError);
        toast({
          title: "Erreur",
          description: "Impossible de créer l'utilisateur: " + insertError.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Utilisateur créé",
        description: `${data.first_name} ${data.last_name} a été créé avec succès`,
      });
      
      return insertedUser as InternalUser;
    }
    
    return null;
  } catch (error) {
    console.error("Error creating user:", error);
    toast({
      title: "Erreur",
      description: "Impossible de créer l'utilisateur",
      variant: "destructive",
    });
    return null;
  }
};
