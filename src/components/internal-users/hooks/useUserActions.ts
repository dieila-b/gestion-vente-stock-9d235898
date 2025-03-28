
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "../validation/user-form-schema";
import { toast } from "@/hooks/use-toast";

export const useUserActions = (fetchUsers: () => Promise<void>) => {
  
  const handleSubmit = async (values: UserFormValues, selectedUser: InternalUser | null): Promise<void> => {
    try {
      if (selectedUser) {
        // Update existing user
        const { error } = await supabase
          .from("internal_users")
          .update({
            first_name: values.first_name,
            last_name: values.last_name,
            email: values.email,
            phone: values.phone || null,
            address: values.address || null,
            role: values.role,
            is_active: values.is_active || true,
          })
          .eq("id", selectedUser.id);

        if (error) throw error;
      } else {
        // Create new user
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
          return;
        }

        // Create an auth user
        const { data: authData, error: authError } = await supabase.auth.admin.createUser({
          email: values.email,
          password: "TemporaryPassword123!", // This should be randomly generated and sent to user
          email_confirm: true,
        });

        if (authError) throw authError;

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
          });

        if (insertError) throw insertError;
      }

      // Refresh the users list
      fetchUsers();
    } catch (error) {
      console.error("Error submitting user:", error);
      throw error;
    }
  };

  const handleDelete = async (user: InternalUser) => {
    try {
      if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${user.first_name} ${user.last_name}?`)) {
        return;
      }

      const { error } = await supabase
        .from("internal_users")
        .delete()
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Utilisateur supprimé",
        description: `${user.first_name} ${user.last_name} a été supprimé avec succès`,
      });

      fetchUsers();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer l'utilisateur",
        variant: "destructive",
      });
    }
  };

  const toggleUserStatus = async (user: InternalUser) => {
    try {
      const newStatus = !user.is_active;
      const { error } = await supabase
        .from("internal_users")
        .update({ is_active: newStatus })
        .eq("id", user.id);

      if (error) throw error;

      toast({
        title: "Statut mis à jour",
        description: `L'utilisateur est maintenant ${newStatus ? "actif" : "inactif"}`,
      });

      fetchUsers();
    } catch (error) {
      console.error("Error toggling user status:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut de l'utilisateur",
        variant: "destructive",
      });
    }
  };

  return {
    handleSubmit,
    handleDelete,
    toggleUserStatus
  };
};
