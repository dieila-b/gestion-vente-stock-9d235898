
import { Loader } from "lucide-react";

export function LoadingState() {
  return (
    <div className="py-8 text-center">
      <Loader className="h-6 w-6 animate-spin mx-auto mb-2" />
      <p>Chargement des bons de commande...</p>
    </div>
  );
}
