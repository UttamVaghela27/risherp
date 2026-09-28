package com.risherp.service;

import com.risherp.dto.settings.NumberingSettingDto;

import java.util.List;

public interface DocumentSequenceService {

    /**
     * Atomically generates the next document number with pessimistic locking.
     */
    String generateNextNumber(Long businessId, String documentType);

    /**
     * Gets all numbering configurations for the given business.
     */
    List<NumberingSettingDto> getNumberingSettings(Long businessId);

    /**
     * Updates sequence numbering settings for a specific document type.
     * Historical documents remain completely unchanged.
     */
    NumberingSettingDto updateNumberingSetting(Long businessId, NumberingSettingDto dto);
}
