
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClientFormHeaderProps {
  onClose: () => void;
  title: string;
}

export const ClientFormHeader = ({ onClose, title }: ClientFormHeaderProps) => {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gradient">{title}</h2>
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
};

