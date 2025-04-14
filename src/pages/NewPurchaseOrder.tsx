
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import PurchaseOrderForm from "@/components/purchases/new-order/PurchaseOrderForm";

const NewPurchaseOrder = () => {
  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <PurchaseOrderForm />
      </div>
    </DashboardLayout>
  );
};

export default NewPurchaseOrder;
