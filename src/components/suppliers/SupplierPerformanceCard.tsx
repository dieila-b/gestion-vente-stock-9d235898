
import { Supplier } from "@/types/supplier";

interface SupplierPerformanceCardProps {
  supplier: Supplier;
}

export const SupplierPerformanceCard = ({ supplier }: SupplierPerformanceCardProps) => {
  return (
    <div className="glass-effect p-4 rounded-lg space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-gradient">{supplier.name}</h3>
          <p className="text-sm text-muted-foreground">Performance & Qualité</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Qualité des produits</span>
            <span>{supplier.quality_score}%</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${supplier.quality_score}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Livraison à temps</span>
            <span>{supplier.delivery_score}%</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${supplier.delivery_score}%` }}
            />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Performance globale</span>
            <span>{supplier.performance_score}%</span>
          </div>
          <div className="w-full bg-gray-700/30 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${supplier.performance_score}%` }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm mt-4">
        <div>
          <p className="text-muted-foreground">Commandes en cours</p>
          <p className="font-medium">{supplier.pending_orders}</p>
        </div>
        <div>
          <p className="text-muted-foreground">CA Total</p>
          <p className="font-medium">{new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(supplier.total_revenue || 0)}</p>
        </div>
      </div>
    </div>
  );
};

