package com.risherp.dto.item;

import com.risherp.entity.ItemStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;

/**
 * CreateItemRequest
 * Payload for creating a new Item in Item Master.
 * Allows setting initial/opening stock during creation only.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateItemRequest {

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

    @Builder.Default
    @DecimalMin(value = "0.0", message = "Initial stock cannot be negative")
    private BigDecimal initialStock = BigDecimal.ZERO;

    @Builder.Default
    @DecimalMin(value = "0.0", message = "Minimum stock cannot be negative")
    private BigDecimal minimumStock = BigDecimal.ZERO;

    private String description;

    @Builder.Default
    private ItemStatus status = ItemStatus.ACTIVE;
}
