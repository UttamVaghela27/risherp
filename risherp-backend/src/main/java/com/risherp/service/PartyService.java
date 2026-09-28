package com.risherp.service;

import com.risherp.dto.party.*;
import com.risherp.entity.PartyStatus;
import com.risherp.entity.PartyType;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

/**
 * PartyService
 * Contract for business party management and operations.
 */
public interface PartyService {

    PartyResponse createParty(CreatePartyRequest request, Long businessId, UserPrincipal principal, String clientIp);

    Page<PartyResponse> getAllParties(Long businessId, String search, PartyType type, PartyStatus status, Pageable pageable);

    PartyResponse getPartyById(Long id, Long businessId);

    PartyResponse updateParty(Long id, UpdatePartyRequest request, Long businessId, UserPrincipal principal, String clientIp);

    PartyResponse updateStatus(Long id, PartyStatus status, Long businessId, UserPrincipal principal, String clientIp);

    void deleteParty(Long id, Long businessId, UserPrincipal principal, String clientIp);

    PartySummaryDTO getPartySummary(Long businessId);
}
