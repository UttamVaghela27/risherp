package com.risherp.dto.item;

import com.risherp.entity.ItemStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * ItemStatusUpdateRequest
 * Payload for toggling item active/inactive status via PATCH.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ItemStatusUpdateRequest {

    @NotNull(message = "Item status is required")
    private ItemStatus status;
}
