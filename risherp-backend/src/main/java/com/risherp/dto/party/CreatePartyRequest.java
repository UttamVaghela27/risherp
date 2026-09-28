package com.risherp.dto.party;

import com.risherp.entity.OpeningBalanceType;
import com.risherp.entity.PartyStatus;
import com.risherp.entity.PartyType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * CreatePartyRequest
 * Request payload for creating a new business party.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreatePartyRequest {

    @NotBlank(message = "Party name is required")
    @Size(min = 2, max = 150, message = "Party name must be between 2 and 150 characters")
    private String partyName;

    @NotNull(message = "Party type is required")
    private PartyType partyType;

    @Size(max = 100, message = "Contact person must not exceed 100 characters")
    private String contactPerson;

    @NotBlank(message = "Mobile number is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Please enter a valid 10-digit Indian mobile number")
    private String mobile;

    @Pattern(regexp = "^$|^[6-9]\\d{9}$", message = "Please enter a valid 10-digit Indian alternate mobile number")
    private String alternateMobile;

    @Email(message = "Please enter a valid email address")
    @Size(max = 150, message = "Email must not exceed 150 characters")
    private String email;

    @Size(max = 255, message = "Address must not exceed 255 characters")
    private String address;

    @Size(max = 100, message = "City must not exceed 100 characters")
    private String city;

    @Size(max = 100, message = "State must not exceed 100 characters")
    private String state;

    @Pattern(regexp = "^$|^[1-9][0-9]{5}$", message = "Please enter a valid 6-digit Indian PIN code")
    private String pincode;

    @NotNull(message = "Opening balance is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Opening balance cannot be negative")
    private BigDecimal openingBalance;

    @NotNull(message = "Opening balance type is required")
    private OpeningBalanceType openingBalanceType;

    @NotNull(message = "Credit limit is required")
    @DecimalMin(value = "0.0", inclusive = true, message = "Credit limit cannot be negative")
    private BigDecimal creditLimit;

    private String notes;

    @Builder.Default
    private PartyStatus status = PartyStatus.ACTIVE;
}
