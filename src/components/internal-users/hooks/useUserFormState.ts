
import { useState } from "react";
import { InternalUser } from "@/types/internal-user";

/**
 * Hook for managing user form dialog state
 * Extracted from the original useUserForm.ts
 */
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
