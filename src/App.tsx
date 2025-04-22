import React from 'react';
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Categories from "./pages/Categories";
import Suppliers from "./pages/Suppliers";
import Clients from "./pages/Clients";
import Warehouses from "./pages/Warehouses";
import Users from "./pages/Users";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import RequireAuth from "./components/auth/RequireAuth";
import { AuthProvider } from "./components/auth/AuthProvider";
import Pos from "./pages/Pos";
import Orders from "./pages/Orders";
import Preorders from "./pages/Preorders";
import SalesInvoices from "./pages/SalesInvoices";
import PurchaseOrdersPage from "./pages/purchase-orders";
import PurchaseInvoicePage from "./pages/PurchaseInvoice";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/dashboard",
    element: (
      <RequireAuth>
        <Dashboard />
      </RequireAuth>
    ),
  },
  {
    path: "/products",
    element: (
      <RequireAuth>
        <Products />
      </RequireAuth>
    ),
  },
  {
    path: "/categories",
    element: (
      <RequireAuth>
        <Categories />
      </RequireAuth>
    ),
  },
  {
    path: "/suppliers",
    element: (
      <RequireAuth>
        <Suppliers />
      </RequireAuth>
    ),
  },
  {
    path: "/clients",
    element: (
      <RequireAuth>
        <Clients />
      </RequireAuth>
    ),
  },
  {
    path: "/warehouses",
    element: (
      <RequireAuth>
        <Warehouses />
      </RequireAuth>
    ),
  },
  {
    path: "/users",
    element: (
      <RequireAuth>
        <Users />
      </RequireAuth>
    ),
  },
  {
    path: "/settings",
    element: (
      <RequireAuth>
        <Settings />
      </RequireAuth>
    ),
  },
  {
    path: "/pos",
    element: (
      <RequireAuth>
        <Pos />
      </RequireAuth>
    ),
  },
  {
    path: "/orders",
    element: (
      <RequireAuth>
        <Orders />
      </RequireAuth>
    ),
  },
  {
    path: "/preorders",
    element: (
      <RequireAuth>
        <Preorders />
      </RequireAuth>
    ),
  },
  {
    path: "/sales-invoices",
    element: (
      <RequireAuth>
        <SalesInvoices />
      </RequireAuth>
    ),
  },
  {
    path: "/purchase-orders",
    element: (
      <RequireAuth>
        <PurchaseOrdersPage />
      </RequireAuth>
    ),
  },
  {
    path: "/purchase-invoices/:id",
    element: <PurchaseInvoicePage />
  },
]);

function App() {
  return (
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
