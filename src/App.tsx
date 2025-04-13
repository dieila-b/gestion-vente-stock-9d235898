
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Index from "./pages/Index";
import Catalog from "./pages/Catalog";
import POS from "./pages/POS";
import Sales from "./pages/Sales";
import NotFound from "./pages/NotFound";
import { Toaster } from "sonner";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { AuthProvider } from "./components/auth/AuthProvider";
import RequireAuth from "./components/auth/RequireAuth";
import ProductUnits from "./pages/ProductUnits";
import Clients from "./pages/Clients";
import InternalUsers from "./pages/InternalUsers";
import Expenses from "./pages/Expenses";
import Orders from "./pages/Orders";
import Payments from "./pages/Payments";
import StockStatus from "./pages/StockLocation";
import Suppliers from "./pages/Suppliers";
import ExpenseIncome from "./pages/ExpenseIncome";
import ExpenseOutcome from "./pages/ExpenseOutcome";
import BankAccounts from "./pages/BankAccounts";
import CashRegisters from "./pages/CashRegisters";
import Purchase from "./pages/Purchase";
import Quotes from "./pages/Quotes";
import Invoices from "./pages/Invoices";
import SalesInvoices from "./pages/SalesInvoices";
import CustomerReturns from "./pages/CustomerReturns";
import SupplierReturns from "./pages/SupplierReturns";
import Transfers from "./pages/Transfers";
import MainStock from "./pages/stocks/MainStock";
import OutOfStock from "./pages/stocks/OutOfStock";
import LowStock from "./pages/stocks/LowStock";
import StockIn from "./pages/stocks/StockIn";
import StockOut from "./pages/stocks/StockOut";
import POSStock from "./pages/stocks/POSStock";
import PurchaseOrder from "./pages/PurchaseOrder";
import DeliveryNote from "./pages/DeliveryNote";
import EditDeliveryNote from "./pages/EditDeliveryNote";
import PurchaseInvoice from "./pages/PurchaseInvoice";
import PreorderInvoices from "./pages/PreorderInvoices";
import Preorders from "./pages/Preorders";
import POSLocations from "./pages/POSLocations";
import Warehouses from "./pages/Warehouses";

// Reports
import YearlyReport from "./pages/reports/YearlyReport";
import MonthlyReport from "./pages/reports/MonthlyReport";
import DailyReport from "./pages/reports/DailyReport";
import ClientsReport from "./pages/reports/ClientsReport";
import UnpaidReport from "./pages/reports/UnpaidReport";
import CustomReport from "./pages/reports/CustomReport";
import { queryClient } from "./main";

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/404" element={<NotFound />} />
        
        {/* Protected Routes */}
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/catalog" element={<RequireAuth><Catalog /></RequireAuth>} />
        <Route path="/pos" element={<RequireAuth><POS /></RequireAuth>} />
        <Route path="/sales" element={<RequireAuth><Sales /></RequireAuth>} />
        <Route path="/product-units" element={<RequireAuth><ProductUnits /></RequireAuth>} />
        <Route path="/clients" element={<RequireAuth><Clients /></RequireAuth>} />
        <Route path="/users" element={<RequireAuth><InternalUsers /></RequireAuth>} />
        <Route path="/expenses" element={<RequireAuth><Expenses /></RequireAuth>} />
        <Route path="/orders" element={<RequireAuth><Orders /></RequireAuth>} />
        <Route path="/payments" element={<RequireAuth><Payments /></RequireAuth>} />
        <Route path="/stock-location" element={<RequireAuth><StockStatus /></RequireAuth>} />
        <Route path="/suppliers" element={<RequireAuth><Suppliers /></RequireAuth>} />
        <Route path="/expense-income" element={<RequireAuth><ExpenseIncome /></RequireAuth>} />
        <Route path="/expense-outcome" element={<RequireAuth><ExpenseOutcome /></RequireAuth>} />
        <Route path="/bank-accounts" element={<RequireAuth><BankAccounts /></RequireAuth>} />
        <Route path="/cash-registers" element={<RequireAuth><CashRegisters /></RequireAuth>} />
        <Route path="/purchase" element={<RequireAuth><Purchase /></RequireAuth>} />
        <Route path="/quotes" element={<RequireAuth><Quotes /></RequireAuth>} />
        <Route path="/invoices" element={<RequireAuth><Invoices /></RequireAuth>} />
        <Route path="/sales-invoices" element={<RequireAuth><SalesInvoices /></RequireAuth>} />
        <Route path="/customer-returns" element={<RequireAuth><CustomerReturns /></RequireAuth>} />
        <Route path="/supplier-returns" element={<RequireAuth><SupplierReturns /></RequireAuth>} />
        <Route path="/transfers" element={<RequireAuth><Transfers /></RequireAuth>} />
        <Route path="/stocks" element={<RequireAuth><MainStock /></RequireAuth>} />
        <Route path="/stocks/out-of-stock" element={<RequireAuth><OutOfStock /></RequireAuth>} />
        <Route path="/stocks/low-stock" element={<RequireAuth><LowStock /></RequireAuth>} />
        <Route path="/stocks/stock-in" element={<RequireAuth><StockIn /></RequireAuth>} />
        <Route path="/stocks/stock-out" element={<RequireAuth><StockOut /></RequireAuth>} />
        <Route path="/stocks/pos-stock" element={<RequireAuth><POSStock /></RequireAuth>} />
        <Route path="/purchase-order" element={<RequireAuth><PurchaseOrder /></RequireAuth>} />
        <Route path="/delivery-note" element={<RequireAuth><DeliveryNote /></RequireAuth>} />
        <Route path="/delivery-note/:id" element={<RequireAuth><EditDeliveryNote /></RequireAuth>} />
        <Route path="/purchase-invoice" element={<RequireAuth><PurchaseInvoice /></RequireAuth>} />
        <Route path="/preorder-invoices" element={<RequireAuth><PreorderInvoices /></RequireAuth>} />
        <Route path="/preorders" element={<RequireAuth><Preorders /></RequireAuth>} />
        <Route path="/pos-locations" element={<RequireAuth><POSLocations /></RequireAuth>} />
        <Route path="/warehouses" element={<RequireAuth><Warehouses /></RequireAuth>} />
        
        {/* Report Routes */}
        <Route path="/reports/yearly" element={<RequireAuth><YearlyReport /></RequireAuth>} />
        <Route path="/reports/monthly" element={<RequireAuth><MonthlyReport /></RequireAuth>} />
        <Route path="/reports/daily" element={<RequireAuth><DailyReport /></RequireAuth>} />
        <Route path="/reports/clients" element={<RequireAuth><ClientsReport /></RequireAuth>} />
        <Route path="/reports/unpaid" element={<RequireAuth><UnpaidReport /></RequireAuth>} />
        <Route path="/reports/custom" element={<RequireAuth><CustomReport /></RequireAuth>} />
        
        {/* Redirects */}
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
      <ReactQueryDevtools initialIsOpen={false} />
    </AuthProvider>
  );
}

export default App;
