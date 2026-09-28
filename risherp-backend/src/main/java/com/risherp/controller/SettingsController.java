package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.settings.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.DocumentSequenceService;
import com.risherp.service.SettingsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/settings")
@RequiredArgsConstructor
public class SettingsController {

    private final SettingsService settingsService;
    private final DocumentSequenceService documentSequenceService;

    // =========================================================================
    // BUSINESS PROFILE
    // =========================================================================

    @GetMapping("/business")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('BUSINESS_SETTINGS_VIEW') or hasAuthority('SETTING_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BusinessProfileDto>> getBusinessProfile(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Business profile retrieved",
                settingsService.getBusinessProfile(principal.getBusinessId())));
    }

    @PutMapping("/business")
    @PreAuthorize("hasAuthority('SETTINGS_UPDATE') or hasAuthority('BUSINESS_SETTINGS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BusinessProfileDto>> updateBusinessProfile(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody BusinessProfileDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Business profile updated",
                settingsService.updateBusinessProfile(principal.getBusinessId(), dto, principal.getId())));
    }

    @PostMapping("/business/logo")
    @PreAuthorize("hasAuthority('SETTINGS_UPDATE') or hasAuthority('BUSINESS_SETTINGS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<String>> uploadLogo(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file) {
        String logoUrl = settingsService.uploadLogo(principal.getBusinessId(), file, principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Logo uploaded successfully", logoUrl));
    }

    @DeleteMapping("/business/logo")
    @PreAuthorize("hasAuthority('SETTINGS_UPDATE') or hasAuthority('BUSINESS_SETTINGS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> removeLogo(
            @AuthenticationPrincipal UserPrincipal principal) {
        settingsService.removeLogo(principal.getBusinessId(), principal.getId());
        return ResponseEntity.ok(ApiResponse.success("Logo removed successfully", null));
    }

    // =========================================================================
    // INVOICE SETTINGS
    // =========================================================================

    @GetMapping("/invoice")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('INVOICE_SETTINGS_VIEW') or hasAuthority('SETTING_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceSettingsDto>> getInvoiceSettings(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Invoice settings retrieved",
                settingsService.getInvoiceSettings(principal.getBusinessId())));
    }

    @PutMapping("/invoice")
    @PreAuthorize("hasAuthority('SETTINGS_UPDATE') or hasAuthority('INVOICE_SETTINGS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<InvoiceSettingsDto>> updateInvoiceSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody InvoiceSettingsDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Invoice settings updated",
                settingsService.updateInvoiceSettings(principal.getBusinessId(), dto, principal.getId())));
    }

    // =========================================================================
    // NUMBERING SETTINGS
    // =========================================================================

    @GetMapping("/numbering")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('NUMBERING_SETTINGS_VIEW') or hasAuthority('SETTING_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<NumberingSettingDto>>> getNumberingSettings(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Numbering configurations retrieved",
                documentSequenceService.getNumberingSettings(principal.getBusinessId())));
    }

    @PutMapping("/numbering")
    @PreAuthorize("hasAuthority('SETTINGS_UPDATE') or hasAuthority('NUMBERING_SETTINGS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<NumberingSettingDto>> updateNumberingSetting(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NumberingSettingDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Numbering configuration updated",
                documentSequenceService.updateNumberingSetting(principal.getBusinessId(), dto)));
    }

    // =========================================================================
    // APPLICATION SETTINGS
    // =========================================================================

    @GetMapping("/application")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('SETTING_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationSettingsDto>> getApplicationSettings(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Application settings retrieved",
                settingsService.getApplicationSettings(principal.getBusinessId())));
    }

    @PutMapping("/application")
    @PreAuthorize("hasAuthority('SETTINGS_UPDATE') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<ApplicationSettingsDto>> updateApplicationSettings(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody ApplicationSettingsDto dto) {
        return ResponseEntity.ok(ApiResponse.success("Application settings updated",
                settingsService.updateApplicationSettings(principal.getBusinessId(), dto, principal.getId())));
    }

    // =========================================================================
    // USER PREFERENCES
    // =========================================================================

    @GetMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceDto>> getUserPreferences(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("User preferences retrieved",
                settingsService.getUserPreferences(principal.getId())));
    }

    @PutMapping("/preferences")
    public ResponseEntity<ApiResponse<UserPreferenceDto>> updateUserPreferences(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody UserPreferenceDto dto) {
        return ResponseEntity.ok(ApiResponse.success("User preferences updated",
                settingsService.updateUserPreferences(principal.getId(), dto)));
    }

    // =========================================================================
    // SECURITY SETTINGS
    // =========================================================================

    @GetMapping("/security")
    @PreAuthorize("hasAuthority('SETTINGS_VIEW') or hasAuthority('SETTING_VIEW') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<SecuritySettingsDto>> getSecuritySettings(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ResponseEntity.ok(ApiResponse.success("Security settings retrieved",
                settingsService.getSecuritySettings(principal.getBusinessId(), principal.getId())));
    }
}
