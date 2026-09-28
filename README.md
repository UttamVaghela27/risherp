# RISHERP — Enterprise ERP & Billing Platform

**RISHERP** is a modern, full-stack, enterprise-grade Enterprise Resource Planning (ERP) and Point-of-Sale (POS) Billing solution tailored for small and medium retail, wholesale, and distribution businesses. Built with high performance, stringent security, strict financial reconciliation, and multi-tenant database partitioning, RISHERP coordinates end-to-end business operations spanning procurement, inventory management, sales invoicing, credit control, double-entry financial ledgers, transactional reporting, audit compliance, and disaster recovery.

---

## 1. System Overview & Architecture

RISHERP is engineered following a clean, decoupled 3-tier client-server architecture:

```
+-----------------------------------------------------------------------+
|                            PRESENTATION LAYER                         |
|   React 18 SPA (Vite) + Material UI v5 + Emotion + Lucide / MUI Icons |
|   - Axios HTTP Client with JWT interceptors & auto-refresh retry      |
|   - Multi-tab business modules & dynamic RBAC permission routing      |
+-----------------------------------------------------------------------+
                                  |  REST API / JSON / PDF Streams
                                  v
+-----------------------------------------------------------------------+
|                            APPLICATION LAYER                          |
|         Java 17 + Spring Boot 3.2.x Enterprise REST Services          |
|   - Stateless Spring Security + HMAC-SHA256 JWT Token Engine          |
|   - Business Partitioning via business_id Tenant Isolation Filters    |
|   - Pessimistic Database Locking for Atomic Monotonic Sequences      |
|   - Spring Data JPA / Hibernate ORM with Second-Level Query Caching   |
|   - iText 8.x Streaming Binary Document Renderer                      |
|   - Spring Boot Actuator Observability & Sanity Health Checkers       |
+-----------------------------------------------------------------------+
                                  |  JPA / JDBC / MySQL Connector
                                  v
+-----------------------------------------------------------------------+
|                              DATA LAYER                               |
|              MySQL 8.0+ Enterprise Relational Database                |
|   - InnoDB Transactional Storage Engine (ACID Guarantees)             |
|   - UTF8mb4 Multi-Lingual Character Set & Collation                   |
|   - Foreign Key Cascades & Strict Constraint Integrity                |
+-----------------------------------------------------------------------+
```

---

## 2. Technology Stack & Key Libraries

### Backend
- **Core Runtime**: Java 17 (LTS)
- **Framework**: Spring Boot 3.2.5
- **Security**: Spring Security 6, JJWT (io.jsonwebtoken:0.11.5)
- **Data Persistence**: Spring Data JPA, Hibernate 6, MySQL Connector/J 8.0.33
- **Validation**: Hibernate Validator (Jakarta Validation 3.0)
- **Observability**: Spring Boot Actuator (`/actuator/health`, `/actuator/info`)
- **PDF Generation**: iText 8.0.2 / OpenPDF with clean tabular formatting
- **Productivity & Utilities**: Project Lombok, MapStruct / ModelMapper
- **Testing**: JUnit 5, Mockito 5, Spring Boot Test (`@SpringBootTest`, `MockMvc`)

### Frontend
- **Runtime**: Node.js 18+ (LTS)
- **Framework**: React 18.2 with Functional Components & Hooks
- **Build Tool**: Vite 5.x with ESM fast-refresh
- **Component Library**: Material-UI (MUI) v5 (`@mui/material`, `@mui/icons-material`)
- **Styling**: Emotion CSS-in-JS + TailwindCSS utility layout classes
- **Routing**: React Router DOM v6 with dynamic RBAC Protected Route guards
- **HTTP Client**: Axios with global JWT bearer attachment and error handling
- **Notifications**: Notistack snackbar notifications

---

## 3. Prerequisites & System Requirements

Before setting up and running RISHERP, ensure your workstation or server meets the following requirements:

| Component | Minimum Version | Recommended |
|---|---|---|
| **OS** | Windows 10/11, Ubuntu 20.04+, macOS 12+ | Windows 11 / Ubuntu 22.04 LTS |
| **Java JDK** | OpenJDK 17 | Eclipse Temurin 17 or Oracle JDK 17 |
| **Node.js** | Node 18.16.0 | Node 20 LTS with npm 10+ |
| **Database** | MySQL Server 8.0 | MySQL Server 8.0.32+ or MariaDB 10.6+ |
| **Build Tool** | Apache Maven 3.8+ | Maven 3.9+ (or included Maven Wrapper) |
| **RAM** | 4 GB | 8 GB+ (for running dev servers concurrently) |
| **Disk Space** | 2 GB free | 10 GB+ (accommodating database backups) |

---

## 4. Database Setup & Initialization

### Step 1: Create Database
Connect to your local or remote MySQL server using MySQL CLI or MySQL Workbench:

```sql
CREATE DATABASE risherp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### Step 2: Configure Database Credentials
Ensure MySQL is listening on port `3306` and credentials match your `application.yml` (default: `root` / `root` or your local password).

### Step 3: Schema DDL & Auto-Migration
RISHERP utilizes Hibernate's automated schema management (`hibernate.ddl-auto: update`). On the initial startup of `risherp-backend`, all 25+ relational tables, foreign key constraints, indexes, and join tables are created automatically.

### Step 4: Automatic Permission & Role Seeding
Upon application startup, `PermissionSeeder` automatically populates:
- All 45+ granular permissions across modules (`SALES`, `PURCHASE`, `STOCK`, `LEDGER`, `REPORTS`, `BACKUP`, `SETTINGS`, etc.)
- Default role definitions (`ADMIN`, `MANAGER`, `STAFF`) with default permission mappings.

---

## 5. Backend Configuration & Running

The backend configuration is centralized in `risherp-backend/src/main/resources/application.yml`.

### Key Configuration Properties

```yaml
server:
  port: 8080
  servlet:
    context-path: /

spring:
  datasource:
    url: jdbc:mysql://localhost:3306/risherp?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
    username: root
    password: YOUR_MYSQL_PASSWORD
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false

jwt:
  secret: your-super-secret-jwt-key-with-at-least-256-bits-length-for-security
  expiration: 86400000 # 24 hours in milliseconds

management:
  endpoints:
    web:
      exposure:
        include: health,info
```

### Running Backend in Development Mode

```bash
cd e:\erp\risherp-backend
mvn spring-boot:run
```

Once started, the backend REST API is available at `http://localhost:8080`.
Verify health: `GET http://localhost:8080/actuator/health` -> `{"status":"UP"}`.

---

## 6. Frontend Configuration & Running

### Step 1: Configure Environment Variables
Copy `.env.example` to `.env`:

```bash
cd e:\erp\risherp-frontend
cp .env.example .env
```

Ensure the API base URL matches your backend endpoint:
```ini
VITE_API_BASE_URL=http://localhost:8080/api
```

### Step 2: Install Node Dependencies
```bash
npm install
```

### Step 3: Launch Vite Development Server
```bash
npm run dev
```

The application will be accessible at `http://localhost:5173`.

---

## 7. Production Build & Deployment Instructions

### Backend Production Fat JAR
To assemble an executable, self-contained Spring Boot fat JAR:

```bash
cd e:\erp\risherp-backend
mvn clean package
```

The generated JAR will be located at:
`risherp-backend/target/risherp-backend-1.0.0.jar`

Run the production JAR on a server:
```bash
java -jar -Dspring.profiles.active=prod risherp-backend-1.0.0.jar
```

### Frontend Production Static Bundle
To assemble optimized and minified production static assets:

```bash
cd e:\erp\risherp-frontend
npm run build
```

The compiled assets are placed in `risherp-frontend/dist/`.

### Nginx Production Reverse Proxy Configuration
```nginx
server {
    listen 80;
    server_name erp.yourdomain.com;

    # Frontend Single Page Application
    location / {
        root /var/www/risherp/dist;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    # Backend REST API Proxy
    location /api/ {
        proxy_pass http://127.0.0.1:8080/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Actuator Health Check (Internal Monitoring)
    location /actuator/ {
        proxy_pass http://127.0.0.1:8080/actuator/;
        proxy_set_header Host $host;
        allow 127.0.0.1;
        deny all;
    }
}
```

---

## 8. Authentication, Tenant Isolation & Security

### Multi-Tenant Data Isolation
RISHERP incorporates multi-tenancy at the data layer. Every enterprise entity (`Party`, `Item`, `Sale`, `Purchase`, `Payment`, `Receipt`, `Ledger`, `AuditLog`, `Backup`) maintains a mandatory foreign key reference to `business_id`.
- The authenticated `UserPrincipal` extracts `businessId` from the signed, cryptographically validated JWT token.
- Every service query automatically scopes criteria to `businessId`. Tenants cannot view, alter, or discover records belonging to any other enterprise.

### Security Code Verification
During initial enterprise registration, the system generates an immutable, high-entropy `Security Code` (e.g., `RISH-T2ZMF3`). This security code serves as an out-of-band recovery token and administrative authorization key for disaster recovery and database restoration.

---

## 9. Role-Based Access Control (RBAC)

RISHERP features a fine-grained, database-driven RBAC engine:

### Standard Roles
1. **ADMIN**: Full unrestricted administrative authority over all financial modules, system settings, document numbering, user provisioning, audit trails, and database backups.
2. **MANAGER**: Operational authority over purchasing, sales invoicing, inventory adjustments, party management, settlements, and analytical reports. Restricted from deleting audit logs or re-configuring system settings.
3. **STAFF**: Fast-paced Point-of-Sale billing, invoice viewing, receipt collections, and basic stock lookups. Restricted from viewing margin/profit reports, cancelling financial records, or managing user accounts.

### Permission Structure
Every permission is categorized by business module:
- `PARTY`: `PARTY_VIEW`, `PARTY_CREATE`, `PARTY_UPDATE`, `PARTY_DELETE`
- `ITEM`: `ITEM_VIEW`, `ITEM_CREATE`, `ITEM_UPDATE`, `ITEM_DELETE`
- `SALES`: `SALES_VIEW`, `SALES_CREATE`, `SALES_PRINT`, `SALES_CANCEL`
- `PURCHASE`: `PURCHASE_VIEW`, `PURCHASE_CREATE`, `PURCHASE_PRINT`, `PURCHASE_CANCEL`
- `RETURNS`: `SALES_RETURN_CREATE`, `PURCHASE_RETURN_CREATE`
- `FINANCE`: `PAYMENT_CREATE`, `RECEIPT_CREATE`, `LEDGER_VIEW`
- `REPORTS`: `REPORT_VIEW`, `SALES_REPORT_VIEW`, `PROFIT_REPORT_VIEW`, `REPORT_PDF`
- `ADMIN`: `USER_MANAGE`, `ROLE_MANAGE`, `SETTINGS_UPDATE`, `BACKUP_CREATE`, `AUDIT_LOG_VIEW`

---

## 10. Core Business Modules & Workflows

### 1. Party Master (Customers & Suppliers)
- Unified registry supporting `CUSTOMER`, `SUPPLIER`, and dual `BOTH` party types.
- Strict Indian mobile number validation (`^[6-9]\d{9}$`).
- Opening balance declaration (`NONE`, `RECEIVABLE` (Dr), `PAYABLE` (Cr)).
- Credit limit monitoring and automated code assignment (`PTY-000001`).

### 2. Item Master & Inventory
- Categorized product repository with unit of measure (`PCS`, `BOX`, `KG`, `LTR`, `MTR`).
- Barcode scanning lookup and automated duplicate barcode prevention.
- Dual-rate tracking: `purchaseRate` vs. `saleRate`.
- Low stock threshold notifications (`minimumStock`).
- Initial stock posting with automatic movement audit logging.

### 3. Purchase Entry & Procurement
- Procure inventory from suppliers with line-item discounts (`PERCENTAGE` or `AMOUNT`).
- Payment status auto-calculation: `PAID`, `PARTIAL`, `UNPAID`.
- Immediate inventory increment upon successful submission.
- Real-time supplier credit posting to Accounts Payable ledger.

### 4. Sales & Billing (POS / Invoicing)
- Fast keyboard-friendly invoice entry with customer search and stock validation.
- Real-time stock decrement and prevention of overselling.
- Multiple payment modes: `CASH`, `BANK_TRANSFER`, `UPI`, `CHEQUE`, `CREDIT`.
- Auto-calculation of subtotal, line discounts, overall discount, tax, and balance due.

---

## 11. Returns & Inventory Reversal Mechanism

### Sales Returns (Credit Notes)
- Return defective or excess merchandise against original sales invoices.
- Validates return quantity against unreturned invoice item balances.
- **Stock Impact**: Automatically increments inventory balance back to the warehouse.
- **Financial Impact**: Creates debit/credit adjustment on customer ledger or records immediate cash refund.
- Issues numbered Credit Note voucher (`SR-000001`) with printable PDF.

### Purchase Returns (Debit Notes)
- Return merchandise back to suppliers against original purchase entries.
- Validates that returned quantities do not exceed procured quantities.
- **Stock Impact**: Automatically decrements current inventory.
- **Financial Impact**: Decreases Accounts Payable liability to the supplier.
- Issues numbered Debit Note voucher (`PR-000001`) with printable PDF.

---

## 12. Financial Accounting & Reconciliation Mechanics

RISHERP enforces continuous transactional accounting across all party transactions:

### The Reconciliation Formula
For every customer or supplier, the net outstanding balance is strictly governed by:

$$\text{Net Outstanding} = \text{Opening Balance} + \text{Invoiced Transactions} - \text{Voucher Settlements} - \text{Returns}$$

### Detailed Mathematical Proof
1. **Customer Outstanding**:
   $$\text{Customer Balance (Dr)} = \text{Opening Receivable} + \sum \text{Sale Invoices} - \sum \text{Receipts} - \sum \text{Sales Returns}$$
2. **Supplier Outstanding**:
   $$\text{Supplier Balance (Cr)} = \text{Opening Payable} + \sum \text{Purchases} - \sum \text{Payments} - \sum \text{Purchase Returns}$$

### Ledger Posting Rules
- Every financial event (`SALE`, `PURCHASE`, `RECEIPT`, `PAYMENT`, `RETURN`) generates immutable `LedgerEntry` records.
- Running balance is calculated chronologically with standardized `Dr` (Debit / Receivable) and `Cr` (Credit / Payable) notation.
- Duplicate posting rejection: transactions already posted to the ledger cannot be double-entered.

---

## 13. Concurrency, Locking & Monotonic Numbering

To guarantee gapless, collision-free, monotonic document numbering in high-throughput multi-user environments:
- The system employs **Pessimistic Write Locking (`PESSIMISTIC_WRITE`)** on the `document_sequences` table.
- When an invoice, purchase order, receipt, or payment is generated, the sequence row is locked inside the current database transaction.
- The next sequence number is read, incremented, formatted with user-configured prefixes and padding (e.g., `INV-000042`), and committed atomically.
- Parallel thread concurrency testing confirms **zero duplicate invoice numbers** under multi-threaded load.

---

## 14. Reports & Business Intelligence

RISHERP includes comprehensive analytics and management reports:
- **Sales Analytics**: Paginated sale registers, daily sales velocity, party-wise sales distribution, item-wise volume.
- **Purchase Analytics**: Supplier procurement registers, purchase summaries by period.
- **Inventory & Stock Movement**: Complete audit trail of stock ins and outs (`PURCHASE`, `SALE`, `SALE_RETURN`, `PURCHASE_RETURN`, `ADJUSTMENT`), valuation reports, and low-stock alerts.
- **Profit & Loss Analysis**: Gross revenue, Cost of Goods Sold (COGS), Gross Profit, and Profit Margin percentages.
- **Ledger Statements & Outstanding Aging**: Chronological party statements and aging breakdowns.

---

## 15. System Administration, Audit Logs & Backup/Restore

### Audit Logs
- Every sensitive operation (Login, Registration, Invoice Creation, Order Cancellation, Security Changes, Role Updates) writes an immutable record to `audit_logs`.
- Captures: `userId`, `userEmail`, `businessId`, `module`, `action`, `entityId`, `description`, `ipAddress`, and timestamp.

### Database Backups
- Complete SQL dump creation via native MySQL utility integrations.
- Metadata tracking in `backups` table with file name, file size, status, and creation timestamps.
- Direct administrative download of SQL dump files from the ERP UI.
- Disaster recovery restoration pipeline protected by administrative privileges.

---

## 16. PDF Generation Engine & Templates

RISHERP features a server-side document rendering engine that streams clean, print-ready PDF binaries directly to client browsers:
- **Sales Invoices** (`/api/sales/{id}/pdf`)
- **Purchase Orders** (`/api/purchases/{id}/pdf`)
- **Sales Return Credit Notes** (`/api/sales-returns/{id}/pdf`)
- **Purchase Return Debit Notes** (`/api/purchase-returns/{id}/pdf`)
- **Customer Receipts** (`/api/receipts/{id}/pdf`)
- **Supplier Payment Vouchers** (`/api/payments/{id}/pdf`)
- **Analytical & Ledger Reports** (`/api/reports/.../pdf`)

---

## 17. Automated Testing Suite

RISHERP includes automated unit, service, controller, and integration tests:

```bash
cd e:\erp\risherp-backend
mvn test
```

### Key Test Suites
- **`IntegrationReconciliationTest`**: Verifies exact mathematical equality between customer/supplier opening balances, sales, receipts, returns, and outstanding balances.
- **`DocumentSequenceConcurrencyTest`**: Validates pessimistic locking and sequential monotonic number allocation under concurrent multi-threaded execution.
- **`PartyServiceTest` & `ItemServiceTest`**: Validates data constraints, barcode uniqueness, mobile validations, and business boundary enforcement.
- **`PurchaseServiceTest` & `SaleServiceTest`**: Validates line-item calculations, discount computations, stock deductions, and cancellation rollbacks.

---

## 18. Observability, Health Checks & Hardened Error Handling

### Actuator Endpoints
- **Health**: `GET /actuator/health` -> Returns `{"status":"UP"}` with database connectivity status.
- **Info**: `GET /actuator/info` -> Returns application build version and environment metadata.

### Global Exception Handler
All backend REST exceptions are trapped by `GlobalExceptionHandler` and rendered in a uniform envelope:
```json
{
  "success": false,
  "message": "Human-readable sanitized error explanation",
  "data": null,
  "timestamp": "2026-09-17T17:40:00.000Z"
}
```
- **Security**: Raw SQL syntax errors and database constraint names are stripped before returning to clients to prevent reconnaissance leaks.
- **HTTP Status Codes**:
  - `400 Bad Request`: Validation failure or business rule violation.
  - `403 Forbidden`: Access denied due to insufficient permissions.
  - `404 Not Found`: Entity not found for the given ID in the current business tenant.
  - `409 Conflict`: Duplicate unique key conflict.

---

## 19. Known Scope Limitations

The following features were intentionally excluded from RISHERP per system specifications:
- **Single Currency**: All financial calculations are formatted in Indian Rupee (INR / ₹).
- **Single-Company Partitioning**: Each tenant represents an independent single-branch business.
- **Omitted Integrations**: GST / E-Way Bill auto-filing, WhatsApp Cloud API, cloud synchronization bridges, Android/iOS native mobile clients, and multi-currency exchange rates are not included.

---

## 20. Developer Workflow & Contributing Guide

### Project Directory Structure
```
e:\erp\
├── risherp-backend/                 # Spring Boot REST API
│   ├── src/main/java/com/risherp/   # Java source code
│   │   ├── config/                  # Security, JPA & Seeder configs
│   │   ├── controller/              # REST Controllers
│   │   ├── dto/                     # Request & Response DTOs
│   │   ├── entity/                  # JPA Entities (Hibernate)
│   │   ├── exception/               # Global exception handlers
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   ├── security/                # JWT filters & UserDetails
│   │   ├── service/                 # Business logic interfaces & impls
│   │   └── util/                    # Formatters, sequence generators
│   └── src/test/java/com/risherp/   # Automated test suites
│
├── risherp-frontend/                # React 18 SPA (Vite)
│   ├── public/                      # Static assets & icons
│   ├── src/
│   │   ├── api/                     # Axios HTTP client & API bindings
│   │   ├── components/              # Reusable UI components & modals
│   │   ├── context/                 # Auth & Enterprise context providers
│   │   ├── pages/                   # Module views (Sales, Stock, etc.)
│   │   ├── routes/                  # App routes & RBAC route guards
│   │   └── utils/                   # Helpers, formatters & navigation chrome
│   ├── .env.example                 # Dev environment template
│   └── .env.production.example      # Prod environment template
│
└── README.md                        # Project documentation (this file)
```

### Git Commit Guidelines
Follow conventional commit messaging:
- `feat:` New user-facing capability or API endpoint
- `fix:` Bug fix or calculation correction
- `test:` Unit or integration test addition
- `docs:` Documentation or README updates
- `refactor:` Code restructuring without behavioral change
