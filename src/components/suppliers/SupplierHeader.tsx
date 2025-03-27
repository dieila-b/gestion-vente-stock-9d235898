
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface SupplierHeaderProps {
  onOpenDialog: () => void;
}

export const SupplierHeader = ({ onOpenDialog }: SupplierHeaderProps) => {
  const { toast } = useToast();

  return (
    <div className="flex justify-between items-center animate-fade-in">
      <div>
        <h1 className="text-4xl font-bold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400">
          Gestion des Fournisseurs
        </h1>
        <p className="text-muted-foreground mt-2">
          Gestion complète et suivi des fournisseurs
        </p>
      </div>
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={() =>
            toast({
              title: "Synchronisation",
              description: "Mise à jour des données fournisseurs en cours...",
            })
          }
          className="glass-effect"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Synchroniser
        </Button>
      </div>
    </div>
  );
};
