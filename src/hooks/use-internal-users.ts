
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useInternalUsers = () => {
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});
  const [passwordConfirmation, setPasswordConfirmation] = useState<{ [key: number]: string }>({});

  // Vérification du bucket au chargement du composant
  useEffect(() => {
    const checkBucket = async () => {
      try {
        // Vérifier si le bucket existe
        const { data: buckets, error } = await supabase.storage.listBuckets();
        
        if (error) {
          console.error("Error checking buckets:", error);
          return;
        }
        
        const bucketExists = buckets.some(bucket => bucket.name === 'lovable-uploads');
        
        if (bucketExists) {
          console.log("Bucket 'lovable-uploads' exists");
        } else {
          console.log("Bucket 'lovable-uploads' does not exist");
        }
      } catch (err) {
        console.error("Error in bucket check:", err);
      }
    };
    
    checkBucket();
  }, []);

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
    
    // Also clean up password visibility state
    const updatedVisibility = { ...showPassword };
    delete updatedVisibility[index];
    setShowPassword(updatedVisibility);
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
    let isValid = true;
    
    for (const [index, user] of newUserData.entries()) {
      if (!user.password) {
        toast.error(`L'utilisateur ${index + 1} doit avoir un mot de passe`);
        isValid = false;
        break;
      }
      
      // S'assurer que passwordConfirmation[index] existe avant de comparer
      if (passwordConfirmation[index] === undefined) {
        toast.error(`Veuillez confirmer le mot de passe pour l'utilisateur ${index + 1}`);
        isValid = false;
        break;
      }
      
      if (user.password !== passwordConfirmation[index]) {
        toast.error(`Les mots de passe ne correspondent pas pour l'utilisateur ${index + 1}`);
        isValid = false;
        break;
      }
    }
    
    return isValid;
  };

  const validateRequiredFields = () => {
    let isValid = true;
    
    for (const [index, user] of newUserData.entries()) {
      if (!user.first_name || !user.last_name || !user.email) {
        toast.error(`L'utilisateur ${index + 1} doit avoir un prénom, nom et email`);
        isValid = false;
        break;
      }
    }
    
    return isValid;
  };

  const handleBulkInsert = async () => {
    if (newUserData.length === 0) {
      toast.error("Aucun utilisateur à ajouter");
      return;
    }
    
    // Validate passwords and required fields
    if (!validatePasswords() || !validateRequiredFields()) {
      return;
    }
    
    try {
      // Add UUIDs for each new user
      const usersWithIds = newUserData.map(user => ({
        ...user,
        id: crypto.randomUUID() // Generate a UUID for each user
      }));
      
      console.log("Inserting users:", usersWithIds);
      
      const { data, error } = await supabase
        .from('internal_users')
        .insert(usersWithIds);
      
      if (error) {
        console.error("Error adding users:", error);
        toast.error(`Erreur lors de l'ajout des utilisateurs: ${error.message}`);
        return;
      }
      
      toast.success("Utilisateurs ajoutés avec succès");
      await fetchUsers();
      setNewUserData([]);
      setPasswordConfirmation({});
      setShowPassword({});
    } catch (error: any) {
      console.error("Exception adding users:", error);
      toast.error(`Exception lors de l'ajout des utilisateurs: ${error.message || error}`);
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
