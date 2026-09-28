package com.risherp.dto.user;

import com.risherp.dto.role.RoleSummaryDTO;
import lombok.*;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String fullName;
    private String username;
    private String email;
    private String mobile;
    private String status;
    private RoleSummaryDTO role;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
