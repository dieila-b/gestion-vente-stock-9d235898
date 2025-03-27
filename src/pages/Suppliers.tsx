
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { useSuppliers } from "@/hooks/use-suppliers";
import { UserPlus, Search, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AddSupplierDialog } from "@/components/suppliers/AddSupplierDialog";
import { SupplierCard } from "@/components/suppliers/SupplierCard";

const Suppliers = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isAddSupplierOpen, setIsAddSupplierOpen] = useState(false);
  const { suppliers, isLoading } = useSuppliers();
  const { toast } = useToast();

  const filteredSuppliers = suppliers?.filter(supplier => {
    if (!searchQuery) return true;
    
    const search = searchQuery.toLowerCase();
    return (
      supplier.name.toLowerCase().includes(search) ||
      supplier.contact?.toLowerCase().includes(search) ||
      supplier.email?.toLowerCase().includes(search) ||
      supplier.phone?.toLowerCase().includes(search)
    );
  });

  return (
    <DashboardLayout>
      <div className="p-8 space-y-8 max-w-[1600px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="p-2 rounded-xl bg-primary/10">
              <Package className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gradient">
                Gestion des Fournisseurs
              </h1>
              <p className="text-muted-foreground">
                Gérez vos fournisseurs et leurs informations
              </p>
            </div>
          </div>

          <Button 
            className="enhanced-glass"
            onClick={() => setIsAddSupplierOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Nouveau Fournisseur
          </Button>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Rechercher un fournisseur..."
              className="pl-10 enhanced-glass"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="h-[200px] animate-pulse enhanced-glass" />
            ))
          ) : filteredSuppliers?.length === 0 ? (
            <div className="col-span-full text-center py-12 text-muted-foreground">
              Aucun fournisseur trouvé
            </div>
          ) : (
            filteredSuppliers?.map((supplier) => (
              <motion.div
                key={supplier.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <SupplierCard supplier={supplier} />
              </motion.div>
            ))
          )}
        </motion.div>

        <AddSupplierDialog 
          isOpen={isAddSupplierOpen}
          onOpenChange={setIsAddSupplierOpen}
        />
      </div>
    </DashboardLayout>
  );
};

export default Suppliers;

