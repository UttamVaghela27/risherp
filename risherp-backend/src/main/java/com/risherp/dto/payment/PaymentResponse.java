package com.risherp.dto.payment;

import com.risherp.entity.PaymentMode;
import com.risherp.entity.PaymentTxnStatus;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

/**
 * PaymentResponse — full response for supplier payment.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PaymentResponse {

    private Long id;
    private String paymentNumber;

    // Party / Supplier
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

    // Payment details
    private LocalDate paymentDate;
    private BigDecimal amount;
    private PaymentMode paymentMode;
    private String referenceNumber;
    private BigDecimal allocatedAmount;
    private BigDecimal unallocatedAmount;

    // Allocations
    private List<PaymentAllocationResponse> allocations;

    // Meta
    private String notes;
    private PaymentTxnStatus status;
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
