
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export const createUser = async (values: {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone: string | null;
  address: string | null;
  role: "admin" | "manager" | "employee";
  is_active: boolean;
  force_password_change: boolean;
}) => {
  // Check if user with this email already exists
  const { data: existingUsers, error: checkError } = await supabase
    .from("internal_users")
    .select("id")
    .eq("email", values.email);

  if (checkError) throw checkError;

  if (existingUsers && existingUsers.length > 0) {
    toast({
      title: "Erreur",
      description: "Un utilisateur avec cet email existe déjà",
      variant: "destructive",
    });
    return null;
  }

  // Make sure password is provided for new users
  if (!values.password || values.password.trim() === "") {
    toast({
      title: "Erreur",
      description: "Le mot de passe est requis pour un nouvel utilisateur",
      variant: "destructive",
    });
    return null;
  }

  try {
    // Use the auth.signUp function which doesn't require admin privileges
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { 
          force_password_change: values.force_password_change,
          first_name: values.first_name,
          last_name: values.last_name,
          role: values.role
        }
      }
    });

    if (authError) {
      handleAuthError(authError);
      return null;
    }

    if (!authData.user) {
      throw new Error("Échec de la création de l'utilisateur");
    }

    // Now create the internal user record
    const { error: insertError } = await supabase
      .from("internal_users")
      .insert({
        id: authData.user.id,
        first_name: values.first_name,
        last_name: values.last_name,
        email: values.email,
        phone: values.phone || null,
        address: values.address || null,
        role: values.role,
        is_active: true,
        force_password_change: values.force_password_change,
      });

    if (insertError) throw insertError;
    
    toast({
      title: "Utilisateur créé",
      description: "L'utilisateur a été créé avec succès",
    });
    
    return authData.user.id;
  } catch (error: any) {
    console.error("Error creating user:", error);
    handleAuthError(error);
    return null;
  }
};

function handleAuthError(error: any) {
  if (error.message && (
    error.message.includes('auth/admin') || 
    error.message.includes('not_admin') || 
    error.message.includes('permission')
  )) {
    toast({
      title: "Erreur d'autorisation",
      description: "Vous n'avez pas les droits administrateur nécessaires pour créer des utilisateurs",
      variant: "destructive",
    });
    return;
  }
  
  toast({
    title: "Erreur",
    description: "Une erreur s'est produite lors de la création de l'utilisateur",
    variant: "destructive",
  });
}
