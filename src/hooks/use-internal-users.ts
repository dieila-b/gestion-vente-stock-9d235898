
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useInternalUsers = () => {
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [passwordConfirmation, setPasswordConfirmation] = useState<{ [key: number]: string }>({});

  const { data: users = [], isLoading, refetch } = useQuery({
    queryKey: ['internal-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_users')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as User[];
    }
  });

  const handleInputChange = (index: number, field: string, value: any) => {
    const updatedData = [...newUserData];
    updatedData[index] = {
      ...updatedData[index],
      [field]: value,
    };
    setNewUserData(updatedData);
  };

  const handlePasswordConfirmationChange = (index: number, value: string) => {
    setPasswordConfirmation(prev => ({
      ...prev,
      [index]: value
    }));
  };

  const handleAddUser = () => {
    setNewUserData([
      ...newUserData,
      {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        role: "employee",
        address: "",
        is_active: true,
        photo_url: "",
        password: "",
      },
    ]);
  };

  const handleRemoveUser = (index: number) => {
    const updatedData = [...newUserData];
    updatedData.splice(index, 1);
    setNewUserData(updatedData);

    // Also clean up password confirmation state
    const updatedConfirmations = { ...passwordConfirmation };
    delete updatedConfirmations[index];
    setPasswordConfirmation(updatedConfirmations);
  };

  const togglePasswordVisibility = (index: number) => {
    setShowPassword(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const fetchUsers = async () => {
    await refetch();
  };

  const validatePasswords = () => {
    for (const [index, user] of newUserData.entries()) {
      if (!user.password) {
        toast.error(`L'utilisateur ${index + 1} doit avoir un mot de passe`);
        return false;
      }
      
      if (user.password !== passwordConfirmation[index]) {
        toast.error(`Les mots de passe ne correspondent pas pour l'utilisateur ${index + 1}`);
        return false;
      }
    }
    return true;
  };

  const handleBulkInsert = async () => {
    if (newUserData.length === 0) {
      toast.error("Aucun utilisateur à ajouter");
      return;
    }
    
    // Validate passwords match before submitting
    if (!validatePasswords()) {
      return;
    }
    
    try {
      // Add UUIDs for each new user
      const usersWithIds = newUserData.map(user => ({
        ...user,
        id: crypto.randomUUID() // Generate a UUID for each user
      }));
      
      const { error } = await supabase
        .from('internal_users')
        .insert(usersWithIds);
      
      if (error) throw error;
      
      toast.success("Utilisateurs ajoutés avec succès");
      fetchUsers();
      setNewUserData([]);
      setPasswordConfirmation({});
    } catch (error) {
      console.error("Error adding users:", error);
      toast.error("Erreur lors de l'ajout des utilisateurs");
    }
  };

  return {
    users,
    isLoading,
    newUserData,
    showPassword,
    passwordConfirmation,
    handleInputChange,
    handlePasswordConfirmationChange,
    handleAddUser,
    handleRemoveUser,
    togglePasswordVisibility,
    handleBulkInsert,
  };
};
