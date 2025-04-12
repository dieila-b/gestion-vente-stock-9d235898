import { useState, useEffect, FormEvent } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea";

interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  role: "admin" | "manager" | "employee";
  address: string;
  is_active: boolean;
}

const InternalUsers = () => {
  const [newUserData, setNewUserData] = useState<Omit<User, 'id'>[]>([]);
  const queryClient = useQueryClient();

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
      },
    ]);
  };

  const handleRemoveUser = (index: number) => {
    const updatedData = [...newUserData];
    updatedData.splice(index, 1);
    setNewUserData(updatedData);
  };

  const handleRoleChange = (index: number, role: "admin" | "manager" | "employee") => {
    handleInputChange(index, "role", role);
  };

  const handleIsActiveChange = (index: number, isActive: boolean) => {
    handleInputChange(index, "is_active", isActive);
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Gestion des Utilisateurs Internes</h1>

      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-2">Ajouter de Nouveaux Utilisateurs</h2>
        {newUserData.map((user, index) => (
          <div key={index} className="mb-4 p-4 border rounded-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor={`first_name_${index}`}>Prénom</Label>
                <Input
                  type="text"
                  id={`first_name_${index}`}
                  value={user.first_name}
                  onChange={(e) => handleInputChange(index, "first_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`last_name_${index}`}>Nom</Label>
                <Input
                  type="text"
                  id={`last_name_${index}`}
                  value={user.last_name}
                  onChange={(e) => handleInputChange(index, "last_name", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`email_${index}`}>Email</Label>
                <Input
                  type="email"
                  id={`email_${index}`}
                  value={user.email}
                  onChange={(e) => handleInputChange(index, "email", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`phone_${index}`}>Téléphone</Label>
                <Input
                  type="tel"
                  id={`phone_${index}`}
                  value={user.phone}
                  onChange={(e) => handleInputChange(index, "phone", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`role_${index}`}>Rôle</Label>
                <Select onValueChange={(value) => handleRoleChange(index, value as "admin" | "manager" | "employee")}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner un rôle" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="employee">Employee</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor={`address_${index}`}>Adresse</Label>
                <Input
                  type="text"
                  id={`address_${index}`}
                  value={user.address}
                  onChange={(e) => handleInputChange(index, "address", e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor={`is_active_${index}`}>Actif</Label>
                <Select onValueChange={(value) => handleIsActiveChange(index, value === "true")}>
                  <SelectTrigger>
                    <SelectValue placeholder={user.is_active ? "Actif" : "Inactif"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="true">Actif</SelectItem>
                    <SelectItem value="false">Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button variant="destructive" size="sm" onClick={() => handleRemoveUser(index)}>
              Supprimer
            </Button>
          </div>
        ))}
        <Button variant="outline" size="sm" onClick={handleAddUser}>
          Ajouter un Utilisateur
        </Button>
      </div>

      <div className="mt-6 flex justify-end">
        <Button 
          type="submit" 
          variant="default" 
          disabled={newUserData.length === 0}
          onClick={handleBulkInsert}
        >
          Enregistrer les utilisateurs
        </Button>
      </div>
    </div>
  );
};

export default InternalUsers;
