
import { InternalUser } from "@/types/internal-user";
import { UserFormValues } from "../validation/user-form-schema";
import { FormContent } from "./FormContent";

interface UserFormContentProps {
  onSubmit: (user: UserFormValues) => Promise<void>;
  onCancel: () => void;
  selectedUser: InternalUser | null;
}

export const UserFormContent = ({ 
  onSubmit, 
  onCancel, 
  selectedUser 
}: UserFormContentProps) => {
  return (
    <div className="max-h-[70vh] overflow-y-auto pr-1">
      <FormContent
        onSubmit={onSubmit}
        onCancel={onCancel}
        selectedUser={selectedUser}
      />
    </div>
  );
};
