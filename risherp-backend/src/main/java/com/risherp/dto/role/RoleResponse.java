package com.risherp.dto.role;

import com.risherp.dto.permission.PermissionResponse;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoleResponse {
    private Long id;
    private String name;
    private String description;
    private String status;
    private List<PermissionResponse> permissions;
    private long usersCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
