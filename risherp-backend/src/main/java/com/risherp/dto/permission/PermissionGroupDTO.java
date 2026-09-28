package com.risherp.dto.permission;

import lombok.*;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PermissionGroupDTO {
    private String module;
    private List<PermissionResponse> permissions;
}
