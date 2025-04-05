
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
  photo_url?: string | null;
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
        is_active: data.is_active,
        photo_url: data.photo_url || null
      };
      
      // Stocker l'utilisateur dans localStorage pour la persistance en mode dev
      const existingUsers = JSON.parse(localStorage.getItem('internalUsers') || '[]');
      localStorage.setItem('internalUsers', JSON.stringify([...existingUsers, mockUser]));
      
      toast({
        title: "Utilisateur créé (mode développeur)",
        description: `${data.first_name} ${data.last_name} a été créé avec succès`,
      });
      
      return mockUser;
    }

    // En mode production, créer d'abord l'utilisateur dans Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: { 
        first_name: data.first_name,
        last_name: data.last_name,
        role: data.role
      }
    });
    
    if (authError) {
      console.error("Erreur lors de la création de l'utilisateur Auth:", authError);
      toast({
        title: "Erreur",
        description: "Impossible de créer l'utilisateur: " + authError.message,
        variant: "destructive",
      });
      return null;
    }
    
    if (!authData.user) {
      console.error("Échec de création du compte Auth");
      toast({
        title: "Erreur",
        description: "Échec de création du compte utilisateur",
        variant: "destructive",
      });
      return null;
    }
    
    console.log("Utilisateur Auth créé:", authData.user);

    // Ensuite, insertion dans la table internal_users
    const { data: insertedUser, error: insertError } = await supabase
      .from("internal_users")
      .insert({
        id: authData.user.id,  // Utiliser l'ID du compte Auth
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active,
        photo_url: data.photo_url || null,
        user_id: authData.user.id  // Référence au compte Auth
      })
      .select("*")
      .single();

    if (insertError) {
      console.error("Erreur lors de l'insertion de l'utilisateur:", insertError);
      
      // Essayer de supprimer le compte Auth en cas d'échec
      try {
        await supabase.auth.admin.deleteUser(authData.user.id);
      } catch (deleteError) {
        console.error("Erreur lors de la suppression du compte Auth après échec:", deleteError);
      }
      
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

    // Ensure photo_url is present
    const user: InternalUser = {
      id: insertedUser.id,
      first_name: insertedUser.first_name,
      last_name: insertedUser.last_name,
      email: insertedUser.email,
      phone: insertedUser.phone,
      address: insertedUser.address,
      role: insertedUser.role,
      is_active: insertedUser.is_active,
      photo_url: 'photo_url' in insertedUser ? (insertedUser.photo_url as string | null) : null
    };

    toast({
      title: "Utilisateur créé",
      description: `${data.first_name} ${data.last_name} a été créé avec succès`,
    });
    
    return user;
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
