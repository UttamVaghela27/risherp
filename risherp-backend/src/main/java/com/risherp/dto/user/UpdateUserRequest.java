package com.risherp.dto.user;

import jakarta.validation.constraints.*;
import lombok.*;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateUserRequest {

    @NotBlank(message = "Full name is required")
    @Size(max = 100)
    private String fullName;

    @Size(max = 50)
    private String username;

    @NotBlank(message = "Email is required")
    @Email
    @Size(max = 150)
    private String email;

    @Size(max = 20)
    private String mobile;

    @NotNull(message = "Role is required")
    private Long roleId;
}
