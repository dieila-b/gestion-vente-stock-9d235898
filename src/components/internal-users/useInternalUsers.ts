
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InternalUser } from "@/types/internal-user";
import { toast } from "@/hooks/use-toast";
import { UserFormValues } from "./validation/user-form-schema";

export const useInternalUsers = () => {
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        const { data: userData, error: userError } = await supabase
          .from('internal_users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userError || !userData) {
          console.error("Error checking user role:", userError);
          setIsAuthorized(false);
          setIsAuthChecking(false);
          return;
        }
        
        setIsAuthorized(userData.role === 'admin');
        
        if (userData.role === 'admin') {
          fetchUsers();
        }
      } catch (error) {
        console.error("Auth check error:", error);
        setIsAuthorized(false);
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("internal_users")
        .select("*")
        .order("first_name", { ascending: true });

      if (error) {
        throw error;
      }

      setUsers(data as InternalUser[]);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer la liste des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (values: UserFormValues): Promise<void> => {
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
    users,
    isLoading,
    isAuthChecking,
    isAuthorized,
    isAddDialogOpen,
    selectedUser,
    setIsAddDialogOpen,
    setSelectedUser,
    handleSubmit,
    handleDelete,
    toggleUserStatus,
  };
};
