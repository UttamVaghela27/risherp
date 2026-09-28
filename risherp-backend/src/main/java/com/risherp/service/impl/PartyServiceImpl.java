package com.risherp.service.impl;

import com.risherp.dto.party.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.PartyRepository;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.PartyService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * PartyServiceImpl
 * Production-ready implementation of PartyService.
 * Enforces multi-tenancy, concurrency-safe code generation,
 * directional balance rules, and audit logging.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class PartyServiceImpl implements PartyService {

    private final PartyRepository partyRepository;
    private final BusinessRepository businessRepository;
    private final AuditLogService auditLogService;
    private final com.risherp.service.FinancialPostingService financialPostingService;

    @Override
    @Transactional
    public PartyResponse createParty(CreatePartyRequest request, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Creating party: name='{}', type='{}', businessId={}", request.getPartyName(), request.getPartyType(), businessId);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        // Duplicate mobile check within this business
        if (partyRepository.existsByBusinessIdAndMobile(businessId, request.getMobile().trim())) {
            throw new DuplicateResourceException("Party with mobile number " + request.getMobile() + " already exists");
        }

        // Validate directional balance rule
        BigDecimal openingBalance = request.getOpeningBalance() != null ? request.getOpeningBalance() : BigDecimal.ZERO;
        OpeningBalanceType balanceType = request.getOpeningBalanceType();
        if (openingBalance.compareTo(BigDecimal.ZERO) == 0) {
            balanceType = OpeningBalanceType.NONE;
        } else if (openingBalance.compareTo(BigDecimal.ZERO) > 0) {
            if (balanceType == null || balanceType == OpeningBalanceType.NONE) {
                throw new BadRequestException("Opening balance greater than zero requires RECEIVABLE or PAYABLE");
            }
        }

        // Unique party code generation
        String partyCode = generateUniquePartyCode(businessId);

        Party party = Party.builder()
                .business(business)
                .partyCode(partyCode)
                .partyName(request.getPartyName().trim())
                .partyType(request.getPartyType())
                .contactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : null)
                .mobile(request.getMobile().trim())
                .alternateMobile(request.getAlternateMobile() != null && !request.getAlternateMobile().trim().isEmpty() ? request.getAlternateMobile().trim() : null)
                .email(request.getEmail() != null && !request.getEmail().trim().isEmpty() ? request.getEmail().trim().toLowerCase() : null)
                .address(request.getAddress() != null ? request.getAddress().trim() : null)
                .city(request.getCity() != null ? request.getCity().trim() : null)
                .state(request.getState() != null ? request.getState().trim() : null)
                .pincode(request.getPincode() != null && !request.getPincode().trim().isEmpty() ? request.getPincode().trim() : null)
                .openingBalance(openingBalance)
                .openingBalanceType(balanceType)
                .creditLimit(request.getCreditLimit() != null ? request.getCreditLimit() : BigDecimal.ZERO)
                .notes(request.getNotes() != null ? request.getNotes().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : PartyStatus.ACTIVE)
                .build();

        Party saved = partyRepository.save(party);

        // Financial Posting for Opening Balance
        financialPostingService.postOpeningBalance(saved, principal);

        // Audit Logging
        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "PARTY",
                    "PARTY_CREATED",
                    String.valueOf(saved.getId()),
                    "Created party " + saved.getPartyName() + " (" + saved.getPartyCode() + ") of type " + saved.getPartyType(),
                    clientIp
            );
        }

        log.info("Party created successfully: id={}, code={}", saved.getId(), saved.getPartyCode());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<PartyResponse> getAllParties(Long businessId, String search, PartyType type, PartyStatus status, Pageable pageable) {
        log.debug("Fetching parties: businessId={}, search={}, type={}, status={}, page={}", businessId, search, type, status, pageable.getPageNumber());

        Specification<Party> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("partyName")), searchLower);
                Predicate codeMatch = cb.like(cb.lower(root.get("partyCode")), searchLower);
                Predicate mobileMatch = cb.like(root.get("mobile"), "%" + search.trim() + "%");
                predicates.add(cb.or(nameMatch, codeMatch, mobileMatch));
            }

            if (type != null) {
                predicates.add(cb.equal(root.get("partyType"), type));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Party> partyPage = partyRepository.findAll(spec, pageable);
        return partyPage.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PartyResponse getPartyById(Long id, Long businessId) {
        log.debug("Fetching party: id={}, businessId={}", id, businessId);
        Party party = partyRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found with id: " + id));
        return toResponse(party);
    }

    @Override
    @Transactional
    public PartyResponse updateParty(Long id, UpdatePartyRequest request, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Updating party: id={}, businessId={}", id, businessId);
        Party party = partyRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found with id: " + id));

        // Duplicate mobile check excluding current party
        if (partyRepository.existsByBusinessIdAndMobileAndIdNot(businessId, request.getMobile().trim(), id)) {
            throw new DuplicateResourceException("Another party with mobile number " + request.getMobile() + " already exists");
        }

        // Validate directional balance rule
        BigDecimal openingBalance = request.getOpeningBalance() != null ? request.getOpeningBalance() : party.getOpeningBalance();
        OpeningBalanceType balanceType = request.getOpeningBalanceType() != null ? request.getOpeningBalanceType() : party.getOpeningBalanceType();

        if (openingBalance.compareTo(BigDecimal.ZERO) == 0) {
            balanceType = OpeningBalanceType.NONE;
        } else if (openingBalance.compareTo(BigDecimal.ZERO) > 0) {
            if (balanceType == null || balanceType == OpeningBalanceType.NONE) {
                throw new BadRequestException("Opening balance greater than zero requires RECEIVABLE or PAYABLE");
            }
        }

        party.setPartyName(request.getPartyName().trim());
        party.setPartyType(request.getPartyType());
        party.setContactPerson(request.getContactPerson() != null ? request.getContactPerson().trim() : null);
        party.setMobile(request.getMobile().trim());
        party.setAlternateMobile(request.getAlternateMobile() != null && !request.getAlternateMobile().trim().isEmpty() ? request.getAlternateMobile().trim() : null);
        party.setEmail(request.getEmail() != null && !request.getEmail().trim().isEmpty() ? request.getEmail().trim().toLowerCase() : null);
        party.setAddress(request.getAddress() != null ? request.getAddress().trim() : null);
        party.setCity(request.getCity() != null ? request.getCity().trim() : null);
        party.setState(request.getState() != null ? request.getState().trim() : null);
        party.setPincode(request.getPincode() != null && !request.getPincode().trim().isEmpty() ? request.getPincode().trim() : null);
        party.setOpeningBalance(openingBalance);
        party.setOpeningBalanceType(balanceType);
        if (request.getCreditLimit() != null) {
            party.setCreditLimit(request.getCreditLimit());
        }
        party.setNotes(request.getNotes() != null ? request.getNotes().trim() : null);
        if (request.getStatus() != null) {
            party.setStatus(request.getStatus());
        }

        Party updated = partyRepository.save(party);

        // Financial Posting for Opening Balance update
        financialPostingService.postOpeningBalance(updated, principal);

        // Audit Logging
        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "PARTY",
                    "PARTY_UPDATED",
                    String.valueOf(updated.getId()),
                    "Updated party details for " + updated.getPartyName() + " (" + updated.getPartyCode() + ")",
                    clientIp
            );
        }

        log.info("Party updated successfully: id={}", updated.getId());
        return toResponse(updated);
    }

    @Override
    @Transactional
    public PartyResponse updateStatus(Long id, PartyStatus status, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Updating party status: id={}, newStatus={}, businessId={}", id, status, businessId);
        Party party = partyRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found with id: " + id));

        party.setStatus(status);
        Party updated = partyRepository.save(party);

        // Audit Logging
        if (principal != null) {
            String action = (status == PartyStatus.INACTIVE) ? "PARTY_DEACTIVATED" : "PARTY_ACTIVATED";
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "PARTY",
                    action,
                    String.valueOf(updated.getId()),
                    "Changed status of party " + updated.getPartyName() + " (" + updated.getPartyCode() + ") to " + status,
                    clientIp
            );
        }

        return toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteParty(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        log.warn("Deleting party: id={}, businessId={}", id, businessId);
        Party party = partyRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found with id: " + id));

        // In future phases: check if party has sales, purchases, or ledger entries.
        // For Phase 5: delete record safely.
        partyRepository.delete(party);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "PARTY",
                    "PARTY_DELETED",
                    String.valueOf(id),
                    "Deleted party " + party.getPartyName() + " (" + party.getPartyCode() + ")",
                    clientIp
            );
        }
        log.info("Party deleted successfully: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public PartySummaryDTO getPartySummary(Long businessId) {
        long totalParties = partyRepository.countByBusinessId(businessId);
        long totalCustomers = partyRepository.countByBusinessIdAndPartyType(businessId, PartyType.CUSTOMER);
        long totalSuppliers = partyRepository.countByBusinessIdAndPartyType(businessId, PartyType.SUPPLIER);
        long totalBoth = partyRepository.countByBusinessIdAndPartyType(businessId, PartyType.BOTH);
        long activeParties = partyRepository.countByBusinessIdAndStatus(businessId, PartyStatus.ACTIVE);
        long inactiveParties = partyRepository.countByBusinessIdAndStatus(businessId, PartyStatus.INACTIVE);

        BigDecimal totalReceivables = partyRepository.sumOpeningBalanceByBusinessIdAndType(businessId, OpeningBalanceType.RECEIVABLE);
        BigDecimal totalPayables = partyRepository.sumOpeningBalanceByBusinessIdAndType(businessId, OpeningBalanceType.PAYABLE);

        return PartySummaryDTO.builder()
                .totalParties(totalParties)
                .totalCustomers(totalCustomers)
                .totalSuppliers(totalSuppliers)
                .totalBoth(totalBoth)
                .activeParties(activeParties)
                .inactiveParties(inactiveParties)
                .totalReceivables(totalReceivables != null ? totalReceivables : BigDecimal.ZERO)
                .totalPayables(totalPayables != null ? totalPayables : BigDecimal.ZERO)
                .build();
    }

    private synchronized String generateUniquePartyCode(Long businessId) {
        Long maxId = partyRepository.getMaxId();
        long nextNum = (maxId != null ? maxId : 0) + 1;
        String code = String.format("PTY-%06d", nextNum);

        while (partyRepository.existsByBusinessIdAndPartyCode(businessId, code)) {
            nextNum++;
            code = String.format("PTY-%06d", nextNum);
        }
        return code;
    }

    private PartyResponse toResponse(Party party) {
        return PartyResponse.builder()
                .id(party.getId())
                .partyCode(party.getPartyCode())
                .partyName(party.getPartyName())
                .partyType(party.getPartyType())
                .contactPerson(party.getContactPerson())
                .mobile(party.getMobile())
                .alternateMobile(party.getAlternateMobile())
                .email(party.getEmail())
                .address(party.getAddress())
                .city(party.getCity())
                .state(party.getState())
                .pincode(party.getPincode())
                .openingBalance(party.getOpeningBalance())
                .openingBalanceType(party.getOpeningBalanceType())
                .creditLimit(party.getCreditLimit())
                .notes(party.getNotes())
                .status(party.getStatus())
                .createdAt(party.getCreatedAt())
                .updatedAt(party.getUpdatedAt())
                .build();
    }
}
