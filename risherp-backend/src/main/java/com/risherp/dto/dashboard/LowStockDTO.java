package com.risherp.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LowStockDTO {

    private Long itemId;
    private String itemName;
    private String itemCode;
    private Double currentStock;
    private Double minimumStock;
    private String unit;
    private String status; // "LOW_STOCK", "OUT_OF_STOCK"
}
