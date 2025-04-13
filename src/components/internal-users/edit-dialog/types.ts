
import { User } from "@/types/user";

export interface EditUserFormProps {
  userData: User;
  showPassword: boolean;
  newPassword: string;
  passwordConfirmation: string;
  isSubmitting: boolean;
  isImageUploading?: boolean;
  onInputChange: (field: keyof User, value: any) => void;
  onPasswordChange: (value: string) => void;
  onPasswordConfirmationChange: (value: string) => void;
  onTogglePasswordVisibility: () => void;
  passwordsMatch: boolean;
  onPhotoUpload?: (file: File) => Promise<void>;
}

export interface EditDialogActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  disabled?: boolean;
}
