
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types/user";
import { useQuery } from "@tanstack/react-query";

export const useInternalUsers = () => {
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>[]>([]);
  const [showPassword, setShowPassword] = useState<{ [key: number]: boolean }>({});

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

  const handleBulkInsert = async () => {
    if (newUserData.length === 0) {
      toast.error("No users to add");
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
      
      toast.success("Users added successfully");
      fetchUsers();
      setNewUserData([]);
    } catch (error) {
      console.error("Error adding users:", error);
      toast.error("Error adding users");
    }
  };

  return {
    users,
    isLoading,
    newUserData,
    showPassword,
    handleInputChange,
    handleAddUser,
    handleRemoveUser,
    togglePasswordVisibility,
    handleBulkInsert,
  };
};
