package com.risherp.service;

import com.risherp.dto.settings.*;
import org.springframework.web.multipart.MultipartFile;

public interface SettingsService {

    BusinessProfileDto getBusinessProfile(Long businessId);

    BusinessProfileDto updateBusinessProfile(Long businessId, BusinessProfileDto dto, Long userId);

    String uploadLogo(Long businessId, MultipartFile file, Long userId);

    void removeLogo(Long businessId, Long userId);

    InvoiceSettingsDto getInvoiceSettings(Long businessId);

    InvoiceSettingsDto updateInvoiceSettings(Long businessId, InvoiceSettingsDto dto, Long userId);

    ApplicationSettingsDto getApplicationSettings(Long businessId);

    ApplicationSettingsDto updateApplicationSettings(Long businessId, ApplicationSettingsDto dto, Long userId);

    UserPreferenceDto getUserPreferences(Long userId);

    UserPreferenceDto updateUserPreferences(Long userId, UserPreferenceDto dto);

    SecuritySettingsDto getSecuritySettings(Long businessId, Long userId);
}
