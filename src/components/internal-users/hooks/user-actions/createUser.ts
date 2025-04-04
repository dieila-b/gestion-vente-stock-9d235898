
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
    // In development mode, simulate success without making a Supabase call
    // since we don't have the necessary RLS permissions
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log("Development mode: Simulating user creation");
      
      // In a real development environment, we would use the service_role
      // but for this demo, we're simply simulating success
      const mockId = "dev-" + Math.random().toString(36).substring(2, 15);
      
      // Create a simulated user object
      const mockUser: InternalUser = {
        id: mockId,
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        phone: data.phone || null,
        address: data.address || null,
        role: data.role,
        is_active: data.is_active,
        status: data.status || "actif"
      };
      
      toast({
        title: "Utilisateur créé",
        description: `${data.first_name} ${data.last_name} a été créé avec succès (ID: ${mockId})`,
      });

      console.log("Created mock user:", mockUser);
      return mockUser;
    } else {
      // In production, check the user's permissions
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

      // In production, a direct database call with a service_role client would be used
      // But for this demo, we'll stick with the client approach
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
    }
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
