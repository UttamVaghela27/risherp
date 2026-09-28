package com.risherp.dto.report;

import com.risherp.entity.StockStatus;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LowStockDTO {
    private Long itemId;
    private String itemCode;
    private String itemName;
    private String categoryName;
    private String unit;
    private BigDecimal currentStock;
    private BigDecimal minimumStock;
    private BigDecimal shortage;
    private StockStatus status;
}
