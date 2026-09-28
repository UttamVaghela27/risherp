package com.risherp.dto.purchase;

import com.risherp.entity.DiscountType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseItemResponse {

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
    private BigDecimal taxAmount;
    private BigDecimal lineSubtotal;
    private BigDecimal lineTotal;
    private LocalDateTime createdAt;
}
