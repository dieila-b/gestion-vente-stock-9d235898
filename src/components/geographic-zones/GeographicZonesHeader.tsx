
import { MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface GeographicZonesHeaderProps {
  onAddClick: () => void;
}

export function GeographicZonesHeader({ onAddClick }: GeographicZonesHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <MapPin className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-cyan-500">
            Zone Géographie
          </h1>
          <p className="text-muted-foreground">
            Gestion des régions, zones et emplacements
          </p>
        </div>
      </div>

      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter une zone
      </Button>
    </motion.div>
  );
}
