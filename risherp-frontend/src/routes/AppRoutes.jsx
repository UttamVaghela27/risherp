import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import Dashboard from '../pages/Dashboard';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Unauthorized from '../pages/Unauthorized';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

// Party Master Pages (Phase 5)
import PartyList from '../pages/party/PartyList';
import PartyCreate from '../pages/party/PartyCreate';
import PartyView from '../pages/party/PartyView';
import PartyEdit from '../pages/party/PartyEdit';
import Customers from '../pages/party/Customers';
import Suppliers from '../pages/party/Suppliers';

// Item Master & Inventory Foundation Pages (Phase 6)
import Items from '../pages/items/Items';
import CreateItem from '../pages/items/CreateItem';
import ItemDetailsPage from '../pages/items/ItemDetails';
import EditItem from '../pages/items/EditItem';
import Categories from '../pages/categories/Categories';
import StockManagement from '../pages/inventory/StockManagement';

// Sales & Billing Pages (Phase 7 & 8)
import Sales from '../pages/sales/Sales';
import CreateSale from '../pages/sales/CreateSale';
import SaleDetails from '../pages/sales/SaleDetails';

// Purchase Pages (Phase 9 & 10)
import PurchaseHistory from '../pages/purchase/PurchaseHistory';
import PurchaseEntry from '../pages/purchase/PurchaseEntry';
import PurchaseDetails from '../pages/purchase/PurchaseDetails';

// Sales Return Pages (Phase 12)
import SalesReturnHistory from '../pages/salesReturn/SalesReturnHistory';
import SalesReturnCreate from '../pages/salesReturn/SalesReturnCreate';
import SalesReturnDetails from '../pages/salesReturn/SalesReturnDetails';

// Purchase Return Pages (Phase 13)
import PurchaseReturnHistory from '../pages/purchaseReturn/PurchaseReturnHistory';
import PurchaseReturnCreate from '../pages/purchaseReturn/PurchaseReturnCreate';
import PurchaseReturnDetails from '../pages/purchaseReturn/PurchaseReturnDetails';

// Payments & Receipts Pages (Phase 14)
import ReceiptHistory from '../pages/receipts/ReceiptHistory';
import ReceiptCreate from '../pages/receipts/ReceiptCreate';
import ReceiptDetails from '../pages/receipts/ReceiptDetails';
import PaymentHistory from '../pages/payments/PaymentHistory';
import PaymentCreate from '../pages/payments/PaymentCreate';
import PaymentDetails from '../pages/payments/PaymentDetails';

// Ledger & Outstanding Pages (Phase 15)
import LedgerPage from '../pages/ledger/LedgerPage';
import PartyLedgerView from '../pages/ledger/PartyLedgerView';
import OutstandingPage from '../pages/outstanding/OutstandingPage';
import CustomerOutstanding from '../pages/outstanding/CustomerOutstanding';
import SupplierOutstanding from '../pages/outstanding/SupplierOutstanding';

// Reports Pages (Phase 16)
import ReportsHub from '../pages/reports/ReportsHub';
import SalesReport from '../pages/reports/SalesReport';
import PurchaseReport from '../pages/reports/PurchaseReport';
import StockReport from '../pages/reports/StockReport';
import ProfitReport from '../pages/reports/ProfitReport';
import OutstandingReport from '../pages/reports/OutstandingReport';
import ReceiptReport from '../pages/reports/ReceiptReport';
import PaymentReport from '../pages/reports/PaymentReport';
import SalesReturnReport from '../pages/reports/SalesReturnReport';
import PurchaseReturnReport from '../pages/reports/PurchaseReturnReport';

// Users, Roles & Permissions Pages (Phase 17)
import UsersPage from '../pages/users/UsersPage';
import RolesPage from '../pages/roles/RolesPage';
import PermissionsPage from '../pages/permissions/PermissionsPage';
import ProfilePage from '../pages/profile/ProfilePage';

// Administration: Settings, Audit Logs & Backup (Phase 18)
import SettingsPage from '../pages/settings/SettingsPage';
import AuditLogsPage from '../pages/audit/AuditLogsPage';
import ScrollToTop from '../components/common/ScrollToTop';

/**
 * Application Routes
 * Configures all navigation endpoints inside the professional AppLayout shell.
 */
const AppRoutes = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public standalone pages */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected ERP Application Routes */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />

          {/* BUSINESS - Phase 5 Party Master */}
          <Route path="/parties" element={<PartyList />} />
          <Route path="/parties/new" element={<PartyCreate />} />
          <Route path="/parties/:id" element={<PartyView />} />
          <Route path="/parties/:id/edit" element={<PartyEdit />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />

          {/* INVENTORY - Phase 6 Item Master & Inventory Foundation */}
          <Route path="/items" element={<Items />} />
          <Route path="/items/new" element={<CreateItem />} />
          <Route path="/items/:id" element={<ItemDetailsPage />} />
          <Route path="/items/:id/edit" element={<EditItem />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/stock" element={<StockManagement />} />

          {/* TRANSACTIONS — Phase 7: Sales & Billing */}
          <Route path="/sales" element={<Sales />} />
          <Route path="/sales/history" element={<Sales />} />
          <Route path="/sales/new" element={<CreateSale />} />
          {/* Phase 12: Sales Return — must come before /sales/:id to avoid routing collision */}
          <Route path="/sales/returns" element={<SalesReturnHistory />} />
          <Route path="/sales/returns/new" element={<SalesReturnCreate />} />
          <Route path="/sales/returns/:id" element={<SalesReturnDetails />} />
          {/* Redirect old /sales/return → /sales/returns */}
          <Route path="/sales/return" element={<Navigate to="/sales/returns" replace />} />
          <Route path="/sales/:id" element={<SaleDetails />} />
          {/* PURCHASES — Phase 9: Purchase Entry & Phase 10: Purchase History */}
          <Route path="/purchases" element={<PurchaseHistory />} />
          <Route path="/purchases/history" element={<PurchaseHistory />} />
          <Route path="/purchases/new" element={<PurchaseEntry />} />
          <Route path="/purchase/new" element={<PurchaseEntry />} />
          {/* Phase 13: Purchase Return — must come before /purchases/:id to avoid route collision */}
          <Route path="/purchases/returns" element={<PurchaseReturnHistory />} />
          <Route path="/purchases/returns/new" element={<PurchaseReturnCreate />} />
          <Route path="/purchases/returns/:id" element={<PurchaseReturnDetails />} />
          {/* Redirect old /purchases/return → /purchases/returns */}
          <Route path="/purchases/return" element={<Navigate to="/purchases/returns" replace />} />
          <Route path="/purchases/:id" element={<PurchaseDetails />} />
          <Route path="/purchase/:id" element={<PurchaseDetails />} />

          {/* ACCOUNTS — Phase 14: Payments & Receipts, Phase 15: Ledger & Outstanding */}
          <Route path="/payments" element={<PaymentHistory />} />
          <Route path="/payments/new" element={<PaymentCreate />} />
          <Route path="/payments/:id" element={<PaymentDetails />} />

          <Route path="/receipts" element={<ReceiptHistory />} />
          <Route path="/receipts/new" element={<ReceiptCreate />} />
          <Route path="/receipts/:id" element={<ReceiptDetails />} />

          <Route path="/ledger" element={<LedgerPage />} />
          <Route path="/ledger/customers" element={<LedgerPage />} />
          <Route path="/ledger/suppliers" element={<LedgerPage />} />
          <Route path="/ledger/customer/:partyId" element={<PartyLedgerView />} />
          <Route path="/ledger/supplier/:partyId" element={<PartyLedgerView />} />
          <Route path="/ledger/party/:partyId" element={<PartyLedgerView />} />

          <Route path="/outstanding" element={<OutstandingPage />} />
          <Route path="/outstanding/customers" element={<OutstandingPage />} />
          <Route path="/outstanding/suppliers" element={<OutstandingPage />} />

          {/* REPORTS — Phase 16 */}
          <Route path="/reports" element={<ReportsHub />} />
          <Route path="/reports/sales" element={<SalesReport />} />
          <Route path="/reports/purchases" element={<PurchaseReport />} />
          <Route path="/reports/purchase" element={<Navigate to="/reports/purchases" replace />} />
          <Route path="/reports/stock" element={<StockReport />} />
          <Route path="/reports/profit" element={<ProfitReport />} />
          <Route path="/reports/outstanding" element={<OutstandingReport />} />
          <Route path="/reports/outstanding/customers" element={<OutstandingReport />} />
          <Route path="/reports/outstanding/suppliers" element={<OutstandingReport />} />
          <Route path="/reports/receipts" element={<ReceiptReport />} />
          <Route path="/reports/payments" element={<PaymentReport />} />
          <Route path="/reports/sales-returns" element={<SalesReturnReport />} />
          <Route path="/reports/purchase-returns" element={<PurchaseReturnReport />} />

          {/* ADMINISTRATION — Phase 17: RBAC (Users, Roles & Permissions) */}
          <Route
            path="/users"
            element={
              <ProtectedRoute requiredPermission="USER_VIEW">
                <UsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/roles"
            element={
              <ProtectedRoute requiredPermission="ROLE_VIEW">
                <RolesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/permissions"
            element={
              <ProtectedRoute requiredPermission="ROLE_VIEW">
                <PermissionsPage />
              </ProtectedRoute>
            }
          />
          <Route path="/profile" element={<ProfilePage />} />
          {/* ADMINISTRATION — Phase 18: Audit Logs & Settings */}
          <Route
            path="/audit-logs"
            element={
              <ProtectedRoute requiredPermission="AUDIT_LOG_VIEW">
                <AuditLogsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute requiredPermission="SETTINGS_VIEW">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings/*"
            element={
              <ProtectedRoute requiredPermission="SETTINGS_VIEW">
                <SettingsPage />
              </ProtectedRoute>
            }
          />
        </Route>

        {/* 404 Not Found */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
