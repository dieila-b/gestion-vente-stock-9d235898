
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

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

export const createUser = async (data: CreateUserData): Promise<string | null> => {
  try {
    // En mode développement, utiliser l'API service_role pour contourner la RLS
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log("Mode développement: Contournement de la RLS pour création d'utilisateur");
      
      // En développement, on crée l'utilisateur directement avec insert
      const { data: userData, error } = await supabase
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
        .select("id")
        .single();

      if (error) {
        console.error("Erreur Supabase:", error);
        toast({
          title: "Erreur",
          description: "Impossible de créer l'utilisateur: " + error.message,
          variant: "destructive",
        });
        return null;
      }

      toast({
        title: "Utilisateur créé",
        description: `${data.first_name} ${data.last_name} a été créé avec succès`,
      });

      return userData?.id || null;
    } else {
      // En production, on vérifie les permissions de l'utilisateur
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

      // Comme nous ne pouvons pas appeler la fonction RPC 'create_internal_user' directement à cause des limitations de typage,
      // on utilise une approche alternative avec l'API REST de Supabase
      
      // 1. D'abord insérer l'utilisateur dans la table internal_users
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
        .select("id")
        .single();

      if (insertError) {
        console.error("Erreur lors de l'insertion de l'utilisateur:", insertError);
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

      return insertedUser?.id || null;
    }
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    toast({
      title: "Erreur",
      description: "Impossible de créer l'utilisateur",
      variant: "destructive",
    });
    return null;
  }
};
