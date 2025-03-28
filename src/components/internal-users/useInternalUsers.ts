
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { InternalUser } from "@/types/internal-user";

export const useInternalUsers = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const navigate = useNavigate();
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      setIsAuthChecking(true);
      try {
        const { data } = await supabase.auth.getSession();
        if (!data.session) {
          toast.error("Vous devez être connecté pour accéder à cette page");
          navigate("/auth");
          return;
        }
        setIsAuthorized(true);
      } catch (error) {
        console.error("Auth check error:", error);
        toast.error("Erreur lors de la vérification de l'authentification");
      } finally {
        setIsAuthChecking(false);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ["internal-users"],
    queryFn: async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (!session.session) {
          navigate("/auth");
          return [];
        }

        const { data, error } = await supabase
          .from("internal_users")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          console.error("Error fetching users:", error);
          toast.error("Erreur lors du chargement des utilisateurs");
          return [];
        }

        return data as InternalUser[];
      } catch (error) {
        console.error("Query error:", error);
        toast.error("Une erreur est survenue lors du chargement des données");
        return [];
      }
    },
    enabled: isAuthorized,
    retry: 1,
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const userData = {
      first_name: formData.get("first_name") as string,
      last_name: formData.get("last_name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      role: formData.get("role") as "admin" | "manager" | "employee",
      address: formData.get("address") as string,
      is_active: true,
    };

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        navigate("/auth");
        return;
      }

      if (selectedUser) {
        const { error } = await supabase
          .from("internal_users")
          .update(userData)
          .eq("id", selectedUser.id);

        if (error) throw error;
        toast.success("Utilisateur mis à jour avec succès");
      } else {
        const { error } = await supabase
          .from("internal_users")
          .insert([userData]);

        if (error) throw error;
        toast.success("Utilisateur ajouté avec succès");
      }

      setIsAddDialogOpen(false);
      setSelectedUser(null);
      refetch();
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Une erreur est survenue lors de l'opération");
    }
  };

  const handleDelete = async (user: InternalUser) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet utilisateur ?")) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("internal_users")
        .delete()
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Utilisateur supprimé avec succès");
      refetch();
    } catch (error) {
      console.error("Delete error:", error);
      toast.error("Une erreur est survenue lors de la suppression");
    }
  };

  const toggleUserStatus = async (user: InternalUser) => {
    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session.session) {
        toast.error("Vous devez être connecté pour effectuer cette action");
        navigate("/auth");
        return;
      }

      const { error } = await supabase
        .from("internal_users")
        .update({ is_active: !user.is_active })
        .eq("id", user.id);

      if (error) throw error;
      toast.success(`Utilisateur ${user.is_active ? 'désactivé' : 'activé'} avec succès`);
      refetch();
    } catch (error) {
      console.error("Status toggle error:", error);
      toast.error("Une erreur est survenue lors de la modification du statut");
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
