package com.risherp.dto.item;

import com.risherp.entity.ItemStatus;
import com.risherp.entity.StockStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * ItemResponse
 * Complete response DTO representing Item details with computed stock status and valuation.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemResponse {

    private Long id;
    private String itemCode;
    private String itemName;
    private String barcode;
    private Long categoryId;
    private String categoryName;
    private String companyName;
    private String unit;
    private BigDecimal purchaseRate;
    private BigDecimal saleRate;
    private BigDecimal currentStock;
    private BigDecimal minimumStock;
    private StockStatus stockStatus;
    private BigDecimal stockValue;
    private String description;
    private ItemStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
