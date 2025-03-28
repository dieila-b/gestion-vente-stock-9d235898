
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";
import { motion } from "framer-motion";

interface InternalUserHeaderProps {
  onAddClick: () => void;
}

export const InternalUserHeader = ({ onAddClick }: InternalUserHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-between"
    >
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-xl bg-primary/10">
          <User className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gradient bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-500">
            Utilisateurs Internes
          </h1>
          <p className="text-muted-foreground">
            Gestion des utilisateurs et des droits d'accès
          </p>
        </div>
      </div>

      <Button onClick={onAddClick}>
        <UserPlus className="mr-2 h-4 w-4" />
        Ajouter un utilisateur
      </Button>
    </motion.div>
  );
};
