package com.risherp.dto.party;

import com.risherp.entity.OpeningBalanceType;
import com.risherp.entity.PartyStatus;
import com.risherp.entity.PartyType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * PartyResponse
 * Standard projection DTO for party records.
 * Never exposes internal entity relationships directly.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyResponse {

    private Long id;
    private String partyCode;
    private String partyName;
    private PartyType partyType;
    private String contactPerson;
    private String mobile;
    private String alternateMobile;
    private String email;
    private String address;
    private String city;
    private String state;
    private String pincode;
    private BigDecimal openingBalance;
    private OpeningBalanceType openingBalanceType;
    private BigDecimal creditLimit;
    private String notes;
    private PartyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
