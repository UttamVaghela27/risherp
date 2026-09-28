package com.risherp.dto.role;

import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleStatusRequest {

    @NotBlank(message = "Status is required")
    private String status;
}
