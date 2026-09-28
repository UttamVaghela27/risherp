package com.risherp.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerifySecurityCodeResponse {

    private boolean verified;
    private Long businessId;
    private String businessName;
    private String ownerName;
    private String verificationToken;
}
