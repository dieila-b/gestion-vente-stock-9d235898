
import { ScrollArea } from "@/components/ui/scroll-area";
import { useRecentStockMovements } from "@/hooks/dashboard/useRecentStockMovements";
import { RecentMovementsList } from "./movements/RecentMovementsList";
import { EmptyState } from "@/components/ui/empty-state";
import { ActivitySquare } from "lucide-react";

export function RecentMovements() {
  const { movements, isLoading, error } = useRecentStockMovements();

  if (isLoading) {
    return <div className="flex justify-center items-center h-full">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading recent movements: {error.message}</div>;
  }

  if (!movements || movements.length === 0) {
    return (
      <EmptyState
        icon={<ActivitySquare className="h-10 w-10 text-muted-foreground" />}
        title="No Recent Movements"
        description="There are no recent stock movements to display."
      />
    );
  }

  return (
    <ScrollArea className="h-[400px]">
      <RecentMovementsList movements={movements} />
    </ScrollArea>
  );
}
