
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
    // Vérifier si nous sommes en mode développement
    const isDevelopmentMode = import.meta.env.DEV;
    
    // Si nous sommes en production, vérifier les autorisations
    if (!isDevelopmentMode) {
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
    }

    // En mode développement, simuler une insertion réussie sans toucher à Supabase
    if (isDevelopmentMode) {
      // Simuler une insertion réussie pour le développement
      const mockUser: InternalUser = {
        id: `dev-${Date.now()}`,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active
      };
      
      toast({
        title: "Utilisateur créé (mode développeur)",
        description: `${data.first_name} ${data.last_name} a été créé avec succès`,
      });
      
      return mockUser;
    }

    // En production, insertion réelle de l'utilisateur dans la base de données
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
      
      if (insertError.code === '42501' || insertError.message.includes('permission denied')) {
        toast({
          title: "Erreur d'autorisation",
          description: "Vous n'avez pas les droits nécessaires pour créer un utilisateur. Contactez l'administrateur.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de créer l'utilisateur: " + insertError.message,
          variant: "destructive",
        });
      }
      return null;
    }

    toast({
      title: "Utilisateur créé",
      description: `${data.first_name} ${data.last_name} a été créé avec succès`,
    });
    
    return insertedUser as InternalUser;
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
