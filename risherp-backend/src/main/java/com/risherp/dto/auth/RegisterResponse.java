package com.risherp.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterResponse {

    private Long businessId;
    private String businessName;
    private String ownerName;
    private String email;
    private String securityCode;
    private String instruction;

    /** True when the user must verify their email before they can log in. */
    @Builder.Default
    private boolean needsEmailVerification = true;
}
