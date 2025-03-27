
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Mail, Phone, MapPin, Globe, Star, Check } from "lucide-react";
import { Supplier } from "@/types/supplier";

interface SupplierDetailsDialogProps {
  supplier: Supplier;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SupplierDetailsDialog = ({
  supplier,
  isOpen,
  onOpenChange,
}: SupplierDetailsDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-0 max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gradient bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 flex items-center gap-2">
            {supplier.name}
            {supplier.verified && (
              <Check className="h-5 w-5 text-green-500" />
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Informations de contact</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.email}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{supplier.address}</span>
                </div>
                {supplier.website && (
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <a 
                      href={supplier.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:text-blue-500 transition-colors"
                    >
                      {supplier.website}
                    </a>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-lg">Performance</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Note générale</span>
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                    <span className="font-medium">{supplier.rating}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Performance</span>
                  <span className="font-medium">{supplier.performance_score}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Qualité</span>
                  <span className="font-medium">{supplier.quality_score}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Livraison</span>
                  <span className="font-medium">{supplier.delivery_score}%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Statistiques</h3>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <p className="text-muted-foreground text-sm">Produits</p>
                <p className="text-xl font-semibold">{supplier.products_count}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <p className="text-muted-foreground text-sm">Commandes</p>
                <p className="text-xl font-semibold">{supplier.orders_count}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <p className="text-muted-foreground text-sm">En attente</p>
                <p className="text-xl font-semibold">{supplier.pending_orders}</p>
              </div>
              <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10">
                <p className="text-muted-foreground text-sm">Revenus</p>
                <p className="text-xl font-semibold">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(supplier.total_revenue)}</p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
