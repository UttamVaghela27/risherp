
package com.risherp.config;
import com.risherp.entity.Business;
import com.risherp.entity.Permission;
import com.risherp.entity.Role;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.PermissionRepository;
import com.risherp.repository.RoleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

/**
 * PermissionSeeder — Phase 17
 * Seeds all system permissions and default roles on application startup.
 * This runs after Spring Boot context is ready.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class PermissionSeeder implements CommandLineRunner {

    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final BusinessRepository businessRepository;
    private final JdbcTemplate jdbcTemplate;

    /** Full permission catalog for RISHERP */
    private static final List<Object[]> PERMISSION_CATALOG = List.of(
        // {code, name, module, description}
        new Object[]{"DASHBOARD_VIEW", "View Dashboard", "DASHBOARD", "Access the dashboard overview"},
        new Object[]{"PARTY_VIEW", "View Parties", "PARTY", "View party/contact list"},
        new Object[]{"PARTY_CREATE", "Create Party", "PARTY", "Add new customers or suppliers"},
        new Object[]{"PARTY_UPDATE", "Update Party", "PARTY", "Edit existing party details"},
        new Object[]{"PARTY_DELETE", "Delete Party", "PARTY", "Remove a party record"},
        new Object[]{"PARTY_STATUS_UPDATE", "Update Party Status", "PARTY", "Activate or deactivate parties"},
        new Object[]{"ITEM_VIEW", "View Items", "ITEM", "Browse item/product list"},
        new Object[]{"ITEM_CREATE", "Create Item", "ITEM", "Add new products or services"},
        new Object[]{"ITEM_UPDATE", "Update Item", "ITEM", "Edit item details and pricing"},
        new Object[]{"ITEM_DELETE", "Delete Item", "ITEM", "Remove an item record"},
        new Object[]{"ITEM_STATUS_UPDATE", "Update Item Status", "ITEM", "Activate or deactivate items"},
        new Object[]{"CATEGORY_VIEW", "View Categories", "ITEM", "Browse item categories"},
        new Object[]{"CATEGORY_CREATE", "Create Category", "ITEM", "Add new item categories"},
        new Object[]{"CATEGORY_UPDATE", "Update Category", "ITEM", "Edit category details"},
        new Object[]{"CATEGORY_DELETE", "Delete Category", "ITEM", "Remove a category"},
        new Object[]{"STOCK_VIEW", "View Stock", "STOCK", "View current stock levels and inventory"},
        new Object[]{"STOCK_ADJUST", "Adjust Stock", "STOCK", "Make stock adjustments"},
        new Object[]{"STOCK_HISTORY", "View Stock History", "STOCK", "View stock transaction history"},
        new Object[]{"STOCK_VALUATION", "View Stock Valuation", "STOCK", "View stock valuation reports"},
        new Object[]{"SALES_VIEW", "View Sales", "SALES", "View sales invoices and history"},
        new Object[]{"SALES_CREATE", "Create Sale", "SALES", "Create new sales invoices"},
        new Object[]{"SALE_CREATE", "Create Sale (alias)", "SALES", "Create new sales invoices (legacy code)"},
        new Object[]{"SALES_UPDATE", "Update Sale", "SALES", "Edit draft sales invoices"},
        new Object[]{"SALES_PRINT", "Print Sale Invoice", "SALES", "Print or download sale invoices"},
        new Object[]{"SALES_CANCEL", "Cancel Sale", "SALES", "Cancel a sale invoice"},
        new Object[]{"SALES_RETURN_VIEW", "View Sales Returns", "SALES_RETURN", "View credit notes and returns"},
        new Object[]{"SALES_RETURN_CREATE", "Create Sales Return", "SALES_RETURN", "Process customer returns"},
        new Object[]{"SALES_RETURN_PRINT", "Print Sales Return", "SALES_RETURN", "Print sales return documents"},
        new Object[]{"SALES_RETURN_CANCEL", "Cancel Sales Return", "SALES_RETURN", "Cancel a sales return"},
        new Object[]{"PURCHASE_VIEW", "View Purchases", "PURCHASE", "View purchase bills and history"},
        new Object[]{"PURCHASE_CREATE", "Create Purchase", "PURCHASE", "Create new purchase bills"},
        new Object[]{"PURCHASE_UPDATE", "Update Purchase", "PURCHASE", "Edit purchase bills"},
        new Object[]{"PURCHASE_PRINT", "Print Purchase Bill", "PURCHASE", "Print or download purchase bills"},
        new Object[]{"PURCHASE_CANCEL", "Cancel Purchase", "PURCHASE", "Cancel a purchase bill"},
        new Object[]{"PURCHASE_RETURN_VIEW", "View Purchase Returns", "PURCHASE_RETURN", "View debit notes and returns"},
        new Object[]{"PURCHASE_RETURN_CREATE", "Create Purchase Return", "PURCHASE_RETURN", "Process supplier returns"},
        new Object[]{"PURCHASE_RETURN_PRINT", "Print Purchase Return", "PURCHASE_RETURN", "Print purchase return documents"},
        new Object[]{"PURCHASE_RETURN_CANCEL", "Cancel Purchase Return", "PURCHASE_RETURN", "Cancel a purchase return"},
        new Object[]{"PAYMENT_VIEW", "View Payments", "PAYMENT", "View payment vouchers and history"},
        new Object[]{"PAYMENT_CREATE", "Create Payment", "PAYMENT", "Create payment vouchers to suppliers"},
        new Object[]{"PAYMENT_PRINT", "Print Payment Voucher", "PAYMENT", "Print payment documents"},
        new Object[]{"PAYMENT_CANCEL", "Cancel Payment", "PAYMENT", "Cancel a payment voucher"},
        new Object[]{"RECEIPT_VIEW", "View Receipts", "RECEIPT", "View receipts from customers"},
        new Object[]{"RECEIPT_CREATE", "Create Receipt", "RECEIPT", "Record customer payments/receipts"},
        new Object[]{"RECEIPT_PRINT", "Print Receipt", "RECEIPT", "Print receipt documents"},
        new Object[]{"RECEIPT_CANCEL", "Cancel Receipt", "RECEIPT", "Cancel a receipt"},
        new Object[]{"LEDGER_VIEW", "View Ledger", "LEDGER", "View financial ledger"},
        new Object[]{"LEDGER_CUSTOMER_VIEW", "View Customer Ledger", "LEDGER", "View individual customer ledger"},
        new Object[]{"LEDGER_SUPPLIER_VIEW", "View Supplier Ledger", "LEDGER", "View individual supplier ledger"},
        new Object[]{"OUTSTANDING_VIEW", "View Outstanding", "OUTSTANDING", "View outstanding balances overview"},
        new Object[]{"OUTSTANDING_CUSTOMER_VIEW", "View Customer Outstanding", "OUTSTANDING", "View customer receivables"},
        new Object[]{"OUTSTANDING_SUPPLIER_VIEW", "View Supplier Outstanding", "OUTSTANDING", "View supplier payables"},
        new Object[]{"REPORT_VIEW", "View Reports", "REPORTS", "Access the reporting module"},
        new Object[]{"SALES_REPORT_VIEW", "View Sales Report", "REPORTS", "View sales analysis reports"},
        new Object[]{"PURCHASE_REPORT_VIEW", "View Purchase Report", "REPORTS", "View purchase analysis reports"},
        new Object[]{"STOCK_REPORT_VIEW", "View Stock Report", "REPORTS", "View stock and inventory reports"},
        new Object[]{"PROFIT_REPORT_VIEW", "View Profit Report", "REPORTS", "View profit and margin reports"},
        new Object[]{"OUTSTANDING_REPORT_VIEW", "View Outstanding Report", "REPORTS", "View outstanding balance reports"},
        new Object[]{"RECEIPT_REPORT_VIEW", "View Receipt Report", "REPORTS", "View receipt collection reports"},
        new Object[]{"PAYMENT_REPORT_VIEW", "View Payment Report", "REPORTS", "View payment disbursement reports"},
        new Object[]{"SALES_RETURN_REPORT_VIEW", "View Sales Return Report", "REPORTS", "View sales return reports"},
        new Object[]{"PURCHASE_RETURN_REPORT_VIEW", "View Purchase Return Report", "REPORTS", "View purchase return reports"},
        new Object[]{"REPORT_PRINT", "Print Reports", "REPORTS", "Print report pages"},
        new Object[]{"REPORT_EXPORT", "Export Reports", "REPORTS", "Export reports to CSV"},
        new Object[]{"REPORT_PDF", "Download Report PDF", "REPORTS", "Download reports as PDF"},
        new Object[]{"USER_VIEW", "View Users", "USERS", "View the user management list"},
        new Object[]{"USER_CREATE", "Create User", "USERS", "Create new user accounts"},
        new Object[]{"USER_UPDATE", "Update User", "USERS", "Edit user details and roles"},
        new Object[]{"USER_STATUS_UPDATE", "Activate/Deactivate User", "USERS", "Change user active status"},
        new Object[]{"ROLE_VIEW", "View Roles", "ROLES", "View roles and permission assignments"},
        new Object[]{"ROLE_CREATE", "Create Role", "ROLES", "Create new roles"},
        new Object[]{"ROLE_UPDATE", "Update Role", "ROLES", "Edit role details"},
        new Object[]{"ROLE_STATUS_UPDATE", "Activate/Deactivate Role", "ROLES", "Change role active status"},
        new Object[]{"ROLE_PERMISSION_UPDATE", "Manage Role Permissions", "ROLES", "Assign permissions to roles"},
        // PHASE 18 ADMINISTRATION & SETTINGS
        new Object[]{"SETTINGS_VIEW", "View Settings", "SETTINGS", "Access settings hub and configurations"},
        new Object[]{"SETTING_VIEW", "View Settings (alias)", "SETTINGS", "Access settings hub (navigation alias)"},
        new Object[]{"SETTINGS_UPDATE", "Update Settings", "SETTINGS", "Modify system-wide configurations"},
        new Object[]{"BUSINESS_SETTINGS_VIEW", "View Business Profile", "SETTINGS", "View business profile settings"},
        new Object[]{"BUSINESS_SETTINGS_UPDATE", "Update Business Profile", "SETTINGS", "Edit business details and upload logo"},
        new Object[]{"INVOICE_SETTINGS_VIEW", "View Invoice Settings", "SETTINGS", "View invoice header and terms settings"},
        new Object[]{"INVOICE_SETTINGS_UPDATE", "Update Invoice Settings", "SETTINGS", "Edit invoice template and terms"},
        new Object[]{"NUMBERING_SETTINGS_VIEW", "View Numbering Settings", "SETTINGS", "View document numbering sequences"},
        new Object[]{"NUMBERING_SETTINGS_UPDATE", "Update Numbering Settings", "SETTINGS", "Configure document prefixes and numbering sequences"},
        new Object[]{"BACKUP_VIEW", "View Backups", "BACKUP", "View database backup history and download dumps"},
        new Object[]{"BACKUP_CREATE", "Create Backup", "BACKUP", "Initiate manual database backups"},
        new Object[]{"BACKUP_RESTORE", "Restore Backup", "BACKUP", "Restore ERP database from existing backup"},
        new Object[]{"AUDIT_LOG_VIEW", "View Audit Logs", "AUDIT_LOGS", "View security audit trails and system activity logs"},
        new Object[]{"AUDIT_VIEW", "View Audit Logs (alias)", "AUDIT_LOGS", "View audit trails (navigation alias)"}
    );

    /** Permissions assigned to each default role */
    private static final Map<String, List<String>> DEFAULT_ROLE_PERMISSIONS = Map.of(
        "ADMIN", getAllPermissionCodes(),
        "MANAGER", List.of(
            // Dashboard & Party
            "DASHBOARD_VIEW",
            "PARTY_VIEW","PARTY_CREATE","PARTY_UPDATE","PARTY_STATUS_UPDATE",
            // Items & Categories
            "ITEM_VIEW","ITEM_CREATE","ITEM_UPDATE","ITEM_STATUS_UPDATE",
            "CATEGORY_VIEW","CATEGORY_CREATE","CATEGORY_UPDATE",
            // Stock Operations & Valuation
            "STOCK_VIEW","STOCK_ADJUST","STOCK_HISTORY","STOCK_VALUATION",
            // Sales & Returns (View, Create, Update, Print, Cancel)
            "SALES_VIEW","SALES_CREATE","SALE_CREATE","SALES_UPDATE","SALES_PRINT","SALES_CANCEL",
            "SALES_RETURN_VIEW","SALES_RETURN_CREATE","SALES_RETURN_PRINT","SALES_RETURN_CANCEL",
            // Purchase & Returns (View, Create, Update, Print, Cancel)
            "PURCHASE_VIEW","PURCHASE_CREATE","PURCHASE_UPDATE","PURCHASE_PRINT","PURCHASE_CANCEL",
            "PURCHASE_RETURN_VIEW","PURCHASE_RETURN_CREATE","PURCHASE_RETURN_PRINT","PURCHASE_RETURN_CANCEL",
            // Payment & Receipt
            "PAYMENT_VIEW","PAYMENT_CREATE","PAYMENT_PRINT","PAYMENT_CANCEL",
            "RECEIPT_VIEW","RECEIPT_CREATE","RECEIPT_PRINT","RECEIPT_CANCEL",
            // Ledger & Outstanding Balances
            "LEDGER_VIEW","LEDGER_CUSTOMER_VIEW","LEDGER_SUPPLIER_VIEW",
            "OUTSTANDING_VIEW","OUTSTANDING_CUSTOMER_VIEW","OUTSTANDING_SUPPLIER_VIEW",
            // Reports (Excluding confidential profit margins)
            "REPORT_VIEW","SALES_REPORT_VIEW","PURCHASE_REPORT_VIEW","STOCK_REPORT_VIEW",
            "OUTSTANDING_REPORT_VIEW","RECEIPT_REPORT_VIEW","PAYMENT_REPORT_VIEW",
            "SALES_RETURN_REPORT_VIEW","PURCHASE_RETURN_REPORT_VIEW",
            "REPORT_PRINT","REPORT_EXPORT","REPORT_PDF"
        ),
        "STAFF", List.of(
            // Dashboard & View Masters
            "DASHBOARD_VIEW",
            "PARTY_VIEW",
            "ITEM_VIEW","CATEGORY_VIEW",
            "STOCK_VIEW","STOCK_HISTORY",
            // Sales & Invoicing (Create & Print only - No Cancel / No Delete)
            "SALES_VIEW","SALES_CREATE","SALE_CREATE","SALES_PRINT",
            "SALES_RETURN_VIEW","SALES_RETURN_CREATE","SALES_RETURN_PRINT",
            // Purchase Entry (Create & Print only - No Cancel)
            "PURCHASE_VIEW","PURCHASE_CREATE","PURCHASE_PRINT",
            "PURCHASE_RETURN_VIEW","PURCHASE_RETURN_CREATE","PURCHASE_RETURN_PRINT",
            // Payment & Receipt Entry (Create & Print only - No Cancel)
            "PAYMENT_VIEW","PAYMENT_CREATE","PAYMENT_PRINT",
            "RECEIPT_VIEW","RECEIPT_CREATE","RECEIPT_PRINT",
            // Customer/Supplier Ledger Check
            "LEDGER_VIEW","LEDGER_CUSTOMER_VIEW","LEDGER_SUPPLIER_VIEW",
            "OUTSTANDING_VIEW","OUTSTANDING_CUSTOMER_VIEW","OUTSTANDING_SUPPLIER_VIEW"
        )
    );

    private static List<String> getAllPermissionCodes() {
        return PERMISSION_CATALOG.stream()
                .map(arr -> (String) arr[0])
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("Phase 17: Seeding permissions and roles...");

        // 0. Clean up legacy MySQL unique constraint on roles(name) if exists
        cleanupLegacyRoleConstraints();

        // 1. Seed global permissions (no business scope)
        Map<String, Permission> permissionMap = seedPermissions();

        // 2. Seed roles per business
        List<Business> businesses = businessRepository.findAll();
        for (Business business : businesses) {
            seedRolesForBusiness(business, permissionMap);
        }

        log.info("Phase 17: Permission seeding completed. Total permissions: {}", permissionMap.size());
    }

    private void cleanupLegacyRoleConstraints() {
        try {
            List<String> constraintNames = jdbcTemplate.query(
                "SELECT CONSTRAINT_NAME FROM information_schema.TABLE_CONSTRAINTS " +
                "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'roles' AND CONSTRAINT_TYPE = 'UNIQUE' AND CONSTRAINT_NAME != 'ux_role_name_business'",
                (rs, rowNum) -> rs.getString("CONSTRAINT_NAME")
            );
            for (String idx : constraintNames) {
                try {
                    jdbcTemplate.execute("ALTER TABLE roles DROP INDEX " + idx);
                    log.info("Dropped legacy index {} on roles table", idx);
                } catch (Exception e) {
                    log.warn("Could not drop index {}: {}", idx, e.getMessage());
                }
            }
        } catch (Exception e) {
            log.warn("Error checking legacy constraints on roles table: {}", e.getMessage());
        }
    }

    private Map<String, Permission> seedPermissions() {
        Map<String, Permission> map = permissionRepository.findAll().stream()
                .collect(Collectors.toMap(Permission::getPermissionCode, p -> p, (a, b) -> a, HashMap::new));

        List<Permission> toInsert = new ArrayList<>();
        for (Object[] entry : PERMISSION_CATALOG) {
            String code = (String) entry[0];
            if (!map.containsKey(code)) {
                Permission p = Permission.builder()
                        .permissionCode(code)
                        .permissionName((String) entry[1])
                        .module((String) entry[2])
                        .description((String) entry[3])
                        .build();
                toInsert.add(p);
            }
        }

        if (!toInsert.isEmpty()) {
            List<Permission> saved = permissionRepository.saveAll(toInsert);
            for (Permission p : saved) {
                map.put(p.getPermissionCode(), p);
            }
            log.info("Seeded {} new permissions.", toInsert.size());
        }

        return map;
    }

    private void seedRolesForBusiness(Business business, Map<String, Permission> permissionMap) {
        String[] roleNames = {"ADMIN", "MANAGER", "STAFF"};
        String[] roleDescs = {
            "System Administrator with full access",
            "Store / Branch Manager with operations access",
            "Billing and standard operations staff"
        };

        for (int i = 0; i < roleNames.length; i++) {
            String roleName = roleNames[i];
            String roleDesc = roleDescs[i];

            boolean isNew = false;
            // Find existing role for this business
            Optional<Role> existing = roleRepository.findFirstByNameAndBusinessId(roleName, business.getId());
            Role role;
            if (existing.isPresent()) {
                role = existing.get();
            } else {
                // Check if there is an unassigned global role without business_id
                Optional<Role> unassigned = roleRepository.findFirstByNameAndBusinessIsNull(roleName);
                if (unassigned.isPresent()) {
                    role = unassigned.get();
                    role.setBusiness(business);
                    isNew = true;
                } else {
                    role = Role.builder()
                            .business(business)
                            .name(roleName)
                            .description(roleDesc)
                            .status("ACTIVE")
                            .build();
                    isNew = true;
                }
            }

            boolean needsSave = isNew;
            if (!"ACTIVE".equals(role.getStatus())) {
                role.setStatus("ACTIVE");
                needsSave = true;
            }
            if (role.getDescription() == null) {
                role.setDescription(roleDesc);
                needsSave = true;
            }

            boolean permissionsUpdated = assignPermissionsToRole(role, roleName, permissionMap);
            if (needsSave || permissionsUpdated) {
                roleRepository.save(role);
                log.info("Configured/Updated role {} for business {}", roleName, business.getId());
            }
        }
    }

    private boolean assignPermissionsToRole(Role role, String roleName, Map<String, Permission> permissionMap) {
        List<String> requiredCodes = DEFAULT_ROLE_PERMISSIONS.getOrDefault(roleName, Collections.emptyList());
        Set<String> currentCodes = role.getPermissions() != null
                ? role.getPermissions().stream()
                        .map(Permission::getPermissionCode)
                        .collect(Collectors.toSet())
                : Collections.emptySet();

        // If role already has exactly all the required permissions, no re-insert needed
        if (currentCodes.size() == requiredCodes.size() && currentCodes.containsAll(requiredCodes)) {
            return false;
        }

        Set<Permission> perms = requiredCodes.stream()
                .filter(permissionMap::containsKey)
                .map(permissionMap::get)
                .collect(Collectors.toSet());
        role.setPermissions(perms);
        return true;
    }
}
