
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { PurchaseHeader } from "@/components/purchases/PurchaseHeader";
import { PurchaseOrderTable } from "@/components/purchases/PurchaseOrderTable";
import { usePurchaseOrders } from "@/hooks/use-purchase-orders";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

const PurchaseOrderPage = () => {
  const navigate = useNavigate();
  const {
    orders,
    isLoading,
    handleApprove,
    handleDelete,
    handleEdit,
  } = usePurchaseOrders();

  return (
    <DashboardLayout>
      <div className="container mx-auto py-10">
        <div className="flex justify-between items-center mb-6">
          <PurchaseHeader
            title="Bons de commande"
            description="Gérez vos bons de commande fournisseurs"
          />
          <Button
            onClick={() => navigate("/purchase-orders/new")}
            className="bg-green-500 hover:bg-green-600"
          >
            <Plus className="mr-2 h-4 w-4" /> Nouveau bon de commande
          </Button>
        </div>

        <Card>
          <CardContent className="p-0">
            <PurchaseOrderTable
              orders={orders}
              isLoading={isLoading}
              onApprove={(id) => handleApprove(id)}
              onDelete={handleDelete}
              onEdit={(id) => navigate(`/purchase-orders/edit/${id}`)}
              onView={(id) => navigate(`/purchase-orders/view/${id}`)}
            />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default PurchaseOrderPage;
