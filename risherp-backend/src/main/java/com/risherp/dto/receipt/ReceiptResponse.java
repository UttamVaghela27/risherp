package com.risherp.dto.receipt;

import com.risherp.entity.PaymentMode;
import com.risherp.entity.ReceiptStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * ReceiptResponse — full response for customer receipt.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReceiptResponse {

    private Long id;
    private String receiptNumber;

    // Party / Customer
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

    // Receipt details
    private LocalDate receiptDate;
    private BigDecimal amount;
    private PaymentMode paymentMode;
    private String referenceNumber;
    private BigDecimal allocatedAmount;
    private BigDecimal unallocatedAmount;

    // Allocations
    private List<ReceiptAllocationResponse> allocations;

    // Meta
    private String notes;
    private ReceiptStatus status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
