
import React from "react";
import { Button } from "@/components/ui/button";
import { InternalUser } from "@/types/internal-user";

interface ResetPasswordActionProps {
  user: InternalUser;
  onResetPassword: (user: InternalUser) => void;
}

export const ResetPasswordAction = ({
  user,
  onResetPassword,
}: ResetPasswordActionProps) => {
  return (
    <div className="pt-4 border-t">
      <h3 className="text-lg font-medium mb-4">Actions</h3>
      <Button
        type="button"
        variant="outline"
        onClick={() => onResetPassword(user)}
      >
        Envoyer un email de réinitialisation de mot de passe
      </Button>
    </div>
  );
};
