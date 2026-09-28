package com.risherp.util;

import java.security.SecureRandom;

/**
 * Utility to generate secure, readable Security Codes for Business verification.
 * Format: RISH-XXXXXX (6 alphanumeric uppercase characters/digits).
 */
public class SecurityCodeGenerator {

    private static final String CHARACTERS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // excludes easily confused 0,O,1,I
    private static final int CODE_LENGTH = 6;
    private static final SecureRandom RANDOM = new SecureRandom();

    public static String generateSecurityCode() {
        StringBuilder sb = new StringBuilder("RISH-");
        for (int i = 0; i < CODE_LENGTH; i++) {
            sb.append(CHARACTERS.charAt(RANDOM.nextInt(CHARACTERS.length())));
        }
        return sb.toString();
    }
}
