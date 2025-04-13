
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
} from "lucide-react"

export type MenuItem = {
  label: string
  href: string
  icon: React.ComponentType
  submenu?: MenuItem[]
}

export const menuItems: MenuItem[] = [
  {
    label: 'Tableau de bord',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    label: 'Points de vente',
    href: '/pos',
    icon: ShoppingCart,
    submenu: [
      {
        label: 'Point de vente',
        href: '/pos',
        icon: ShoppingCart,
      },
      {
        label: 'Ventes',
        href: '/sales',
        icon: TrendingUp,
      },
      {
        label: 'Factures',
        href: '/sales-invoices',
        icon: ReceiptText,
      },
      {
        label: 'Précommandes',
        href: '/preorders',
        icon: DollarSign,
      },
      {
        label: 'Factures de précommande',
        href: '/preorder-invoices',
        icon: FileText,
      },
      {
        label: 'Points de vente',
        href: '/pos-locations',
        icon: Building,
      }
    ]
  },
  {
    label: 'Achats',
    href: '/purchase',
    icon: BadgeDollarSign,
    submenu: [
      {
        label: 'Commandes',
        href: '/purchase-order',
        icon: BadgeDollarSign,
      },
      {
        label: 'Bons de livraison',
        href: '/delivery-note',
        icon: Truck,
      },
      {
        label: 'Factures d\'achat',
        href: '/purchase-invoice',
        icon: FileText,
      }
    ]
  },
  {
    label: 'Stock',
    href: '/stocks',
    icon: Package,
    submenu: [
      {
        label: 'Vue d\'ensemble',
        href: '/stocks',
        icon: Package,
      },
      {
        label: 'Stock épuisé',
        href: '/stocks/out-of-stock',
        icon: PackageX,
      },
      {
        label: 'Stock faible',
        href: '/stocks/low-stock',
        icon: PackageOpen,
      },
      {
        label: 'Entrées de stock',
        href: '/stocks/stock-in',
        icon: PackagePlus,
      },
      {
        label: 'Sorties de stock',
        href: '/stocks/stock-out',
        icon: PackageX,
      },
      {
        label: 'Stock PDV',
        href: '/stocks/pos-stock',
        icon: PackageCheck,
      },
      {
        label: 'Transferts',
        href: '/transfers',
        icon: RefreshCcw,
      },
      {
        label: 'Retours clients',
        href: '/customer-returns',
        icon: RefreshCcw,
      },
      {
        label: 'Retours fournisseurs',
        href: '/supplier-returns',
        icon: RefreshCcw,
      },
      {
        label: 'Entrepôts',
        href: '/warehouses',
        icon: Warehouse,
      },
      {
        label: 'Zones géographiques',
        href: '/stock-location',
        icon: Building2,
      }
    ]
  },
  {
    label: 'Catalogue',
    href: '/catalog',
    icon: Library,
    submenu: [
      {
        label: 'Produits',
        href: '/catalog',
        icon: Library,
      },
      {
        label: 'Unités',
        href: '/product-units',
        icon: Package,
      }
    ]
  },
  {
    label: 'Devis',
    href: '/quotes',
    icon: FileText,
  },
  {
    label: 'Commandes',
    href: '/orders',
    icon: ListChecks,
  },
  {
    label: 'Factures',
    href: '/invoices',
    icon: FileText,
  },
  {
    label: 'Clients',
    href: '/clients',
    icon: Users,
  },
  {
    label: 'Fournisseurs',
    href: '/suppliers',
    icon: Truck,
  },
  {
    label: 'Finances',
    href: '/expenses',
    icon: DollarSign,
    submenu: [
      {
        label: 'Vue d\'ensemble',
        href: '/expenses',
        icon: DollarSign,
      },
      {
        label: 'Recettes',
        href: '/expense-income',
        icon: DollarSign,
      },
      {
        label: 'Dépenses',
        href: '/expense-outcome',
        icon: DollarSign,
      },
      {
        label: 'Paiements',
        href: '/payments',
        icon: CreditCard,
      },
      {
        label: 'Comptes bancaires',
        href: '/bank-accounts',
        icon: Building,
      },
      {
        label: 'Caisses',
        href: '/cash-registers',
        icon: CreditCard,
      }
    ]
  },
  {
    label: 'Rapports',
    href: '/reports/yearly',
    icon: TrendingUp,
    submenu: [
      {
        label: 'Rapport annuel',
        href: '/reports/yearly',
        icon: TrendingUp,
      },
      {
        label: 'Rapport mensuel',
        href: '/reports/monthly',
        icon: TrendingUp,
      },
      {
        label: 'Rapport journalier',
        href: '/reports/daily',
        icon: TrendingUp,
      },
      {
        label: 'Rapport clients',
        href: '/reports/clients',
        icon: TrendingUp,
      },
      {
        label: 'Factures impayées',
        href: '/reports/unpaid',
        icon: TrendingUp,
      },
      {
        label: 'Rapport personnalisé',
        href: '/reports/custom',
        icon: TrendingUp,
      }
    ]
  },
  {
    label: 'Personnel',
    href: '/users',
    icon: Users,
  },
  {
    label: 'Home',
    href: '/',
    icon: Home,
  }
]
