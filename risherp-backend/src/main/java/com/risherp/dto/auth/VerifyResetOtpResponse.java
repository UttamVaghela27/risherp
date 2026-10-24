package com.risherp.dto.auth;

import lombok.*;

@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class VerifyResetOtpResponse {

    /**
     * Short-lived single-use token to authorize the password change.
     * Must be sent back with the reset-password request.
     * This is NOT a login token — it only authorizes the password reset operation.
     */
    private String resetToken;
    private String email;
    private String message;
}
