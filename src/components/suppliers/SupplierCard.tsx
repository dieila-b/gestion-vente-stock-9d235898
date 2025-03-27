
import { Star, Mail, Phone, MapPin, Globe, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Supplier } from "@/types/supplier";
import { useState } from "react";
import { SupplierDetailsDialog } from "./SupplierDetailsDialog";
import { SupplierModals } from "./SupplierModals";

interface SupplierCardProps {
  supplier: Supplier;
}

export const SupplierCard = ({ supplier }: SupplierCardProps) => {
  const { toast } = useToast();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isOrderFormOpen, setIsOrderFormOpen] = useState(false);
  const [isPriceRequestFormOpen] = useState(false);

  return (
    <>
      <div
        className="glass-effect p-4 rounded-lg space-y-4 hover:scale-[1.02] transition-all duration-300 animate-fade-in relative overflow-hidden"
        style={{ 
          transform: "perspective(1000px) rotateX(0deg)",
        }}
        onMouseEnter={(e) => {
          const target = e.currentTarget;
          target.style.transform = "perspective(1000px) rotateX(5deg)";
        }}
        onMouseLeave={(e) => {
          const target = e.currentTarget;
          target.style.transform = "perspective(1000px) rotateX(0deg)";
        }}
      >
        {supplier.verified && (
          <div className="absolute top-2 right-2">
            <Check className="h-5 w-5 text-green-500" />
          </div>
        )}
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-gradient">{supplier.name}</h3>
            <p className="text-sm text-muted-foreground">{supplier.contact}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs ${
            supplier.status === "Actif" ? 'bg-green-500/20 text-green-500 border border-green-500/20' :
            supplier.status === "En attente" ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500/20' :
            'bg-red-500/20 text-red-500 border border-red-500/20'
          }`}>
            {supplier.status}
          </span>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{supplier.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{supplier.phone}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{supplier.address}</span>
          </div>
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{supplier.website}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm mt-4">
          <div>
            <p className="text-muted-foreground">Produits</p>
            <p className="font-medium">{supplier.products_count}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Commandes</p>
            <p className="font-medium">{supplier.orders_count}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Note</p>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="font-medium">{supplier.rating}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Performance globale</span>
            <span>{supplier.performance_score}%</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2.5">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2.5 transition-all duration-500"
              style={{ width: `${supplier.performance_score}%` }}
            />
          </div>
        </div>

        <div className="pt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="w-full glass-effect"
            onClick={() => setIsDetailsOpen(true)}
          >
            Voir détails
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="w-full glass-effect"
            onClick={() => setIsOrderFormOpen(true)}
          >
            Commander
          </Button>
        </div>
      </div>

      <SupplierDetailsDialog 
        supplier={supplier}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
      />

      <SupplierModals
        isOrderFormOpen={isOrderFormOpen}
        isPriceRequestFormOpen={isPriceRequestFormOpen}
        selectedSupplier={supplier}
        onCloseOrderForm={() => setIsOrderFormOpen(false)}
        onClosePriceForm={() => {}}
      />
    </>
  );
};
