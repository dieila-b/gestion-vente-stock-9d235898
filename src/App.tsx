import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Dashboard } from "@/pages/Dashboard";
import { POS } from "@/pages/POS";
import { Products } from "@/pages/Products";
import { Categories } from "@/pages/Categories";
import { Clients } from "@/pages/Clients";
import { Suppliers } from "@/pages/Suppliers";
import { Purchases } from "@/pages/Purchases";
import { Sales } from "@/pages/Sales";
import { Transactions } from "@/pages/Transactions";
import { Users } from "@/pages/Users";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { RequireAuth } from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/components/auth/AuthProvider";
import { Home } from "@/pages/Home";
import { CreateProduct } from "@/pages/CreateProduct";
import { EditProduct } from "@/pages/EditProduct";
import { CreateCategory } from "@/pages/CreateCategory";
import { EditCategory } from "@/pages/EditCategory";
import { CreateClient } from "@/pages/CreateClient";
import { EditClient } from "@/pages/EditClient";
import { CreateSupplier } from "@/pages/CreateSupplier";
import { EditSupplier } from "@/pages/EditSupplier";
import { CreatePurchaseOrder } from "@/pages/CreatePurchaseOrder";
import { EditPurchaseOrder } from "@/pages/EditPurchaseOrder";
import { DeliveryNotes } from "@/pages/DeliveryNotes";
import { CreateDeliveryNote } from "@/pages/CreateDeliveryNote";
import { EditDeliveryNote } from "@/pages/EditDeliveryNote";
import { SupplierOrders } from "@/pages/SupplierOrders";
import { CreateSupplierOrder } from "@/pages/CreateSupplierOrder";
import { EditSupplierOrder } from "@/pages/EditSupplierOrder";
import { StockAdjustments } from "@/pages/StockAdjustments";
import { CreateStockAdjustment } from "@/pages/CreateStockAdjustment";
import { EditStockAdjustment } from "@/pages/EditStockAdjustment";
import { StockTransfers } from "@/pages/StockTransfers";
import { CreateStockTransfer } from "@/pages/CreateStockTransfer";
import { EditStockTransfer } from "@/pages/EditStockTransfer";
import { StockCounts } from "@/pages/StockCounts";
import { CreateStockCount } from "@/pages/CreateStockCount";
import { EditStockCount } from "@/pages/EditStockCount";
import { DamagedProducts } from "@/pages/DamagedProducts";
import { CreateDamagedProduct } from "@/pages/CreateDamagedProduct";
import { EditDamagedProduct } from "@/pages/EditDamagedProduct";
import { ExpiredProducts } from "@/pages/ExpiredProducts";
import { CreateExpiredProduct } from "@/pages/CreateExpiredProduct";
import { EditExpiredProduct } from "@/pages/EditExpiredProduct";
import { LowStockProducts } from "@/pages/LowStockProducts";
import { CreateUser } from "@/pages/CreateUser";
import { EditUser } from "@/pages/EditUser";
import { ViewPurchaseOrder } from "@/pages/ViewPurchaseOrder";
import { ViewSupplierOrder } from "@/pages/ViewSupplierOrder";
import { ViewDeliveryNote } from "@/pages/ViewDeliveryNote";
import { ViewStockAdjustment } from "@/pages/ViewStockAdjustment";
import { ViewStockTransfer } from "@/pages/ViewStockTransfer";
import { ViewStockCount } from "@/pages/ViewStockCount";
import { ViewDamagedProduct } from "@/pages/ViewDamagedProduct";
import { ViewExpiredProduct } from "@/pages/ViewExpiredProduct";
import { ViewLowStockProduct } from "@/pages/ViewLowStockProduct";
import { ViewTransaction } from "@/pages/ViewTransaction";
import { ViewClient } from "@/pages/ViewClient";
import { ViewSupplier } from "@/pages/ViewSupplier";
import { ViewProduct } from "@/pages/ViewProduct";
import { ViewCategory } from "@/pages/ViewCategory";
import { ViewUser } from "@/pages/ViewUser";
import SalesInvoices from "./pages/SalesInvoices";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <RequireAuth>
              <Dashboard />
            </RequireAuth>
          }
        />
        <Route
          path="/pos"
          element={
            <RequireAuth>
              <POS />
            </RequireAuth>
          }
        />

        <Route
          path="/products"
          element={
            <RequireAuth>
              <Products />
            </RequireAuth>
          }
        />
        <Route
          path="/products/create"
          element={
            <RequireAuth>
              <CreateProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/products/:id/edit"
          element={
            <RequireAuth>
              <EditProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/products/:id/view"
          element={
            <RequireAuth>
              <ViewProduct />
            </RequireAuth>
          }
        />

        <Route
          path="/categories"
          element={
            <RequireAuth>
              <Categories />
            </RequireAuth>
          }
        />
        <Route
          path="/categories/create"
          element={
            <RequireAuth>
              <CreateCategory />
            </RequireAuth>
          }
        />
        <Route
          path="/categories/:id/edit"
          element={
            <RequireAuth>
              <EditCategory />
            </RequireAuth>
          }
        />
        <Route
          path="/categories/:id/view"
          element={
            <RequireAuth>
              <ViewCategory />
            </RequireAuth>
          }
        />

        <Route
          path="/clients"
          element={
            <RequireAuth>
              <Clients />
            </RequireAuth>
          }
        />
        <Route
          path="/clients/create"
          element={
            <RequireAuth>
              <CreateClient />
            </RequireAuth>
          }
        />
        <Route
          path="/clients/:id/edit"
          element={
            <RequireAuth>
              <EditClient />
            </RequireAuth>
          }
        />
        <Route
          path="/clients/:id/view"
          element={
            <RequireAuth>
              <ViewClient />
            </RequireAuth>
          }
        />

        <Route
          path="/suppliers"
          element={
            <RequireAuth>
              <Suppliers />
            </RequireAuth>
          }
        />
        <Route
          path="/suppliers/create"
          element={
            <RequireAuth>
              <CreateSupplier />
            </RequireAuth>
          }
        />
        <Route
          path="/suppliers/:id/edit"
          element={
            <RequireAuth>
              <EditSupplier />
            </RequireAuth>
          }
        />
        <Route
          path="/suppliers/:id/view"
          element={
            <RequireAuth>
              <ViewSupplier />
            </RequireAuth>
          }
        />

        <Route
          path="/purchases"
          element={
            <RequireAuth>
              <Purchases />
            </RequireAuth>
          }
        />
        <Route
          path="/purchases/create"
          element={
            <RequireAuth>
              <CreatePurchaseOrder />
            </RequireAuth>
          }
        />
        <Route
          path="/purchases/:id/edit"
          element={
            <RequireAuth>
              <EditPurchaseOrder />
            </RequireAuth>
          }
        />
        <Route
          path="/purchases/:id/view"
          element={
            <RequireAuth>
              <ViewPurchaseOrder />
            </RequireAuth>
          }
        />

        <Route
          path="/delivery-notes"
          element={
            <RequireAuth>
              <DeliveryNotes />
            </RequireAuth>
          }
        />
        <Route
          path="/delivery-notes/create"
          element={
            <RequireAuth>
              <CreateDeliveryNote />
            </RequireAuth>
          }
        />
        <Route
          path="/delivery-notes/:id/edit"
          element={
            <RequireAuth>
              <EditDeliveryNote />
            </RequireAuth>
          }
        />
        <Route
          path="/delivery-notes/:id/view"
          element={
            <RequireAuth>
              <ViewDeliveryNote />
            </RequireAuth>
          }
        />

        <Route
          path="/supplier-orders"
          element={
            <RequireAuth>
              <SupplierOrders />
            </RequireAuth>
          }
        />
         <Route
          path="/supplier-orders/create"
          element={
            <RequireAuth>
              <CreateSupplierOrder />
            </RequireAuth>
          }
        />
        <Route
          path="/supplier-orders/:id/edit"
          element={
            <RequireAuth>
              <EditSupplierOrder />
            </RequireAuth>
          }
        />
         <Route
          path="/supplier-orders/:id/view"
          element={
            <RequireAuth>
              <ViewSupplierOrder />
            </RequireAuth>
          }
        />

        <Route
          path="/stock-adjustments"
          element={
            <RequireAuth>
              <StockAdjustments />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-adjustments/create"
          element={
            <RequireAuth>
              <CreateStockAdjustment />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-adjustments/:id/edit"
          element={
            <RequireAuth>
              <EditStockAdjustment />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-adjustments/:id/view"
          element={
            <RequireAuth>
              <ViewStockAdjustment />
            </RequireAuth>
          }
        />

        <Route
          path="/stock-transfers"
          element={
            <RequireAuth>
              <StockTransfers />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-transfers/create"
          element={
            <RequireAuth>
              <CreateStockTransfer />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-transfers/:id/edit"
          element={
            <RequireAuth>
              <EditStockTransfer />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-transfers/:id/view"
          element={
            <RequireAuth>
              <ViewStockTransfer />
            </RequireAuth>
          }
        />

        <Route
          path="/stock-counts"
          element={
            <RequireAuth>
              <StockCounts />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-counts/create"
          element={
            <RequireAuth>
              <CreateStockCount />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-counts/:id/edit"
          element={
            <RequireAuth>
              <EditStockCount />
            </RequireAuth>
          }
        />
        <Route
          path="/stock-counts/:id/view"
          element={
            <RequireAuth>
              <ViewStockCount />
            </RequireAuth>
          }
        />

        <Route
          path="/damaged-products"
          element={
            <RequireAuth>
              <DamagedProducts />
            </RequireAuth>
          }
        />
        <Route
          path="/damaged-products/create"
          element={
            <RequireAuth>
              <CreateDamagedProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/damaged-products/:id/edit"
          element={
            <RequireAuth>
              <EditDamagedProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/damaged-products/:id/view"
          element={
            <RequireAuth>
              <ViewDamagedProduct />
            </RequireAuth>
          }
        />

        <Route
          path="/expired-products"
          element={
            <RequireAuth>
              <ExpiredProducts />
            </RequireAuth>
          }
        />
        <Route
          path="/expired-products/create"
          element={
            <RequireAuth>
              <CreateExpiredProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/expired-products/:id/edit"
          element={
            <RequireAuth>
              <EditExpiredProduct />
            </RequireAuth>
          }
        />
        <Route
          path="/expired-products/:id/view"
          element={
            <RequireAuth>
              <ViewExpiredProduct />
            </RequireAuth>
          }
        />

        <Route
          path="/low-stock-products"
          element={
            <RequireAuth>
              <LowStockProducts />
            </RequireAuth>
          }
        />
        <Route
          path="/low-stock-products/:id/view"
          element={
            <RequireAuth>
              <ViewLowStockProduct />
            </RequireAuth>
          }
        />

        <Route
          path="/transactions"
          element={
            <RequireAuth>
              <Transactions />
            </RequireAuth>
          }
        />
        <Route
          path="/transactions/:id/view"
          element={
            <RequireAuth>
              <ViewTransaction />
            </RequireAuth>
          }
        />

        <Route
          path="/users"
          element={
            <RequireAuth>
              <Users />
            </RequireAuth>
          }
        />
        <Route
          path="/users/create"
          element={
            <RequireAuth>
              <CreateUser />
            </RequireAuth>
          }
        />
        <Route
          path="/users/:id/edit"
          element={
            <RequireAuth>
              <EditUser />
            </RequireAuth>
          }
        />
        <Route
          path="/users/:id/view"
          element={
            <RequireAuth>
              <ViewUser />
            </RequireAuth>
          }
        />

        <Route
          path="/settings"
          element={
            <RequireAuth>
              <Settings />
            </RequireAuth>
          }
        />
        <Route path="/sales-invoices" element={<SalesInvoices />} />
      </Routes>
    </Router>
  );
}

export default App;
