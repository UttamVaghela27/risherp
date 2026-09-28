package com.risherp.dto.stock;

import com.risherp.entity.StockTxnType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * StockTransactionResponse DTO
 * Returned by the Stock Ledger API.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StockTransactionResponse {

    private Long id;

    private Long itemId;
    private String itemName;
    private String itemCode;
    private String unit;

    private StockTxnType txnType;       // IN or OUT
    private BigDecimal quantity;
    private BigDecimal stockBefore;
    private BigDecimal stockAfter;

    private String referenceType;       // SALE, PURCHASE, SALE_CANCEL, etc.
    private String referenceNumber;     // INV-000001, PUR-000001, etc.
    private String notes;

    private LocalDateTime createdAt;
}
