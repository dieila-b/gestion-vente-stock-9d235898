
import { Button } from "@/components/ui/button";
import { User, UserPlus } from "lucide-react";
import { motion } from "framer-motion";

interface InternalUsersHeaderProps {
  onAddClick: () => void;
}

export const InternalUsersHeader = ({ onAddClick }: InternalUsersHeaderProps) => {
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

      <Button onClick={onAddClick} size="lg" className="gap-2">
        <UserPlus className="h-5 w-5" />
        Ajouter un utilisateur
      </Button>
    </motion.div>
  );
};
