package com.risherp.dto.role;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateRoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(min = 2, max = 50)
    private String roleName;

    @Size(max = 255)
    private String description;

    private List<Long> permissionIds;
}
