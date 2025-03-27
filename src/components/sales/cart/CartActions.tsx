
import { Button } from "@/components/ui/button";

interface CartActionsProps {
  onClear: () => void;
  onCheckout: () => void;
  isLoading: boolean;
  itemCount: number;
  selectedClient: boolean;
  isEditing: boolean;
}

export function CartActions({
  onClear,
  onCheckout,
  isLoading,
  itemCount,
  selectedClient,
  isEditing
}: CartActionsProps) {
  const getButtonText = () => {
    if (isLoading) return "Traitement...";
    return isEditing ? "MODIFIER" : "PRÉCOMMANDER";
  };

  return (
    <div className="grid grid-cols-2 gap-2">
      <Button 
        variant="destructive"
        className="bg-[#ea384c] hover:bg-[#ea384c]/90"
        onClick={onClear}
      >
        ANNULER
      </Button>
      <Button 
        className="bg-[#22c55e] hover:bg-[#22c55e]/90 text-white text-xs md:text-sm px-2 h-auto min-h-10 py-2 break-words"
        onClick={onCheckout}
        disabled={isLoading || itemCount === 0 || !selectedClient}
        size="auto"
      >
        {getButtonText()}
      </Button>
    </div>
  );
}
