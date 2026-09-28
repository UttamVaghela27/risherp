package com.risherp.util;

/**
 * Application-wide constants.
 * 
 * Centralizing constants avoids "magic strings" scattered throughout the code.
 * When you need to change a value, you change it in one place.
 */
public final class AppConstants {

    private AppConstants() {
        // Private constructor prevents instantiation — this is a utility class
    }

    // ---- Application Info ----
    public static final String APP_NAME = "RISHERP";
    public static final String APP_VERSION = "1.0.0";

    // ---- Pagination Defaults ----
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIR = "asc";

    // ---- Status Values ----
    public static final String STATUS_ACTIVE = "ACTIVE";
    public static final String STATUS_INACTIVE = "INACTIVE";

    // ---- Party Types ----
    public static final String PARTY_TYPE_CUSTOMER = "CUSTOMER";
    public static final String PARTY_TYPE_SUPPLIER = "SUPPLIER";
    public static final String PARTY_TYPE_BOTH = "BOTH";

    // ---- Transaction Types (for Ledger) ----
    public static final String TXN_SALE = "SALE";
    public static final String TXN_PURCHASE = "PURCHASE";
    public static final String TXN_PAYMENT = "PAYMENT";
    public static final String TXN_RECEIPT = "RECEIPT";
    public static final String TXN_SALE_RETURN = "SALE_RETURN";
    public static final String TXN_PURCHASE_RETURN = "PURCHASE_RETURN";

    // ---- Stock Movement Types ----
    public static final String STOCK_IN = "IN";
    public static final String STOCK_OUT = "OUT";
    public static final String STOCK_ADJUSTMENT = "ADJUSTMENT";

    // ---- Payment Modes ----
    public static final String PAYMENT_CASH = "CASH";
    public static final String PAYMENT_CREDIT = "CREDIT";
    public static final String PAYMENT_BANK = "BANK_TRANSFER";
    public static final String PAYMENT_UPI = "UPI";
    public static final String PAYMENT_CHEQUE = "CHEQUE";
}
