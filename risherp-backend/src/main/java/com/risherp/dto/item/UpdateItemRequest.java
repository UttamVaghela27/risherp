package com.risherp.dto.item;

import com.risherp.entity.ItemStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * UpdateItemRequest
 * Payload for updating an existing Item.
 * 
 * ARCHITECTURAL SAFETY RULE:
 * currentStock is deliberately NOT present here.
 * Stock levels cannot be modified via standard Item update;
 * they can only be changed via future Sales, Purchases, Returns, and Stock Adjustments.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateItemRequest {

    @NotBlank(message = "Item name is required")
    @Size(min = 2, max = 200, message = "Item name must be between 2 and 200 characters")
    private String itemName;

    @Size(max = 100, message = "Barcode cannot exceed 100 characters")
    private String barcode;

    @NotNull(message = "Category is required")
    private Long categoryId;

    @Size(max = 100, message = "Company/brand name cannot exceed 100 characters")
    private String companyName;

    @NotBlank(message = "Unit is required")
    @Size(max = 20, message = "Unit cannot exceed 20 characters")
    private String unit;

    @NotNull(message = "Purchase rate is required")
    @DecimalMin(value = "0.0", message = "Purchase rate cannot be negative")
    private BigDecimal purchaseRate;

    @NotNull(message = "Sale rate is required")
    @DecimalMin(value = "0.0", message = "Sale rate cannot be negative")
    private BigDecimal saleRate;

    @DecimalMin(value = "0.0", message = "Minimum stock cannot be negative")
    private BigDecimal minimumStock;

    private String description;

    private ItemStatus status;
}
