
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FileX } from "lucide-react";

export function EmptyState() {
  return (
    <div className="text-center py-12 border rounded-lg">
      <FileX className="mx-auto h-8 w-8 text-gray-400 mb-2" />
      <p className="text-gray-500">Aucun bon de commande trouvé</p>
    </div>
  );
}
