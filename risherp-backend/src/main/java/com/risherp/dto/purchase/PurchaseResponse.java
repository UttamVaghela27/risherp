package com.risherp.dto.purchase;

import com.risherp.entity.PaymentMode;
import com.risherp.entity.PaymentStatus;
import com.risherp.entity.PurchaseStatus;
import com.risherp.entity.PurchaseType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PurchaseResponse {

    private Long id;
    private String purchaseNumber;

    // ---- Supplier Details ----
    private Long partyId;
    private String partyName;
    private String partyCode;
    private String partyMobile;
    private String partyEmail;
    private String partyAddress;
    private String partyCity;
    private String partyState;
    private String partyPincode;
    private String partyGstin;

    // ---- Company / Business Details ----
    private String businessName;
    private String businessEmail;
    private String businessMobile;
    private String businessAddress;

    // ---- Purchase Info ----
    private LocalDate purchaseDate;
    private PurchaseType purchaseType;

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
    private List<PurchaseItemResponse> items;

    // ---- Meta ----
    private String notes;
    private PurchaseStatus status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
