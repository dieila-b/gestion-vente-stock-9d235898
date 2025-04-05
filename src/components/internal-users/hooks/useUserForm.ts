
import { useState, useCallback } from "react";
import { InternalUser } from "@/types/internal-user";

// Renamed function to avoid conflicts with form/hooks/useUserForm.tsx
export const useUserFormState = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);

  const setIsAddDialogOpenCallback = useCallback((value: boolean) => {
    setIsAddDialogOpen(value);
  }, []);

  const setSelectedUserCallback = useCallback((user: InternalUser | null) => {
    setSelectedUser(user);
  }, []);

  return {
    isAddDialogOpen,
    selectedUser,
    setIsAddDialogOpen: setIsAddDialogOpenCallback,
    setSelectedUser: setSelectedUserCallback
  };
};
