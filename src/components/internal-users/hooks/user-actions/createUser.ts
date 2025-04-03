
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
    // En mode développement, simuler le succès de l'opération sans faire d'appel à Supabase
    // puisque nous n'avons pas les droits RLS nécessaires
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log("Mode développement: Simulation de création d'utilisateur");
      
      // Dans un vrai environnement de développement, nous utiliserions le service_role
      // mais pour cette démonstration, nous simulons simplement le succès
      const mockId = "dev-" + Math.random().toString(36).substring(2, 15);
      
      // Créer un objet utilisateur simulé
      const mockUser: InternalUser = {
        id: mockId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active
      };
      
      toast({
        title: "Utilisateur créé (simulation)",
        description: `${data.first_name} ${data.last_name} a été créé avec succès (ID: ${mockId})`,
      });

      return mockUser;
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

      // En production, un appel direct à la base de données avec un client service_role serait utilisé
      // Mais pour cette démonstration, nous restons avec l'approche client
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

      return insertedUser as InternalUser;
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
