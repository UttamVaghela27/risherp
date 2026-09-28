package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.category.CategoryResponse;
import com.risherp.dto.category.CategoryStatusUpdateRequest;
import com.risherp.dto.category.CreateCategoryRequest;
import com.risherp.dto.category.UpdateCategoryRequest;
import com.risherp.entity.CategoryStatus;
import com.risherp.security.UserPrincipal;
import com.risherp.service.CategoryService;
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
 * CategoryController
 * REST APIs for product category master classification.
 */
@Slf4j
@RestController
@RequestMapping("/api/categories")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @PostMapping
    public ResponseEntity<ApiResponse<CategoryResponse>> createCategory(
            @Valid @RequestBody CreateCategoryRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        CategoryResponse response = categoryService.createCategory(request, businessId, principal, clientIp);
        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(ApiResponse.success("Category created successfully", response));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<?>> getCategories(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) CategoryStatus status,
            @RequestParam(defaultValue = "categoryName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir,
            @RequestParam(defaultValue = "false") boolean allActive,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));

        if (allActive) {
            List<CategoryResponse> activeList = categoryService.getAllActiveCategories(businessId);
            return ResponseEntity.ok(ApiResponse.success("Active categories retrieved successfully", activeList));
        }

        int pageNum = page != null ? page : 0;
        int pageSize = size != null ? size : 10;
        Sort sort = sortDir.equalsIgnoreCase("desc") ? Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(pageNum, pageSize, sort);

        Page<CategoryResponse> categories = categoryService.getCategories(businessId, search, status, pageable);
        return ResponseEntity.ok(ApiResponse.success("Categories retrieved successfully", PagedResponse.from(categories)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> getCategoryById(
            @PathVariable Long id,
            Authentication authentication) {

        Long businessId = getBusinessId(getPrincipal(authentication));
        CategoryResponse response = categoryService.getCategoryById(id, businessId);
        return ResponseEntity.ok(ApiResponse.success("Category retrieved successfully", response));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody UpdateCategoryRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        CategoryResponse response = categoryService.updateCategory(id, request, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Category updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<CategoryResponse>> updateCategoryStatus(
            @PathVariable Long id,
            @Valid @RequestBody CategoryStatusUpdateRequest request,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        CategoryResponse response = categoryService.updateCategoryStatus(id, request.getStatus(), businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Category status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteCategory(
            @PathVariable Long id,
            Authentication authentication,
            HttpServletRequest servletRequest) {

        UserPrincipal principal = getPrincipal(authentication);
        Long businessId = getBusinessId(principal);
        String clientIp = extractClientIp(servletRequest);

        categoryService.deleteCategory(id, businessId, principal, clientIp);
        return ResponseEntity.ok(ApiResponse.success("Category deleted successfully"));
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
