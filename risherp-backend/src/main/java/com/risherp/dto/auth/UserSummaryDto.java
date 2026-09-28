package com.risherp.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Current user summary returned by /api/auth/me.
 * Phase 17: Added permissions list for frontend RBAC.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryDto {

    private Long id;
    private String name;
    private String username;
    private String email;
    private String mobile;
    private String role;
    private Long businessId;
    private String businessName;
    /** All permission codes granted to this user via their role. */
    private List<String> permissions;
}
