package com.risherp.dto.salesreturn;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SalesReturnItemResponse — one line item in a SalesReturnResponse.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReturnItemResponse {

    private Long id;

    // Original SaleItem reference
    private Long saleItemId;
    private Long itemId;

    // Snapshots
    private String itemNameSnapshot;
    private String itemCodeSnapshot;
    private String unitSnapshot;

    // Original sale values
    private BigDecimal originalQuantity;
    private BigDecimal alreadyReturnedQuantity;

    // Return values
    private BigDecimal returnQuantity;
    private BigDecimal rate;
    private BigDecimal discountAmount;
    private BigDecimal lineTotal;

    private LocalDateTime createdAt;
}
