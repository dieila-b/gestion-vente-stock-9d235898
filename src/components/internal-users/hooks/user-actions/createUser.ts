
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
  status: "actif" | "inactif" | "en attente";
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

    // Insertion dans la base de données
    const { data: insertedUser, error: insertError } = await supabase
      .from("internal_users")
      .insert({
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active,
        status: data.status
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

    // Add the status field if it's missing in the response
    const typedUser = insertedUser as any;
    const finalUser: InternalUser = {
      ...typedUser,
      status: typedUser.status || data.status
    };
    
    return finalUser;
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
