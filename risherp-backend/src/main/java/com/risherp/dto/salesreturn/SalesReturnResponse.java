package com.risherp.dto.salesreturn;

import com.risherp.entity.RefundMode;
import com.risherp.entity.SalesReturnStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * SalesReturnResponse — full return detail returned to frontend.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalesReturnResponse {

    private Long id;
    private String returnNumber;

    // ---- Original Sale Reference ----
    private Long saleId;
    private String invoiceNumber;
    private LocalDate saleDate;

    // ---- Customer ----
    private Long partyId;
    private String partyName;
    private String partyCode;
    private String partyMobile;
    private String partyEmail;
    private String partyAddress;
    private String partyCity;
    private String partyState;

    // ---- Business ----
    private String businessName;
    private String businessEmail;
    private String businessMobile;

    // ---- Return Info ----
    private LocalDate returnDate;

    // ---- Financial Summary ----
    private BigDecimal subtotal;
    private BigDecimal itemDiscount;
    private BigDecimal overallDiscountAllocated;
    private BigDecimal totalDiscount;
    private BigDecimal returnAmount;
    private BigDecimal refundAmount;
    private BigDecimal adjustmentAmount;
    private RefundMode refundMode;

    // ---- Items ----
    private List<SalesReturnItemResponse> items;

    // ---- Meta ----
    private String reason;
    private String notes;
    private SalesReturnStatus status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
