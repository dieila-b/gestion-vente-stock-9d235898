
import { Store, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface POSLocationsHeaderProps {
  onAddClick: () => void;
}

export function POSLocationsHeader({ onAddClick }: POSLocationsHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <Store className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-yellow-500 to-amber-500">
            Dépôts PDV
          </h1>
          <p className="text-muted-foreground">
            Gestion des points de vente
          </p>
        </div>
      </div>

      <Button onClick={onAddClick}>
        <Plus className="mr-2 h-4 w-4" />
        Ajouter un PDV
      </Button>
    </motion.div>
  );
}
