package com.risherp.dto.category;

import com.risherp.entity.CategoryStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

/**
 * CategoryStatusUpdateRequest
 * Payload for updating category status via PATCH.
 */
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CategoryStatusUpdateRequest {

    @NotNull(message = "Category status is required")
    private CategoryStatus status;
}
