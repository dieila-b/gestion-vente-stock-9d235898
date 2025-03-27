
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ClientsToolbarProps {
  searchQuery: string;
  setSearchQuery: (value: string) => void;
  clientTypeFilter: string;
  setClientTypeFilter: (value: string) => void;
}

export const ClientsToolbar = ({ 
  searchQuery, 
  setSearchQuery, 
  clientTypeFilter, 
  setClientTypeFilter 
}: ClientsToolbarProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="flex gap-4"
    >
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Code ou Désignation ou Numéro..."
          className="pl-10 enhanced-glass"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      <Select
        value={clientTypeFilter}
        onValueChange={setClientTypeFilter}
      >
        <SelectTrigger className="w-[180px] enhanced-glass">
          <SelectValue placeholder="Type de client" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous les types</SelectItem>
          <SelectItem value="occasionnel">Occasionnel</SelectItem>
          <SelectItem value="grossiste">Grossiste</SelectItem>
          <SelectItem value="semi-grossiste">Semi-Grossiste</SelectItem>
          <SelectItem value="regulier">Régulier</SelectItem>
        </SelectContent>
      </Select>
    </motion.div>
  );
};
