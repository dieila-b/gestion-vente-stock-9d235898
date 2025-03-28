
import { useState } from "react";
import { InternalUser } from "@/types/internal-user";

export const useInternalUserDialog = () => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<InternalUser | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [securitySettings, setSecuritySettings] = useState({
    requirePasswordChange: false,
    twoFactorEnabled: false,
  });

  const handleDialogOpen = (user: InternalUser | null) => {
    setSelectedUser(user);
    if (user) {
      setSecuritySettings({
        requirePasswordChange: user.require_password_change || false,
        twoFactorEnabled: user.two_factor_enabled || false,
      });
    } else {
      setSecuritySettings({
        requirePasswordChange: false,
        twoFactorEnabled: false,
      });
    }
    setActiveTab("general");
    setIsAddDialogOpen(true);
  };

  return {
    isAddDialogOpen,
    setIsAddDialogOpen,
    selectedUser,
    setSelectedUser,
    activeTab,
    setActiveTab,
    securitySettings,
    setSecuritySettings,
    handleDialogOpen,
  };
};
