
import { 
  Home, Package, Store, Warehouse, Users, FileText,
  Box, BarChart3, FileEdit, CreditCard, Receipt, PiggyBank, 
  ArrowUpCircle, ArrowDownCircle, Wallet, Building2, ClipboardList,
  Truck, FileOutput, PackageX, ArrowRightLeft, Database,
  Calendar, CalendarRange, BanknoteIcon, PackagePlus, FileCheck
} from "lucide-react";

export const menuItems = [
  {
    label: "Tableau de Bord",
    icon: Home,
    path: "/"
  },
  {
    label: "Gestion des Stocks",
    icon: Package,
    submenu: [
      { 
        label: "État des stocks",
        icon: BarChart3,
        path: "/stock-status"
      },
      {
        label: "Stocks par Emplacement",
        icon: Box,
        submenu: [
          {
            label: "Stock Principal",
            icon: Warehouse,
            path: "/stocks/main"
          },
          {
            label: "Stock PDV",
            icon: Store,
            path: "/stocks/pos"
          }
        ]
      },
      {
        label: "Mouvements de Stock",
        icon: ArrowRightLeft,
        submenu: [
          {
            label: "Entrées",
            icon: ArrowUpCircle,
            path: "/stocks/in"
          },
          {
            label: "Sorties",
            icon: ArrowDownCircle,
            path: "/stocks/out"
          }
        ]
      },
      {
        label: "Emplacements",
        icon: Warehouse,
        submenu: [
          {
            label: "Entrepôts",
            icon: Warehouse,
            path: "/warehouses"
          },
          {
            label: "Points de Vente",
            icon: Store,
            path: "/pos-locations"
          }
        ]
      },
      {
        label: "Transferts",
        icon: ArrowRightLeft,
        path: "/transfers"
      },
      {
        label: "Catalogue",
        icon: FileText,
        path: "/catalog"
      }
    ]
  },
  {
    label: "Synthèses",
    icon: BarChart3,
    submenu: [
      {
        label: "Quotidienne",
        icon: Calendar,
        path: "/reports/daily"
      },
      {
        label: "Mensuelle",
        icon: Calendar,
        path: "/reports/monthly"
      },
      {
        label: "Annuelle",
        icon: Calendar,
        path: "/reports/yearly"
      },
      {
        label: "Date à Date",
        icon: CalendarRange,
        path: "/reports/custom"
      },
      {
        label: "Clients",
        icon: Users,
        path: "/reports/clients"
      },
      {
        label: "Factures Impayées",
        icon: BanknoteIcon,
        path: "/reports/unpaid"
      }
    ]
  },
  {
    label: "Achat",
    icon: ClipboardList,
    submenu: [
      {
        label: "Bon de commande",
        icon: FileText,
        path: "/purchase-orders"
      },
      {
        label: "Bon de livraison",
        icon: Truck,
        path: "/delivery-note"
      },
      {
        label: "Facture d'achat",
        icon: FileOutput,
        path: "/purchase-invoice"
      },
      {
        label: "Retours fournisseurs",
        icon: PackageX,
        path: "/supplier-returns"
      }
    ]
  },
  {
    label: "Vente & Facturation",
    icon: CreditCard,
    submenu: [
      {
        label: "Vente au Comptoir",
        icon: Store,
        path: "/pos"
      },
      {
        label: "Factures de vente",
        icon: Receipt,
        path: "/sales-invoices"
      },
      {
        label: "Précommande",
        icon: PackagePlus,
        path: "/preorders"
      },
      {
        label: "Factures de Précommande",
        icon: FileCheck,
        path: "/preorder-invoices"
      },
      {
        label: "Versement",
        icon: BanknoteIcon,
        path: "/payments"
      },
      {
        label: "Devis",
        icon: FileEdit,
        path: "/quotes"
      },
      {
        label: "Retours clients",
        icon: PackageX,
        path: "/customer-returns"
      }
    ]
  },
  {
    label: "Comptabilité",
    icon: PiggyBank,
    submenu: [
      {
        label: "Caisses",
        icon: Wallet,
        path: "/cash-registers"
      },
      {
        label: "Comptes Bancaires",
        icon: Building2,
        path: "/bank-accounts"
      },
      {
        label: "Dépenses",
        icon: Receipt,
        path: "/expenses"
      }
    ]
  }
];
