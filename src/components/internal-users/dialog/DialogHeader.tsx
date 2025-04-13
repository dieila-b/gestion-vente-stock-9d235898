
import { DialogHeader as ShadcnDialogHeader, DialogTitle } from "@/components/ui/dialog";

interface DialogHeaderProps {
  title: string;
}

export const DialogHeader = ({ title }: DialogHeaderProps) => {
  return (
    <ShadcnDialogHeader>
      <DialogTitle>{title}</DialogTitle>
    </ShadcnDialogHeader>
  );
};
