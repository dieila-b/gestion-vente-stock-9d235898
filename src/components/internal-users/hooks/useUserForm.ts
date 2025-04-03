
import { useState } from "react";
import { InternalUser } from "@/types/internal-user";

// Renamed function to avoid conflicts with form/hooks/useUserForm.tsx
export const useUserFormState = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);

  return {
    isAddDialogOpen,
    selectedUser,
    setIsAddDialogOpen,
    setSelectedUser
  };
};
