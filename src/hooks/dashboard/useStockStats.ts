
import { useQuery } from "@tanstack/react-query";
import { db } from "@/utils/db-core";
import { safeArray, safeNumber } from "@/utils/data-safe/safe-access";

interface CatalogProduct {
  id: string;
  name: string;
  stock: number;
  price: number;
  purchase_price: number;
  [key: string]: any;
}

export function useStockStats() {
  console.log("useStockStats: Démarrage avec gestion d'erreur renforcée");

  const { data: catalog = [] } = useQuery({
    queryKey: ['stock-catalog-safe'],
    queryFn: async () => {
      try {
        return await db.query<CatalogProduct>('catalog', q => q.select('*'), []);
      } catch (error) {
        console.error("Erreur dans catalog:", error);
        return [];
      }
    },
    retry: 1,
    staleTime: 30000
  });

  // Calculs sécurisés basés sur le catalogue
  const safeCatalog = safeArray(catalog);
  
  const totalStock = safeCatalog.reduce((sum, product) => {
    return sum + safeNumber(product?.stock, 0);
  }, 0);
  
  const totalStockPurchaseValue = safeCatalog.reduce((sum, product) => {
    const stock = safeNumber(product?.stock, 0);
    const purchasePrice = safeNumber(product?.purchase_price, 0);
    return sum + (stock * purchasePrice);
  }, 0);
  
  const totalStockSaleValue = safeCatalog.reduce((sum, product) => {
    const stock = safeNumber(product?.stock, 0);
    const price = safeNumber(product?.price, 0);
    return sum + (stock * price);
  }, 0);
  
  const globalStockMargin = totalStockSaleValue - totalStockPurchaseValue;
  const marginPercentage = totalStockPurchaseValue > 0 
    ? (globalStockMargin / totalStockPurchaseValue) * 100 
    : 0;

  console.log("useStockStats: Calculs terminés", {
    catalogLength: safeCatalog.length,
    totalStock,
    totalStockPurchaseValue,
    totalStockSaleValue,
    globalStockMargin,
    marginPercentage
  });

  return {
    catalog: safeCatalog,
    totalStock,
    totalStockPurchaseValue,
    totalStockSaleValue,
    globalStockMargin,
    marginPercentage
  };
}
