package com.risherp.service.impl;

import com.risherp.dto.category.CategoryResponse;
import com.risherp.dto.category.CreateCategoryRequest;
import com.risherp.dto.category.UpdateCategoryRequest;
import com.risherp.entity.Business;
import com.risherp.entity.Category;
import com.risherp.entity.CategoryStatus;
import com.risherp.entity.ItemStatus;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.CategoryRepository;
import com.risherp.repository.ItemRepository;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.CategoryService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

/**
 * CategoryServiceImpl
 * Enterprise implementation of CategoryService.
 * Enforces unique active category naming, safe deactivation protection,
 * and comprehensive audit logging.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;
    private final ItemRepository itemRepository;
    private final BusinessRepository businessRepository;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public CategoryResponse createCategory(CreateCategoryRequest request, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Creating category: name='{}', businessId={}", request.getCategoryName(), businessId);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        String categoryName = request.getCategoryName().trim();

        // Unique active category name validation
        if (categoryRepository.existsByBusinessIdAndCategoryNameIgnoreCaseAndStatus(businessId, categoryName, CategoryStatus.ACTIVE)) {
            throw new DuplicateResourceException("An active category named '" + categoryName + "' already exists");
        }

        Category category = Category.builder()
                .business(business)
                .categoryName(categoryName)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : CategoryStatus.ACTIVE)
                .build();

        Category saved = categoryRepository.save(category);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "CATEGORY",
                    "CATEGORY_CREATED",
                    String.valueOf(saved.getId()),
                    "Created category " + saved.getCategoryName(),
                    clientIp
            );
        }

        log.info("Category created successfully: id={}", saved.getId());
        return toResponse(saved, 0);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CategoryResponse> getCategories(Long businessId, String search, CategoryStatus status, Pageable pageable) {
        Specification<Category> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                predicates.add(cb.like(cb.lower(root.get("categoryName")), searchLower));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Category> categoryPage = categoryRepository.findAll(spec, pageable);
        return categoryPage.map(cat -> {
            long count = itemRepository.countByBusinessIdAndCategoryId(businessId, cat.getId());
            return toResponse(cat, count);
        });
    }

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponse> getAllActiveCategories(Long businessId) {
        List<Category> list = categoryRepository.findByBusinessIdAndStatusOrderByCategoryNameAsc(businessId, CategoryStatus.ACTIVE);
        return list.stream()
                .map(cat -> toResponse(cat, 0))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponse getCategoryById(Long id, Long businessId) {
        Category category = categoryRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        long count = itemRepository.countByBusinessIdAndCategoryId(businessId, id);
        return toResponse(category, count);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategory(Long id, UpdateCategoryRequest request, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Updating category: id={}, businessId={}", id, businessId);
        Category category = categoryRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        String categoryName = request.getCategoryName().trim();

        // Duplicate name check excluding current entity
        if (categoryRepository.existsByBusinessIdAndCategoryNameIgnoreCaseAndStatusAndIdNot(businessId, categoryName, CategoryStatus.ACTIVE, id)) {
            throw new DuplicateResourceException("Another active category named '" + categoryName + "' already exists");
        }

        category.setCategoryName(categoryName);
        category.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getStatus() != null) {
            category.setStatus(request.getStatus());
        }

        Category updated = categoryRepository.save(category);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "CATEGORY",
                    "CATEGORY_UPDATED",
                    String.valueOf(updated.getId()),
                    "Updated category " + updated.getCategoryName(),
                    clientIp
            );
        }

        long count = itemRepository.countByBusinessIdAndCategoryId(businessId, id);
        return toResponse(updated, count);
    }

    @Override
    @Transactional
    public CategoryResponse updateCategoryStatus(Long id, CategoryStatus status, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Updating category status: id={}, newStatus={}, businessId={}", id, status, businessId);
        Category category = categoryRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        // Safety Guard: Prevent deactivating category if active items are assigned to it
        if (status == CategoryStatus.INACTIVE) {
            long activeItems = itemRepository.countByBusinessIdAndCategoryIdAndStatus(businessId, id, ItemStatus.ACTIVE);
            if (activeItems > 0) {
                throw new BadRequestException("Cannot deactivate category '" + category.getCategoryName() + "' because " + activeItems + " active item(s) are currently assigned to it. Reassign or deactivate those items first.");
            }
        }

        category.setStatus(status);
        Category updated = categoryRepository.save(category);

        if (principal != null) {
            String action = (status == CategoryStatus.INACTIVE) ? "CATEGORY_DEACTIVATED" : "CATEGORY_ACTIVATED";
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "CATEGORY",
                    action,
                    String.valueOf(updated.getId()),
                    "Changed status of category " + updated.getCategoryName() + " to " + status,
                    clientIp
            );
        }

        long count = itemRepository.countByBusinessIdAndCategoryId(businessId, id);
        return toResponse(updated, count);
    }

    @Override
    @Transactional
    public void deleteCategory(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        log.warn("Deleting category: id={}, businessId={}", id, businessId);
        Category category = categoryRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));

        long totalItems = itemRepository.countByBusinessIdAndCategoryId(businessId, id);
        if (totalItems > 0) {
            throw new BadRequestException("Cannot delete category '" + category.getCategoryName() + "' because " + totalItems + " item(s) are assigned to it. Please deactivate the category instead.");
        }

        categoryRepository.delete(category);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "CATEGORY",
                    "CATEGORY_DELETED",
                    String.valueOf(id),
                    "Deleted category " + category.getCategoryName(),
                    clientIp
            );
        }
        log.info("Category deleted successfully: id={}", id);
    }

    private CategoryResponse toResponse(Category category, long itemCount) {
        return CategoryResponse.builder()
                .id(category.getId())
                .categoryName(category.getCategoryName())
                .description(category.getDescription())
                .status(category.getStatus())
                .itemCount(itemCount)
                .createdAt(category.getCreatedAt())
                .updatedAt(category.getUpdatedAt())
                .build();
    }
}
