
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Box } from "lucide-react";

export function EmptyState() {
  return (
    <Alert>
      <Box className="h-5 w-5" />
      <AlertDescription>
        Aucun bon de commande trouvé.
      </AlertDescription>
    </Alert>
  );
}
