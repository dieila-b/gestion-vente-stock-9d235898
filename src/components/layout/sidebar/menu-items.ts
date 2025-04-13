
import {
  BadgeDollarSign,
  Building,
  Building2,
  CreditCard,
  DollarSign,
  FileText,
  Home,
  LayoutDashboard,
  Library,
  ListChecks,
  Package,
  PackageCheck,
  PackageOpen,
  PackagePlus,
  PackageX,
  ReceiptText,
  RefreshCcw,
  ShoppingCart,
  TrendingUp,
  Truck,
  Users,
  Warehouse
} from "lucide-react";
import { LucideProps } from "lucide-react";
import React from "react";

export type IconComponent = React.ForwardRefExoticComponent<
  Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>
>;

export type MenuItem = {
  label: string;
  path?: string;
  icon: IconComponent;
  submenu?: MenuItem[];
}

export const menuItems: MenuItem[] = [
  {
    label: 'Tableau de bord',
    path: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Points de vente',
    path: '/pos',
    icon: ShoppingCart,
    submenu: [
      {
        label: 'Point de vente',
        path: '/pos',
        icon: ShoppingCart,
      },
      {
        label: 'Ventes',
        path: '/sales',
        icon: TrendingUp,
      },
      {
        label: 'Factures',
        path: '/sales-invoices',
        icon: ReceiptText,
      },
      {
        label: 'Précommandes',
        path: '/preorders',
        icon: DollarSign,
      },
      {
        label: 'Factures de précommande',
        path: '/preorder-invoices',
        icon: FileText,
      },
      {
        label: 'Points de vente',
        path: '/pos-locations',
        icon: Building,
      }
    ]
  },
  {
    label: 'Achats',
    path: '/purchase',
    icon: BadgeDollarSign,
    submenu: [
      {
        label: 'Commandes',
        path: '/purchase-order',
        icon: BadgeDollarSign,
      },
      {
        label: 'Bons de livraison',
        path: '/delivery-note',
        icon: Truck,
      },
      {
        label: 'Factures d\'achat',
        path: '/purchase-invoice',
        icon: FileText,
      }
    ]
  },
  {
    label: 'Stock',
    path: '/stocks',
    icon: Package,
    submenu: [
      {
        label: 'Vue d\'ensemble',
        path: '/stocks',
        icon: Package,
      },
      {
        label: 'Stock épuisé',
        path: '/stocks/out-of-stock',
        icon: PackageX,
      },
      {
        label: 'Stock faible',
        path: '/stocks/low-stock',
        icon: PackageOpen,
      },
      {
        label: 'Entrées de stock',
        path: '/stocks/stock-in',
        icon: PackagePlus,
      },
      {
        label: 'Sorties de stock',
        path: '/stocks/stock-out',
        icon: PackageX,
      },
      {
        label: 'Stock PDV',
        path: '/stocks/pos-stock',
        icon: PackageCheck,
      },
      {
        label: 'Transferts',
        path: '/transfers',
        icon: RefreshCcw,
      },
      {
        label: 'Retours clients',
        path: '/customer-returns',
        icon: RefreshCcw,
      },
      {
        label: 'Retours fournisseurs',
        path: '/supplier-returns',
        icon: RefreshCcw,
      },
      {
        label: 'Entrepôts',
        path: '/warehouses',
        icon: Warehouse,
      },
      {
        label: 'Zones géographiques',
        path: '/stock-location',
        icon: Building2,
      }
    ]
  },
  {
    label: 'Catalogue',
    path: '/catalog',
    icon: Library,
    submenu: [
      {
        label: 'Produits',
        path: '/catalog',
        icon: Library,
      },
      {
        label: 'Unités',
        path: '/product-units',
        icon: Package,
      }
    ]
  },
  {
    label: 'Devis',
    path: '/quotes',
    icon: FileText,
  },
  {
    label: 'Commandes',
    path: '/orders',
    icon: ListChecks,
  },
  {
    label: 'Factures',
    path: '/invoices',
    icon: FileText,
  },
  {
    label: 'Clients',
    path: '/clients',
    icon: Users,
  },
  {
    label: 'Fournisseurs',
    path: '/suppliers',
    icon: Truck,
  },
  {
    label: 'Finances',
    path: '/expenses',
    icon: DollarSign,
    submenu: [
      {
        label: 'Vue d\'ensemble',
        path: '/expenses',
        icon: DollarSign,
      },
      {
        label: 'Recettes',
        path: '/expense-income',
        icon: DollarSign,
      },
      {
        label: 'Dépenses',
        path: '/expense-outcome',
        icon: DollarSign,
      },
      {
        label: 'Paiements',
        path: '/payments',
        icon: CreditCard,
      },
      {
        label: 'Comptes bancaires',
        path: '/bank-accounts',
        icon: Building,
      },
      {
        label: 'Caisses',
        path: '/cash-registers',
        icon: CreditCard,
      }
    ]
  },
  {
    label: 'Rapports',
    path: '/reports/yearly',
    icon: TrendingUp,
    submenu: [
      {
        label: 'Rapport annuel',
        path: '/reports/yearly',
        icon: TrendingUp,
      },
      {
        label: 'Rapport mensuel',
        path: '/reports/monthly',
        icon: TrendingUp,
      },
      {
        label: 'Rapport journalier',
        path: '/reports/daily',
        icon: TrendingUp,
      },
      {
        label: 'Rapport clients',
        path: '/reports/clients',
        icon: TrendingUp,
      },
      {
        label: 'Factures impayées',
        path: '/reports/unpaid',
        icon: TrendingUp,
      },
      {
        label: 'Rapport personnalisé',
        path: '/reports/custom',
        icon: TrendingUp,
      }
    ]
  },
  {
    label: 'Personnel',
    path: '/users',
    icon: Users,
  },
  {
    label: 'Home',
    path: '/',
    icon: Home,
  }
];
