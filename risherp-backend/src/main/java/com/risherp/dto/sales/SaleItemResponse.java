package com.risherp.dto.sales;

import com.risherp.entity.DiscountType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * SaleItemResponse — one line item within a SaleResponse.
 * Uses snapshot fields so historical invoices remain accurate.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleItemResponse {

    private Long id;
    private Long itemId;
    private String itemNameSnapshot;
    private String itemCodeSnapshot;
    private String unitSnapshot;
    private BigDecimal quantity;
    private BigDecimal rate;
    private DiscountType discountType;
    private BigDecimal discountValue;
    private BigDecimal discountAmount;
    private BigDecimal lineSubtotal;
    private BigDecimal lineTotal;
    private LocalDateTime createdAt;
}
