
import { DialogHeader as ShadcnDialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

interface DialogHeaderProps {
  title: string;
  description?: string;
}

export const DialogHeader = ({ title, description }: DialogHeaderProps) => {
  return (
    <ShadcnDialogHeader>
      <DialogTitle>{title}</DialogTitle>
      {description && <DialogDescription>{description}</DialogDescription>}
    </ShadcnDialogHeader>
  );
};
