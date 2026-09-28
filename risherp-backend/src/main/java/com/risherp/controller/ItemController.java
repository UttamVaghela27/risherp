package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.item.*;
import com.risherp.entity.ItemStatus;
import com.risherp.entity.StockStatus;
import com.risherp.security.UserPrincipal;
import com.risherp.service.ItemService;
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

import java.util.List;

/**
 * ItemController
 * REST APIs for Item Master, Barcode Search, and Inventory Foundation.
 */
@Slf4j
@RestController
@RequestMapping("/api/items")
@RequiredArgsConstructor
public class ItemController {

    private final ItemService itemService;

    @PostMapping
    public ResponseEntity<ApiResponse<ItemResponse>> createItem(
            @Valid @RequestBody CreateItemRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        ItemResponse response = itemService.createItem(request, businessId, principal, clientIp);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Item created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<PagedResponse<ItemResponse>>> getAllItems(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) ItemStatus status,
            @RequestParam(required = false) StockStatus stockStatus,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<ItemResponse> items = itemService.getItems(businessId, search, categoryId, status, stockStatus, pageable);
        return ResponseEntity.ok(ApiResponse.success("Items retrieved successfully", PagedResponse.from(items)));
    }

    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<ItemSummaryDTO>> getItemSummary(Authentication authentication) {
        Long businessId = getBusinessId(getPrincipal(authentication));
        ItemSummaryDTO summary = itemService.getItemSummary(businessId);
        return ResponseEntity.ok(ApiResponse.success("Item summary retrieved successfully", summary));
    }

    @GetMapping("/units")
    public ResponseEntity<ApiResponse<List<String>>> getStandardUnits() {
        List<String> units = itemService.getStandardUnits();
        return ResponseEntity.ok(ApiResponse.success("Standard units retrieved successfully", units));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemByBarcode(
            @PathVariable String barcode,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));
        ItemResponse response = itemService.findByBarcode(barcode, businessId);
        return ResponseEntity.ok(ApiResponse.success("Item retrieved successfully by barcode", response));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> getItemById(
            @PathVariable Long id,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));
        ItemResponse response = itemService.getItemById(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Item retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItem(
            @PathVariable Long id,
            @Valid @RequestBody UpdateItemRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        ItemResponse response = itemService.updateItem(id, request, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Item updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<ItemResponse>> updateItemStatus(
            @PathVariable Long id,
            @Valid @RequestBody ItemStatusUpdateRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        ItemResponse response = itemService.updateItemStatus(id, request.getStatus(), businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Item status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteItem(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        itemService.deleteItem(id, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Item deleted successfully"));
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
        return 1L;
    }

    private String extractClientIp(HttpServletRequest request) {
        String xForwardedFor = request.getHeader("X-Forwarded-For");
        if (xForwardedFor != null && !xForwardedFor.isEmpty() && !"unknown".equalsIgnoreCase(xForwardedFor)) {
            return xForwardedFor.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
