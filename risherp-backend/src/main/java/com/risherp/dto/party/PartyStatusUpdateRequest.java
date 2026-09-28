package com.risherp.dto.party;

import com.risherp.entity.PartyStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * PartyStatusUpdateRequest
 * Request payload for toggling ACTIVE/INACTIVE status of a party.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PartyStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private PartyStatus status;
}
