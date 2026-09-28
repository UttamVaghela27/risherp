package com.risherp.service.impl;

import com.risherp.dto.settings.*;
import com.risherp.entity.Business;
import com.risherp.entity.SystemSetting;
import com.risherp.entity.User;
import com.risherp.entity.UserPreference;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.SystemSettingRepository;
import com.risherp.repository.UserPreferenceRepository;
import com.risherp.repository.UserRepository;
import com.risherp.service.AuditLogService;
import com.risherp.service.SettingsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.*;
import java.time.ZoneId;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class SettingsServiceImpl implements SettingsService {

    private final BusinessRepository businessRepository;
    private final SystemSettingRepository systemSettingRepository;
    private final UserPreferenceRepository userPreferenceRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Value("${app.jwt.expiration-ms:86400000}")
    private Long jwtExpirationMs;

    private static final String UPLOAD_DIR = "uploads/logos";
    private static final List<String> ALLOWED_IMAGE_TYPES = List.of("image/jpeg", "image/png", "image/webp");
    private static final long MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB

    // =========================================================================
    // BUSINESS PROFILE
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public BusinessProfileDto getBusinessProfile(Long businessId) {
        Business biz = getBusinessOrThrow(businessId);
        return BusinessProfileDto.builder()
                .businessName(biz.getBusinessName())
                .legalName(biz.getLegalName())
                .ownerName(biz.getOwnerName())
                .email(biz.getEmail())
                .mobile(biz.getMobile())
                .alternateMobile(biz.getAlternateMobile())
                .address(biz.getAddress())
                .city(biz.getCity())
                .state(biz.getState())
                .pincode(biz.getPincode())
                .country(biz.getCountry())
                .website(biz.getWebsite())
                .logoUrl(biz.getLogoUrl())
                .build();
    }

    @Override
    @Transactional
    public BusinessProfileDto updateBusinessProfile(Long businessId, BusinessProfileDto dto, Long userId) {
        Business biz = getBusinessOrThrow(businessId);

        String oldVal = String.format("name: %s, email: %s, mobile: %s", biz.getBusinessName(), biz.getEmail(), biz.getMobile());

        biz.setBusinessName(dto.getBusinessName().trim());
        biz.setLegalName(dto.getLegalName() != null ? dto.getLegalName().trim() : null);
        biz.setOwnerName(dto.getOwnerName().trim());
        biz.setEmail(dto.getEmail().trim().toLowerCase());
        biz.setMobile(dto.getMobile().trim());
        biz.setAlternateMobile(dto.getAlternateMobile() != null ? dto.getAlternateMobile().trim() : null);
        biz.setAddress(dto.getAddress() != null ? dto.getAddress().trim() : null);
        biz.setCity(dto.getCity() != null ? dto.getCity().trim() : null);
        biz.setState(dto.getState() != null ? dto.getState().trim() : null);
        biz.setPincode(dto.getPincode() != null ? dto.getPincode().trim() : null);
        biz.setCountry(dto.getCountry() != null ? dto.getCountry().trim() : null);
        biz.setWebsite(dto.getWebsite() != null ? dto.getWebsite().trim() : null);

        Business saved = businessRepository.save(biz);

        String newVal = String.format("name: %s, email: %s, mobile: %s", saved.getBusinessName(), saved.getEmail(), saved.getMobile());
        auditLogService.log(userId, null, businessId, "SETTINGS", "SETTINGS_UPDATED",
                String.valueOf(businessId), "Updated business profile", null);

        return getBusinessProfile(businessId);
    }

    @Override
    @Transactional
    public String uploadLogo(Long businessId, MultipartFile file, Long userId) {
        if (file == null || file.isEmpty()) {
            throw new BadRequestException("Logo file cannot be empty");
        }

        if (file.getSize() > MAX_LOGO_SIZE) {
            throw new BadRequestException("Logo size cannot exceed 2 MB");
        }

        String contentType = file.getContentType();
        if (contentType == null || !ALLOWED_IMAGE_TYPES.contains(contentType.toLowerCase())) {
            throw new BadRequestException("Invalid image type. Only JPG, PNG, and WebP are allowed.");
        }

        try {
            Path uploadPath = Paths.get(UPLOAD_DIR);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }

            String ext = switch (contentType.toLowerCase()) {
                case "image/png" -> ".png";
                case "image/webp" -> ".webp";
                default -> ".jpg";
            };

            String filename = "logo_biz_" + businessId + "_" + System.currentTimeMillis() + ext;
            Path targetPath = uploadPath.resolve(filename).normalize();

            Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);

            String logoUrl = "/uploads/logos/" + filename;
            Business biz = getBusinessOrThrow(businessId);
            biz.setLogoUrl(logoUrl);
            businessRepository.save(biz);

            auditLogService.log(userId, null, businessId, "SETTINGS", "SETTINGS_UPDATED",
                    String.valueOf(businessId), "Uploaded business logo: " + filename, null);

            return logoUrl;
        } catch (IOException e) {
            log.error("Failed to store business logo: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to upload logo: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional
    public void removeLogo(Long businessId, Long userId) {
        Business biz = getBusinessOrThrow(businessId);
        biz.setLogoUrl(null);
        businessRepository.save(biz);

        auditLogService.log(userId, null, businessId, "SETTINGS", "SETTINGS_UPDATED",
                String.valueOf(businessId), "Removed business logo", null);
    }

    // =========================================================================
    // INVOICE SETTINGS
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public InvoiceSettingsDto getInvoiceSettings(Long businessId) {
        return InvoiceSettingsDto.builder()
                .invoiceTitle(getSetting(businessId, "invoice.title", "TAX INVOICE"))
                .invoiceFooter(getSetting(businessId, "invoice.footer", "Generated by RISHERP Enterprise Billing"))
                .showBusinessLogo(getBooleanSetting(businessId, "invoice.showBusinessLogo", true))
                .showBusinessAddress(getBooleanSetting(businessId, "invoice.showBusinessAddress", true))
                .showCustomerMobile(getBooleanSetting(businessId, "invoice.showCustomerMobile", true))
                .showCustomerAddress(getBooleanSetting(businessId, "invoice.showCustomerAddress", true))
                .showPaymentMode(getBooleanSetting(businessId, "invoice.showPaymentMode", true))
                .showNotes(getBooleanSetting(businessId, "invoice.showNotes", true))
                .showTerms(getBooleanSetting(businessId, "invoice.showTerms", true))
                .defaultInvoiceNotes(getSetting(businessId, "invoice.defaultNotes", ""))
                .defaultInvoiceTerms(getSetting(businessId, "invoice.defaultTerms",
                        "1. Goods once sold will not be taken back.\n2. Subject to local jurisdiction."))
                .build();
    }

    @Override
    @Transactional
    public InvoiceSettingsDto updateInvoiceSettings(Long businessId, InvoiceSettingsDto dto, Long userId) {
        saveSetting(businessId, "INVOICE", "invoice.title", dto.getInvoiceTitle(), "STRING", userId);
        saveSetting(businessId, "INVOICE", "invoice.footer", dto.getInvoiceFooter(), "STRING", userId);
        saveSetting(businessId, "INVOICE", "invoice.showBusinessLogo", String.valueOf(dto.getShowBusinessLogo()), "BOOLEAN", userId);
        saveSetting(businessId, "INVOICE", "invoice.showBusinessAddress", String.valueOf(dto.getShowBusinessAddress()), "BOOLEAN", userId);
        saveSetting(businessId, "INVOICE", "invoice.showCustomerMobile", String.valueOf(dto.getShowCustomerMobile()), "BOOLEAN", userId);
        saveSetting(businessId, "INVOICE", "invoice.showCustomerAddress", String.valueOf(dto.getShowCustomerAddress()), "BOOLEAN", userId);
        saveSetting(businessId, "INVOICE", "invoice.showPaymentMode", String.valueOf(dto.getShowPaymentMode()), "BOOLEAN", userId);
        saveSetting(businessId, "INVOICE", "invoice.showNotes", String.valueOf(dto.getShowNotes()), "BOOLEAN", userId);
        saveSetting(businessId, "INVOICE", "invoice.showTerms", String.valueOf(dto.getShowTerms()), "BOOLEAN", userId);
        saveSetting(businessId, "INVOICE", "invoice.defaultNotes", dto.getDefaultInvoiceNotes(), "TEXT", userId);
        saveSetting(businessId, "INVOICE", "invoice.defaultTerms", dto.getDefaultInvoiceTerms(), "TEXT", userId);

        auditLogService.log(userId, null, businessId, "SETTINGS", "SETTINGS_UPDATED",
                String.valueOf(businessId), "Updated invoice template and print settings", null);

        return getInvoiceSettings(businessId);
    }

    // =========================================================================
    // APPLICATION SETTINGS
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public ApplicationSettingsDto getApplicationSettings(Long businessId) {
        return ApplicationSettingsDto.builder()
                .defaultDateFormat(getSetting(businessId, "app.dateFormat", "dd/MM/yyyy"))
                .defaultCurrency(getSetting(businessId, "app.currency", "INR"))
                .defaultCurrencySymbol(getSetting(businessId, "app.currencySymbol", "₹"))
                .defaultPageSize(getIntegerSetting(businessId, "app.pageSize", 10))
                .defaultLanguage(getSetting(businessId, "app.language", "en"))
                .timezone(getSetting(businessId, "app.timezone", "Asia/Kolkata"))
                .enableNotifications(getBooleanSetting(businessId, "app.enableNotifications", true))
                .build();
    }

    @Override
    @Transactional
    public ApplicationSettingsDto updateApplicationSettings(Long businessId, ApplicationSettingsDto dto, Long userId) {
        // Validate timezone
        try {
            ZoneId.of(dto.getTimezone());
        } catch (Exception e) {
            throw new BadRequestException("Invalid timezone identifier: " + dto.getTimezone());
        }

        saveSetting(businessId, "APPLICATION", "app.dateFormat", dto.getDefaultDateFormat(), "STRING", userId);
        saveSetting(businessId, "APPLICATION", "app.currency", dto.getDefaultCurrency(), "STRING", userId);
        saveSetting(businessId, "APPLICATION", "app.currencySymbol", dto.getDefaultCurrencySymbol(), "STRING", userId);
        saveSetting(businessId, "APPLICATION", "app.pageSize", String.valueOf(dto.getDefaultPageSize()), "INTEGER", userId);
        saveSetting(businessId, "APPLICATION", "app.language", dto.getDefaultLanguage(), "STRING", userId);
        saveSetting(businessId, "APPLICATION", "app.timezone", dto.getTimezone(), "STRING", userId);
        saveSetting(businessId, "APPLICATION", "app.enableNotifications", String.valueOf(dto.getEnableNotifications()), "BOOLEAN", userId);

        auditLogService.log(userId, null, businessId, "SETTINGS", "SETTINGS_UPDATED",
                String.valueOf(businessId), "Updated application settings", null);

        return getApplicationSettings(businessId);
    }

    // =========================================================================
    // USER PREFERENCES
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public UserPreferenceDto getUserPreferences(Long userId) {
        return UserPreferenceDto.builder()
                .theme(getUserPref(userId, "theme", "light"))
                .sidebarCollapsed(Boolean.parseBoolean(getUserPref(userId, "sidebarCollapsed", "false")))
                .defaultDashboardDateRange(getUserPref(userId, "defaultDashboardDateRange", "this_month"))
                .defaultPageSize(Integer.parseInt(getUserPref(userId, "defaultPageSize", "10")))
                .build();
    }

    @Override
    @Transactional
    public UserPreferenceDto updateUserPreferences(Long userId, UserPreferenceDto dto) {
        saveUserPref(userId, "theme", dto.getTheme());
        saveUserPref(userId, "sidebarCollapsed", String.valueOf(dto.getSidebarCollapsed()));
        saveUserPref(userId, "defaultDashboardDateRange", dto.getDefaultDashboardDateRange());
        saveUserPref(userId, "defaultPageSize", String.valueOf(dto.getDefaultPageSize()));

        return getUserPreferences(userId);
    }

    // =========================================================================
    // SECURITY SETTINGS
    // =========================================================================

    @Override
    @Transactional(readOnly = true)
    public SecuritySettingsDto getSecuritySettings(Long businessId, Long userId) {
        User user = userRepository.findById(userId).orElse(null);
        String roleName = (user != null && user.getRole() != null) ? user.getRole().getName() : "STAFF";
        int permsCount = (user != null && user.getRole() != null && user.getRole().getPermissions() != null)
                ? user.getRole().getPermissions().size() : 0;

        long hours = jwtExpirationMs / (1000 * 60 * 60);
        String formatted = hours + " hours (" + (hours * 60) + " minutes)";

        return SecuritySettingsDto.builder()
                .tokenExpirationMs(jwtExpirationMs)
                .tokenExpirationFormatted(formatted)
                .minPasswordLength(6)
                .requireSpecialChar(false)
                .requireDigit(false)
                .requireUppercase(false)
                .currentRole(roleName)
                .totalPermissions(permsCount)
                .build();
    }

    // =========================================================================
    // PRIVATE HELPERS
    // =========================================================================

    private Business getBusinessOrThrow(Long businessId) {
        return businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found: " + businessId));
    }

    private String getSetting(Long businessId, String key, String defaultVal) {
        return systemSettingRepository.findByBusinessIdAndSettingKey(businessId, key)
                .map(SystemSetting::getSettingValue)
                .filter(v -> v != null && !v.isBlank())
                .orElse(defaultVal);
    }

    private boolean getBooleanSetting(Long businessId, String key, boolean defaultVal) {
        return systemSettingRepository.findByBusinessIdAndSettingKey(businessId, key)
                .map(SystemSetting::getSettingValue)
                .map(Boolean::parseBoolean)
                .orElse(defaultVal);
    }

    private int getIntegerSetting(Long businessId, String key, int defaultVal) {
        return systemSettingRepository.findByBusinessIdAndSettingKey(businessId, key)
                .map(SystemSetting::getSettingValue)
                .map(s -> {
                    try { return Integer.parseInt(s); } catch (Exception e) { return defaultVal; }
                })
                .orElse(defaultVal);
    }

    private void saveSetting(Long businessId, String group, String key, String val, String type, Long userId) {
        SystemSetting setting = systemSettingRepository.findByBusinessIdAndSettingKey(businessId, key)
                .orElseGet(() -> SystemSetting.builder()
                        .businessId(businessId)
                        .settingGroup(group)
                        .settingKey(key)
                        .dataType(type)
                        .build());

        setting.setSettingValue(val != null ? val : "");
        setting.setUpdatedBy(userId);
        systemSettingRepository.save(setting);
    }

    private String getUserPref(Long userId, String key, String defaultVal) {
        return userPreferenceRepository.findByUserIdAndPreferenceKey(userId, key)
                .map(UserPreference::getPreferenceValue)
                .filter(v -> v != null && !v.isBlank())
                .orElse(defaultVal);
    }

    private void saveUserPref(Long userId, String key, String val) {
        UserPreference pref = userPreferenceRepository.findByUserIdAndPreferenceKey(userId, key)
                .orElseGet(() -> UserPreference.builder()
                        .userId(userId)
                        .preferenceKey(key)
                        .build());

        pref.setPreferenceValue(val != null ? val : "");
        userPreferenceRepository.save(pref);
    }
}
