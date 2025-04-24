
import { Button } from "@/components/ui/button";
import { Plus, Loader } from "lucide-react";

interface EmptyStateProps {
  onAddProduct: () => void;
  isLoading: boolean;
}

export function EmptyState({ onAddProduct, isLoading }: EmptyStateProps) {
  return (
    <div className="bg-black/40 rounded-md p-6 text-center border border-white/10 neo-blur">
      <p className="text-white/60">Aucun produit ajouté à ce bon de commande</p>
      <Button 
        onClick={onAddProduct}
        variant="outline"
        className="mt-4 neo-blur"
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader className="w-4 h-4 mr-2 animate-spin" />
        ) : (
          <Plus className="w-4 h-4 mr-2" />
        )}
        Ajouter un produit
      </Button>
    </div>
  );
}
