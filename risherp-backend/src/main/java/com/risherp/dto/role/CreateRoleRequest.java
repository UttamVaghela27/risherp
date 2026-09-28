package com.risherp.dto.role;

import jakarta.validation.constraints.*;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateRoleRequest {

    @NotBlank(message = "Role name is required")
    @Size(min = 2, max = 50, message = "Role name must be 2-50 characters")
    private String roleName;

    @Size(max = 255, message = "Description too long")
    private String description;

    private List<Long> permissionIds;
}
