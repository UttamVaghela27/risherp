package com.risherp.dto.sales;

import com.risherp.entity.PaymentMode;
import com.risherp.entity.PaymentStatus;
import com.risherp.entity.SaleStatus;
import com.risherp.entity.SaleType;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * SaleResponse — full invoice response returned to the frontend.
 * Includes all financial details, party summary, and line items.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponse {

    private Long id;
    private String invoiceNumber;

    // ---- Customer ----
    private Long partyId;
    private String partyName;
    private String partyCode;
    private String partyMobile;
    private String partyEmail;
    private String partyAddress;
    private String partyCity;
    private String partyState;
    private String partyPincode;

    // ---- Company / Business ----
    private String businessName;
    private String businessEmail;
    private String businessMobile;

    // ---- Sale Info ----
    private LocalDate saleDate;
    private SaleType saleType;

    // ---- Financial ----
    private BigDecimal subtotal;
    private BigDecimal itemDiscount;
    private BigDecimal overallDiscount;
    private BigDecimal totalDiscount;
    private BigDecimal grandTotal;
    private BigDecimal paidAmount;
    private BigDecimal balanceAmount;
    private PaymentStatus paymentStatus;
    private PaymentMode paymentMode;

    // ---- Items ----
    private List<SaleItemResponse> items;

    // ---- Meta ----
    private String notes;
    private SaleStatus status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
