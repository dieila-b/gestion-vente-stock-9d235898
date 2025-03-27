
import { Activity } from "../types/activity";
import { Badge } from "@/components/ui/badge";

interface ActivityItemProps {
  activity: Activity;
}

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div
      className="flex flex-col gap-1 pb-4 border-b border-border/50 last:border-0 last:pb-0 hover:bg-white/5 p-2 rounded-lg transition-colors"
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <h3 className="font-medium">{activity.action}</h3>
          {activity.action === "Nouvelle vente" && (
            <Badge variant={activity.status === 'completed' ? "outline" : "secondary"}>
              {activity.status === 'completed' ? 'Livré' : 'Non livré'}
            </Badge>
          )}
        </div>
        <span className="text-xs text-muted-foreground">{activity.time}</span>
      </div>
      <p className="text-sm text-muted-foreground">{activity.details}</p>
    </div>
  );
}
