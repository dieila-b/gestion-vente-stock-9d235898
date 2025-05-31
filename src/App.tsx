
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {
  return (
    <AuthProvider>
      <Router>
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
            path="/delivery-notes/:id/edit"
            element={
              <RequireAuth>
                <EditDeliveryNote />
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
      </Router>
    </AuthProvider>
  );
}

export default App;
