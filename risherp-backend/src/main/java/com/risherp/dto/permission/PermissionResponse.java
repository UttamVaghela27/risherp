package com.risherp.dto.permission;

import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionResponse {
    private Long id;
    private String permissionCode;
    private String permissionName;
    private String module;
    private String description;
}
