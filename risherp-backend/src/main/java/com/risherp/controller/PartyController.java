package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.party.*;
import com.risherp.entity.PartyStatus;
import com.risherp.entity.PartyType;
import com.risherp.security.UserPrincipal;
import com.risherp.service.PartyService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

/**
 * PartyController
 * REST APIs for Party Master management (Parties, Customers, Suppliers).
 * Requires authenticated JWT session and enforces tenant isolation.
 */
@Slf4j
@RestController
@RequestMapping("/api/parties")
@RequiredArgsConstructor
public class PartyController {

    private final PartyService partyService;

    @PostMapping
    public ResponseEntity<ApiResponse<PartyResponse>> createParty(
            @Valid @RequestBody CreatePartyRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        PartyResponse response = partyService.createParty(request, businessId, principal, clientIp);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Party created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<com.risherp.dto.PagedResponse<PartyResponse>>> getAllParties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) PartyType type,
            @RequestParam(required = false) PartyStatus status,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PartyResponse> parties = partyService.getAllParties(businessId, search, type, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Parties retrieved successfully", com.risherp.dto.PagedResponse.from(parties)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<PartySummaryDTO>> getPartySummary(Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        PartySummaryDTO summary = partyService.getPartySummary(businessId);
        return ResponseEntity.ok(ApiResponse.success("Party summary retrieved successfully", summary));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PartyResponse>> getPartyById(
            @PathVariable Long id,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));
        PartyResponse response = partyService.getPartyById(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Party retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<PartyResponse>> updateParty(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePartyRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        PartyResponse response = partyService.updateParty(id, request, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Party updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<PartyResponse>> updatePartyStatus(
            @PathVariable Long id,
            @Valid @RequestBody PartyStatusUpdateRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        PartyResponse response = partyService.updateStatus(id, request.getStatus(), businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Party status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteParty(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        partyService.deleteParty(id, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Party deleted successfully"));
    }

    private UserPrincipal getPrincipal(Authentication authentication) {
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            return (UserPrincipal) authentication.getPrincipal();
        }
        return null;
    }

    private Long getBusinessId(UserPrincipal principal) {
        if (principal != null && principal.getBusinessId() != null) {
            return principal.getBusinessId();
        }
        return 1L; // Development fallback
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
