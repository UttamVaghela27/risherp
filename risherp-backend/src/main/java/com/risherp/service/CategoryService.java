package com.risherp.service;

import com.risherp.dto.category.CategoryResponse;
import com.risherp.dto.category.CreateCategoryRequest;
import com.risherp.dto.category.UpdateCategoryRequest;
import com.risherp.entity.CategoryStatus;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * CategoryService
 * Business operations for product category classification.
 */
public interface CategoryService {

    CategoryResponse createCategory(CreateCategoryRequest request, Long businessId, UserPrincipal principal, String clientIp);

    Page<CategoryResponse> getCategories(Long businessId, String search, CategoryStatus status, Pageable pageable);

    List<CategoryResponse> getAllActiveCategories(Long businessId);

    CategoryResponse getCategoryById(Long id, Long businessId);

    CategoryResponse updateCategory(Long id, UpdateCategoryRequest request, Long businessId, UserPrincipal principal, String clientIp);

    CategoryResponse updateCategoryStatus(Long id, CategoryStatus status, Long businessId, UserPrincipal principal, String clientIp);

    void deleteCategory(Long id, Long businessId, UserPrincipal principal, String clientIp);
}
