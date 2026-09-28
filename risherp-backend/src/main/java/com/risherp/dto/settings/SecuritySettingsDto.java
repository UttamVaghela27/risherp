package com.risherp.dto.settings;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SecuritySettingsDto {
    private Long tokenExpirationMs;
    private String tokenExpirationFormatted;
    private Integer minPasswordLength;
    private Boolean requireSpecialChar;
    private Boolean requireDigit;
    private Boolean requireUppercase;
    private String currentRole;
    private Integer totalPermissions;
}
