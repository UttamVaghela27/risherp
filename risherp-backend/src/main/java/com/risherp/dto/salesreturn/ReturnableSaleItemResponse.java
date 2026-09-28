package com.risherp.dto.salesreturn;

import lombok.*;

import java.math.BigDecimal;

/**
 * ReturnableSaleItemResponse
 *
 * Frontend uses this to display original sale items with returnable quantity
 * pre-calculated on the backend. Prevents frontend from having to aggregate
 * all prior returns to determine returnable quantity.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReturnableSaleItemResponse {

    private Long saleItemId;
    private Long itemId;

    // Snapshots from original SaleItem
    private String itemNameSnapshot;
    private String itemCodeSnapshot;
    private String unitSnapshot;

    // Original sale values
    private BigDecimal originalQuantity;
    private BigDecimal rate;
    private BigDecimal discountAmount;
    private BigDecimal lineTotal;

    // Computed by backend
    private BigDecimal alreadyReturnedQuantity;
    private BigDecimal returnableQuantity;   // = originalQuantity - alreadyReturnedQuantity

    /** true if all units have already been returned. */
    private boolean fullyReturned;
}
