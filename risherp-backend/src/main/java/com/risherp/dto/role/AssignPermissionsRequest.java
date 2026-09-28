package com.risherp.dto.role;

import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AssignPermissionsRequest {

    @NotNull(message = "Permission IDs are required")
    private List<Long> permissionIds;
}
