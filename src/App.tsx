
import { Routes, Route } from "react-router-dom";
import Dashboard from "@/pages/Dashboard";
import POS from "@/pages/POS";
import Products from "@/pages/Products";
import Clients from "@/pages/Clients";
import Suppliers from "@/pages/Suppliers";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import RequireAuth from "@/components/auth/RequireAuth";
import { AuthProvider } from "@/components/auth/AuthProvider";
import Index from "@/pages/Index";
import EditDeliveryNote from "@/pages/EditDeliveryNote";
import SalesInvoices from "./pages/SalesInvoices";
import Sales from "./pages/Sales";
import DeliveryNotes from "./pages/DeliveryNotes";
import PurchaseOrders from "./pages/PurchaseOrders";
import PurchaseInvoices from "./pages/PurchaseInvoices";
import PreorderInvoices from "./pages/PreorderInvoices";
import StockTransfers from "./pages/StockTransfers";
import Warehouse from "./pages/Warehouse";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />

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
          path="/clients"
          element={
            <RequireAuth>
              <Clients />
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
          path="/sales"
          element={
            <RequireAuth>
              <Sales />
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
          path="/delivery-notes/:id/edit"
          element={
            <RequireAuth>
              <EditDeliveryNote />
            </RequireAuth>
          }
        />

        <Route
          path="/purchase-orders"
          element={
            <RequireAuth>
              <PurchaseOrders />
            </RequireAuth>
          }
        />

        <Route
          path="/purchase-invoices"
          element={
            <RequireAuth>
              <PurchaseInvoices />
            </RequireAuth>
          }
        />

        <Route
          path="/preorder-invoices"
          element={
            <RequireAuth>
              <PreorderInvoices />
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
          path="/warehouse"
          element={
            <RequireAuth>
              <Warehouse />
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
        
        <Route 
          path="/sales-invoices" 
          element={
            <RequireAuth>
              <SalesInvoices />
            </RequireAuth>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
