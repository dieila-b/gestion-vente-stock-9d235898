
import { User } from "@/types/user";

export interface EditUserFormProps {
  userData: User;
  showPassword: boolean;
  newPassword: string;
  passwordConfirmation: string;
  isSubmitting: boolean;
  onInputChange: (field: keyof User, value: any) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  passwordsMatch: boolean;
}

export interface EditDialogActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  disabled?: boolean;
}
