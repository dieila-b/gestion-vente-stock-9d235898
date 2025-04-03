
import { useState } from "react";
import { InternalUser } from "@/types/internal-user";

export const useUserForm = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);

  return {
    isAddDialogOpen,
    selectedUser,
    setIsAddDialogOpen,
    setSelectedUser
  };
};
