package com.risherp.service;

import com.risherp.entity.*;
import com.risherp.security.UserPrincipal;

public interface FinancialPostingService {

    void postOpeningBalance(Party party, UserPrincipal principal);

    void postSale(Sale sale, UserPrincipal principal);

    void postReceipt(Receipt receipt, UserPrincipal principal);

    void postSalesReturn(SalesReturn salesReturn, UserPrincipal principal);

    void postPurchase(Purchase purchase, UserPrincipal principal);

    void postPayment(PaymentTxn payment, UserPrincipal principal);

    void postPurchaseReturn(PurchaseReturn purchaseReturn, UserPrincipal principal);

    void reverseSale(Sale sale, UserPrincipal principal);

    void reverseReceipt(Receipt receipt, UserPrincipal principal);

    void reverseSalesReturn(SalesReturn salesReturn, UserPrincipal principal);

    void reversePurchase(Purchase purchase, UserPrincipal principal);

    void reversePayment(PaymentTxn payment, UserPrincipal principal);

    void reversePurchaseReturn(PurchaseReturn purchaseReturn, UserPrincipal principal);

    /**
     * Idempotently synchronizes any legacy transactions created before Phase 15 into ledger_entries.
     */
    void syncAllExistingRecords(Long businessId);
}
