
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { OrdersPage } from "@/components/orders/OrdersPage";

export default function Orders() {
  return (
    <DashboardLayout>
      <OrdersPage />
    </DashboardLayout>
  );
}
