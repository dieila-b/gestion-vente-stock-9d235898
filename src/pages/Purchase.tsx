import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatGNF } from "@/lib/currency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { usePurchaseEdit } from "@/hooks/purchases/use-purchase-edit";
import { isSelectQueryError, safeSupplier } from "@/utils/supabase-safe-query";

export default function PurchasePage() {
  const { id } = useParams(); // Get the ID from URL params instead
  const { purchase, isLoading, updatePaymentStatus } = usePurchaseEdit(id);

  // Access purchase data safely using optional chaining and check for SelectQueryError
  const safeSupplierObj = purchase?.supplier && !isSelectQueryError(purchase.supplier) 
    ? purchase.supplier 
    : { name: 'Unknown Supplier' };

  const supplierName = safeSupplierObj.name || 'Unknown Supplier';
  const orderNumber = purchase?.order_number || 'N/A';
  const totalAmount = purchase?.total_amount || 0;
  const status = purchase?.status || 'pending';
  const paymentStatus = purchase?.payment_status || 'pending';
  const expectedDeliveryDate = purchase?.expected_delivery_date || 'N/A';
  const discount = purchase?.discount || 0;
  const shippingCost = purchase?.shipping_cost || 0;
  const transitCost = purchase?.transit_cost || 0;
  const logisticsCost = purchase?.logistics_cost || 0;
  const taxRate = purchase?.tax_rate || 0;

  const handleUpdateStatus = () => {
    if (updatePaymentStatus && id) {
      updatePaymentStatus(paymentStatus === 'pending' ? 'paid' : 'pending');
    } else {
      console.error("updatePaymentStatus function is not available");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'GNF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading || !purchase) {
    return (
      <DashboardLayout>
        <div>Loading purchase details...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle>Purchase Order Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label>Order Number</Label>
                <Input value={orderNumber} readOnly />
              </div>
              <div>
                <Label>Supplier</Label>
                <Input value={supplierName} readOnly />
              </div>
              <div>
                <Label>Total Amount</Label>
                <Input value={formatPrice(totalAmount)} readOnly />
              </div>
              <div>
                <Label>Status</Label>
                <Input value={status} readOnly />
              </div>
              <div>
                <Label>Payment Status</Label>
                <Input value={paymentStatus} readOnly />
              </div>
              <div>
                <Label>Expected Delivery Date</Label>
                <Input value={expectedDeliveryDate} readOnly />
              </div>
              <div>
                <Label>Discount</Label>
                <Input value={discount} readOnly />
              </div>
              <div>
                <Label>Shipping Cost</Label>
                <Input value={shippingCost} readOnly />
              </div>
              <div>
                <Label>Transit Cost</Label>
                <Input value={transitCost} readOnly />
              </div>
              <div>
                <Label>Logistics Cost</Label>
                <Input value={logisticsCost} readOnly />
              </div>
              <div>
                <Label>Tax Rate</Label>
                <Input value={taxRate} readOnly />
              </div>
              
              <Button onClick={handleUpdateStatus}>
                {paymentStatus === 'pending' ? 'Mark as Paid' : 'Mark as Pending'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
