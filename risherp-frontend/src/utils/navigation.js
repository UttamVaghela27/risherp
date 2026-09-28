import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import WarehouseOutlinedIcon from '@mui/icons-material/WarehouseOutlined';
import PointOfSaleOutlinedIcon from '@mui/icons-material/PointOfSaleOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import AssignmentReturnOutlinedIcon from '@mui/icons-material/AssignmentReturnOutlined';
import ShoppingCartOutlinedIcon from '@mui/icons-material/ShoppingCartOutlined';
import HistoryEduOutlinedIcon from '@mui/icons-material/HistoryEduOutlined';
import UndoOutlinedIcon from '@mui/icons-material/UndoOutlined';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined';
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined';
import PendingActionsOutlinedIcon from '@mui/icons-material/PendingActionsOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import InsightsOutlinedIcon from '@mui/icons-material/InsightsOutlined';
import InventoryOutlinedIcon from '@mui/icons-material/InventoryOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import RequestQuoteOutlinedIcon from '@mui/icons-material/RequestQuoteOutlined';
import ManageAccountsOutlinedIcon from '@mui/icons-material/ManageAccountsOutlined';
import AdminPanelSettingsOutlinedIcon from '@mui/icons-material/AdminPanelSettingsOutlined';
import DvrOutlinedIcon from '@mui/icons-material/DvrOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';

/**
 * RISHERP Central Navigation Configuration
 * Defines sections, menu items, routes, icons, and future permission tags.
 */
export const navigationSections = [
  {
    id: 'core',
    items: [
      {
        id: 'dashboard',
        label: 'Dashboard',
        path: '/dashboard',
        icon: DashboardOutlinedIcon,
        permission: 'DASHBOARD_VIEW',
      },
    ],
  },
  {
    id: 'business',
    section: 'BUSINESS',
    items: [
      {
        id: 'parties',
        label: 'Parties',
        path: '/parties',
        icon: PeopleOutlinedIcon,
        permission: 'PARTY_VIEW',
      },
      {
        id: 'customers',
        label: 'Customers',
        path: '/customers',
        icon: PersonOutlinedIcon,
        permission: 'CUSTOMER_VIEW',
      },
      {
        id: 'suppliers',
        label: 'Suppliers',
        path: '/suppliers',
        icon: BusinessOutlinedIcon,
        permission: 'SUPPLIER_VIEW',
      },
    ],
  },
  {
    id: 'inventory',
    section: 'INVENTORY',
    items: [
      {
        id: 'items',
        label: 'Items',
        path: '/items',
        icon: Inventory2OutlinedIcon,
        permission: 'ITEM_VIEW',
      },
      {
        id: 'categories',
        label: 'Categories',
        path: '/categories',
        icon: CategoryOutlinedIcon,
        permission: 'CATEGORY_VIEW',
      },
      {
        id: 'stock',
        label: 'Stock',
        path: '/stock',
        icon: WarehouseOutlinedIcon,
        permission: 'STOCK_VIEW',
      },
    ],
  },
  {
    id: 'transactions',
    section: 'TRANSACTIONS',
    items: [
      {
        id: 'sales-history',
        label: 'Sales History',
        path: '/sales',
        icon: HistoryOutlinedIcon,
        permission: 'SALES_VIEW',
      },
      {
        id: 'sales-return',
        label: 'Sales Return',
        path: '/sales/returns',
        icon: AssignmentReturnOutlinedIcon,
        permission: 'SALES_RETURN_VIEW',
      },
      {
        id: 'purchase-history',
        label: 'Purchase History',
        path: '/purchases',
        icon: HistoryEduOutlinedIcon,
        permission: 'PURCHASE_VIEW',
      },
      {
        id: 'purchase-return',
        label: 'Purchase Return',
        path: '/purchases/returns',
        icon: UndoOutlinedIcon,
        permission: 'PURCHASE_RETURN_VIEW',
      },
    ],
  },
  {
    id: 'accounts',
    section: 'ACCOUNTS',
    items: [
      {
        id: 'payments',
        label: 'Payments',
        path: '/payments',
        icon: PaymentsOutlinedIcon,
        permission: 'PAYMENT_VIEW',
      },
      {
        id: 'receipts',
        label: 'Receipts',
        path: '/receipts',
        icon: ReceiptLongOutlinedIcon,
        permission: 'RECEIPT_VIEW',
      },
      {
        id: 'ledger',
        label: 'Ledger',
        path: '/ledger',
        icon: AccountBalanceWalletOutlinedIcon,
        permission: 'LEDGER_VIEW',
      },
      {
        id: 'outstanding',
        label: 'Outstanding',
        path: '/outstanding',
        icon: PendingActionsOutlinedIcon,
        permission: 'OUTSTANDING_VIEW',
      },
    ],
  },
  {
    id: 'reports',
    section: 'REPORTS',
    items: [
      {
        id: 'sales-report',
        label: 'Sales Report',
        path: '/reports/sales',
        icon: AssessmentOutlinedIcon,
        permission: 'SALES_REPORT_VIEW',
      },
      {
        id: 'purchase-report',
        label: 'Purchase Report',
        path: '/reports/purchases',
        icon: InsightsOutlinedIcon,
        permission: 'PURCHASE_REPORT_VIEW',
      },
      {
        id: 'stock-report',
        label: 'Stock Report',
        path: '/reports/stock',
        icon: InventoryOutlinedIcon,
        permission: 'STOCK_REPORT_VIEW',
      },
      {
        id: 'profit-report',
        label: 'Profit Report',
        path: '/reports/profit',
        icon: TrendingUpOutlinedIcon,
        permission: 'PROFIT_REPORT_VIEW',
      },
      {
        id: 'outstanding-report',
        label: 'Outstanding Report',
        path: '/reports/outstanding',
        icon: RequestQuoteOutlinedIcon,
        permission: 'OUTSTANDING_REPORT_VIEW',
      },
      {
        id: 'payment-report',
        label: 'Payment Report',
        path: '/reports/payments',
        icon: PaymentsOutlinedIcon,
        permission: 'PAYMENT_REPORT_VIEW',
      },
      {
        id: 'receipt-report',
        label: 'Receipt Report',
        path: '/reports/receipts',
        icon: ReceiptLongOutlinedIcon,
        permission: 'RECEIPT_REPORT_VIEW',
      },
      {
        id: 'sales-return-report',
        label: 'Sales Return Report',
        path: '/reports/sales-returns',
        icon: AssignmentReturnOutlinedIcon,
        permission: 'SALES_RETURN_REPORT_VIEW',
      },
      {
        id: 'purchase-return-report',
        label: 'Purchase Return Report',
        path: '/reports/purchase-returns',
        icon: UndoOutlinedIcon,
        permission: 'PURCHASE_RETURN_REPORT_VIEW',
      },
    ],
  },
  {
    id: 'administration',
    section: 'ADMINISTRATION',
    items: [
      {
        id: 'users',
        label: 'Users',
        path: '/users',
        icon: ManageAccountsOutlinedIcon,
        permission: 'USER_VIEW',
      },
      {
        id: 'roles',
        label: 'Roles & Permissions',
        path: '/roles',
        icon: AdminPanelSettingsOutlinedIcon,
        permission: 'ROLE_VIEW',
      },
      {
        id: 'audit-logs',
        label: 'Audit Logs',
        path: '/audit-logs',
        icon: DvrOutlinedIcon,
        permission: 'AUDIT_LOG_VIEW',
      },
      {
        id: 'settings',
        label: 'Settings',
        path: '/settings',
        icon: SettingsOutlinedIcon,
        permission: 'SETTINGS_VIEW',
      },
    ],
  },
];

/**
 * Helper to get all flat navigation items
 */
export const allNavigationItems = navigationSections.flatMap((sec) => sec.items);

/**
 * Route to readable name mapping for breadcrumbs
 */
export const routeLabelMap = allNavigationItems.reduce((acc, item) => {
  acc[item.path] = item.label;
  return acc;
}, { '/dashboard': 'Dashboard' });

export default navigationSections;
