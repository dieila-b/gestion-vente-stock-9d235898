
import type { SupplierOrderProduct } from "@/types/supplierOrder";
import { OrderProductList } from "./OrderProductList";

interface OrderProductSectionProps {
  products: SupplierOrderProduct[];
  onAddProduct: (product: Partial<SupplierOrderProduct>) => void;
  onRemoveProduct: (productId: string) => void;
  onProductChange: (products: SupplierOrderProduct[]) => void;
  formatPrice: (price: number) => string;
}

export const OrderProductSection = ({
  products,
  onAddProduct,
  onRemoveProduct,
  onProductChange,
  formatPrice,
}: OrderProductSectionProps) => {
  return (
    <OrderProductList
      products={products}
      onAddProduct={onAddProduct}
      onRemoveProduct={onRemoveProduct}
      onProductChange={onProductChange}
      formatPrice={formatPrice}
    />
  );
};
