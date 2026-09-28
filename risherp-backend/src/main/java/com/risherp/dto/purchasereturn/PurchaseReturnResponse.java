package com.risherp.dto.purchasereturn;

import com.risherp.entity.PurchaseReturnStatus;
import com.risherp.entity.RefundMode;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * PurchaseReturnResponse — complete response for a PurchaseReturn.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseReturnResponse {

    private Long id;
    private String returnNumber;

    // Original Purchase Reference
    private Long purchaseId;
    private String purchaseNumber;
    private LocalDate purchaseDate;

    // Supplier
    private Long partyId;
    private String partyName;
    private String partyCode;
    private String partyMobile;
    private String partyEmail;
    private String partyAddress;
    private String partyCity;
    private String partyState;

    // Business
    private String businessName;
    private String businessEmail;
    private String businessMobile;

    // Return Details
    private LocalDate returnDate;

    // Financial
    private BigDecimal subtotal;
    private BigDecimal itemDiscount;
    private BigDecimal overallDiscountAllocated;
    private BigDecimal totalDiscount;
    private BigDecimal returnAmount;
    private BigDecimal refundAmount;
    private BigDecimal adjustmentAmount;
    private RefundMode refundMode;

    // Items
    private List<PurchaseReturnItemResponse> items;

    // Meta
    private String reason;
    private String notes;
    private PurchaseReturnStatus status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
