
import { Routes, Route } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import Dashboard from "@/pages/Dashboard";
import Catalog from "@/pages/Catalog";
import POS from "@/pages/POS";
import Sales from "@/pages/Sales";
import Payments from "@/pages/Payments";
import Preorders from "@/pages/Preorders";
import Clients from "@/pages/Clients";
import Suppliers from "@/pages/Suppliers";
import Orders from "@/pages/Orders";
import Settings from "@/pages/Settings";
import Login from "@/pages/Login";
import { AuthProvider } from "@/components/auth/AuthProvider";
import RequireAuth from "@/components/auth/RequireAuth";
import Products from "@/pages/Products";
import PriceRequests from "@/pages/PriceRequests";
import StockStatus from "@/pages/StockStatus";
import Warehouses from "@/pages/Warehouses";
import Transfers from "@/pages/Transfers";
import PreorderInvoices from "@/pages/PreorderInvoices";
import NewPurchaseOrder from "@/pages/NewPurchaseOrder";
import InternalUsers from "@/pages/InternalUsers"; 
import StockLocation from "@/pages/StockLocation"; 
import POSLocations from "@/pages/POSLocations"; 
import Index from "@/pages/Index";

// Reports imports
import DailyReport from "@/pages/reports/DailyReport";
import MonthlyReport from "@/pages/reports/MonthlyReport";
import YearlyReport from "@/pages/reports/YearlyReport";
import CustomReport from "@/pages/reports/CustomReport";
import ClientsReport from "@/pages/reports/ClientsReport";
import UnpaidReport from "./pages/reports/UnpaidReport";

// Stock pages imports
import MainStock from "@/pages/stocks/MainStock";
import POSStock from "@/pages/stocks/POSStock";
import StockIn from "@/pages/stocks/StockIn";
import StockOut from "@/pages/stocks/StockOut";

// Purchase pages imports
import PurchaseOrdersPage from "@/pages/purchase-orders";
import DeliveryNotesPage from "@/pages/delivery-notes";
import PurchaseInvoicesPage from "@/pages/purchase-invoices";
import SupplierReturns from "@/pages/SupplierReturns";

// Sales & Billing pages imports
import SalesInvoices from "@/pages/SalesInvoices";
import Quotes from "@/pages/Quotes";
import CustomerReturns from "@/pages/CustomerReturns";

// Accounting pages imports
import CashRegisters from "@/pages/CashRegisters";
import BankAccounts from "@/pages/BankAccounts";
import Expenses from "@/pages/Expenses";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Index />} />
        <Route path="/*" element={
          <RequireAuth>
            <DashboardLayout>
              <Routes>
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="catalog" element={<Catalog />} />
                <Route path="pos" element={<POS />} />
                <Route path="sales" element={<Sales />} />
                <Route path="preorders" element={<Preorders />} />
                <Route path="preorder-invoices" element={<PreorderInvoices />} />
                <Route path="payments" element={<Payments />} />
                <Route path="clients" element={<Clients />} />
                <Route path="suppliers" element={<Suppliers />} />
                <Route path="orders" element={<Orders />} />
                <Route path="price-requests" element={<PriceRequests />} />
                <Route path="products" element={<Products />} />
                <Route path="settings" element={<Settings />} />
                
                {/* Stock Management Routes */}
                <Route path="stock-status" element={<StockStatus />} />
                <Route path="stocks/main" element={<MainStock />} />
                <Route path="stocks/pos" element={<POSStock />} />
                <Route path="stocks/in" element={<StockIn />} />
                <Route path="stocks/out" element={<StockOut />} />
                <Route path="warehouses" element={<Warehouses />} />
                <Route path="pos-locations" element={<POSLocations />} />
                <Route path="transfers" element={<Transfers />} />
                
                {/* Reports Routes */}
                <Route path="reports/daily" element={<DailyReport />} />
                <Route path="reports/monthly" element={<MonthlyReport />} />
                <Route path="reports/yearly" element={<YearlyReport />} />
                <Route path="reports/custom" element={<CustomReport />} />
                <Route path="reports/clients" element={<ClientsReport />} />
                <Route path="reports/unpaid" element={<UnpaidReport />} />
                
                {/* Purchase Routes */}
                <Route path="purchase-orders" element={<PurchaseOrdersPage />} />
                <Route path="purchase-orders/new" element={<NewPurchaseOrder />} />
                <Route path="delivery-note" element={<DeliveryNotesPage />} />
                <Route path="purchase-invoice" element={<PurchaseInvoicesPage />} />
                <Route path="supplier-returns" element={<SupplierReturns />} />
                
                {/* Sales & Billing Routes */}
                <Route path="sales-invoices" element={<SalesInvoices />} />
                <Route path="quotes" element={<Quotes />} />
                <Route path="customer-returns" element={<CustomerReturns />} />
                
                {/* Accounting Routes */}
                <Route path="cash-registers" element={<CashRegisters />} />
                <Route path="bank-accounts" element={<BankAccounts />} />
                <Route path="expenses" element={<Expenses />} />
                
                {/* Settings Routes */}
                <Route path="stock-location" element={<StockLocation />} />
                <Route path="internal-users" element={<InternalUsers />} />
              </Routes>
            </DashboardLayout>
          </RequireAuth>
        } />
      </Routes>
    </AuthProvider>
  );
}

export default App;
