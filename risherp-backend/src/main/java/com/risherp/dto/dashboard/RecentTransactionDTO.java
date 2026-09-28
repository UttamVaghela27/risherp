package com.risherp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecentTransactionDTO {

    private String id;
    private String type;         // "SALE", "PURCHASE", "RECEIPT", "PAYMENT"
    private String reference;    // e.g. "INV-1001", "PO-5001"
    private String partyName;
    private String date;         // ISO date or formatted
    private BigDecimal amount;
    private String paymentMode;  // "CASH", "BANK", "UPI", "CREDIT"
    private String status;       // "PAID", "PENDING", "PARTIAL"
}
