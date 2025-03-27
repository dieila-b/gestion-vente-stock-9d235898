import { useState, useCallback, useEffect } from "react";
import { Activity } from "../types/activity";
import { useInitialActivities } from "./useInitialActivities";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

export function useActivitySubscriptions() {
  const { activities: initialActivities, isLoading: isInitialLoading } = useInitialActivities();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isInitialLoading) {
      setActivities(initialActivities);
      setIsLoading(false);
    }
  }, [initialActivities, isInitialLoading]);

  const addActivity = useCallback((activity: Activity) => {
    setActivities(prevActivities => {
      const newActivities = [activity, ...prevActivities];
      // Keep only the most recent 15 activities
      return newActivities.slice(0, 15);
    });
  }, []);

  const updateRelativeTimes = useCallback(() => {
    setActivities(prevActivities => 
      prevActivities.map(activity => ({
        ...activity,
        relativeTime: formatDistanceToNow(activity.timestamp, { 
          addSuffix: true,
          locale: fr
        })
      }))
    );
  }, []);

  return {
    activities,
    isLoading,
    addActivity,
    updateRelativeTimes
  };
}
