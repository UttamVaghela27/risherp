package com.risherp.service.impl;

import com.risherp.dto.item.*;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.CategoryRepository;
import com.risherp.repository.ItemRepository;
import com.risherp.security.UserPrincipal;
import com.risherp.service.AuditLogService;
import com.risherp.service.ItemService;
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
 * ItemServiceImpl
 * Enterprise implementation of ItemService.
 * Enforces auto-generated item codes, barcode uniqueness,
 * immutable stock during normal item edit, and stock status calculation.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class ItemServiceImpl implements ItemService {

    private final ItemRepository itemRepository;
    private final CategoryRepository categoryRepository;
    private final BusinessRepository businessRepository;
    private final AuditLogService auditLogService;

    private static final List<String> STANDARD_UNITS = List.of(
            "PCS", "KG", "GRAM", "LITRE", "ML", "BOX", "PACK", "METER", "FEET", "DOZEN", "SET", "ROLL", "CAN"
    );

    @Override
    @Transactional
    public ItemResponse createItem(CreateItemRequest request, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Creating item: name='{}', categoryId={}, businessId={}", request.getItemName(), request.getCategoryId(), businessId);

        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Business not found with id: " + businessId));

        Category category = categoryRepository.findByIdAndBusinessId(request.getCategoryId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String barcode = null;
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            barcode = request.getBarcode().trim();
            if (itemRepository.existsByBusinessIdAndBarcode(businessId, barcode)) {
                throw new DuplicateResourceException("Item with barcode '" + barcode + "' already exists");
            }
        }

        // Concurrency-safe unique item code generation
        String itemCode = generateUniqueItemCode(businessId);

        BigDecimal initialStock = request.getInitialStock() != null ? request.getInitialStock() : BigDecimal.ZERO;
        BigDecimal minimumStock = request.getMinimumStock() != null ? request.getMinimumStock() : BigDecimal.ZERO;

        Item item = Item.builder()
                .business(business)
                .itemCode(itemCode)
                .itemName(request.getItemName().trim())
                .barcode(barcode)
                .category(category)
                .companyName(request.getCompanyName() != null ? request.getCompanyName().trim() : null)
                .unit(request.getUnit().trim().toUpperCase())
                .purchaseRate(request.getPurchaseRate())
                .saleRate(request.getSaleRate())
                .currentStock(initialStock)
                .minimumStock(minimumStock)
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(request.getStatus() != null ? request.getStatus() : ItemStatus.ACTIVE)
                .build();

        Item saved = itemRepository.save(item);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "ITEM",
                    "ITEM_CREATED",
                    String.valueOf(saved.getId()),
                    "Created item " + saved.getItemName() + " (" + saved.getItemCode() + ")",
                    clientIp
            );
        }

        log.info("Item created successfully: id={}, code={}", saved.getId(), saved.getItemCode());
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ItemResponse> getItems(Long businessId, String search, Long categoryId, ItemStatus status, StockStatus stockStatus, Pageable pageable) {
        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (search != null && !search.trim().isEmpty()) {
                String searchLower = "%" + search.trim().toLowerCase() + "%";
                Predicate nameMatch = cb.like(cb.lower(root.get("itemName")), searchLower);
                Predicate codeMatch = cb.like(cb.lower(root.get("itemCode")), searchLower);
                Predicate barcodeMatch = cb.like(cb.lower(root.get("barcode")), searchLower);
                Predicate companyMatch = cb.like(cb.lower(root.get("companyName")), searchLower);
                predicates.add(cb.or(nameMatch, codeMatch, barcodeMatch, companyMatch));
            }

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            if (stockStatus != null) {
                switch (stockStatus) {
                    case OUT_OF_STOCK:
                        predicates.add(cb.lessThanOrEqualTo(root.get("currentStock"), BigDecimal.ZERO));
                        break;
                    case LOW_STOCK:
                        predicates.add(cb.and(
                                cb.greaterThan(root.get("currentStock"), BigDecimal.ZERO),
                                cb.lessThanOrEqualTo(root.get("currentStock"), root.get("minimumStock"))
                        ));
                        break;
                    case IN_STOCK:
                        predicates.add(cb.greaterThan(root.get("currentStock"), root.get("minimumStock")));
                        break;
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Item> itemPage = itemRepository.findAll(spec, pageable);
        return itemPage.map(this::toResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse getItemById(Long id, Long businessId) {
        Item item = itemRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));
        return toResponse(item);
    }

    @Override
    @Transactional
    public ItemResponse updateItem(Long id, UpdateItemRequest request, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Updating item: id={}, businessId={}", id, businessId);
        Item item = itemRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        Category category = categoryRepository.findByIdAndBusinessId(request.getCategoryId(), businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        String barcode = null;
        if (request.getBarcode() != null && !request.getBarcode().trim().isEmpty()) {
            barcode = request.getBarcode().trim();
            if (itemRepository.existsByBusinessIdAndBarcodeAndIdNot(businessId, barcode, id)) {
                throw new DuplicateResourceException("Another item with barcode '" + barcode + "' already exists");
            }
        }

        item.setItemName(request.getItemName().trim());
        item.setBarcode(barcode);
        item.setCategory(category);
        item.setCompanyName(request.getCompanyName() != null ? request.getCompanyName().trim() : null);
        item.setUnit(request.getUnit().trim().toUpperCase());
        item.setPurchaseRate(request.getPurchaseRate());
        item.setSaleRate(request.getSaleRate());
        // NOTE: currentStock is strictly NOT modified here!
        if (request.getMinimumStock() != null) {
            item.setMinimumStock(request.getMinimumStock());
        }
        item.setDescription(request.getDescription() != null ? request.getDescription().trim() : null);
        if (request.getStatus() != null) {
            item.setStatus(request.getStatus());
        }

        Item updated = itemRepository.save(item);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "ITEM",
                    "ITEM_UPDATED",
                    String.valueOf(updated.getId()),
                    "Updated item details for " + updated.getItemName() + " (" + updated.getItemCode() + ")",
                    clientIp
            );
        }

        log.info("Item updated successfully: id={}", updated.getId());
        return toResponse(updated);
    }

    @Override
    @Transactional
    public ItemResponse updateItemStatus(Long id, ItemStatus status, Long businessId, UserPrincipal principal, String clientIp) {
        log.info("Updating item status: id={}, newStatus={}, businessId={}", id, status, businessId);
        Item item = itemRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        item.setStatus(status);
        Item updated = itemRepository.save(item);

        if (principal != null) {
            String action = (status == ItemStatus.INACTIVE) ? "ITEM_DEACTIVATED" : "ITEM_ACTIVATED";
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "ITEM",
                    action,
                    String.valueOf(updated.getId()),
                    "Changed status of item " + updated.getItemName() + " (" + updated.getItemCode() + ") to " + status,
                    clientIp
            );
        }

        return toResponse(updated);
    }

    @Override
    @Transactional
    public void deleteItem(Long id, Long businessId, UserPrincipal principal, String clientIp) {
        log.warn("Deleting item: id={}, businessId={}", id, businessId);
        Item item = itemRepository.findByIdAndBusinessId(id, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with id: " + id));

        // In Phase 6: physical delete allowed only if no sales/purchases reference it.
        // For safety, delete the item record.
        itemRepository.delete(item);

        if (principal != null) {
            auditLogService.log(
                    principal.getId(),
                    principal.getEmail(),
                    businessId,
                    "ITEM",
                    "ITEM_DELETED",
                    String.valueOf(id),
                    "Deleted item " + item.getItemName() + " (" + item.getItemCode() + ")",
                    clientIp
            );
        }
        log.info("Item deleted successfully: id={}", id);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemResponse findByBarcode(String barcode, Long businessId) {
        if (barcode == null || barcode.trim().isEmpty()) {
            throw new BadRequestException("Barcode must be provided");
        }
        Item item = itemRepository.findByBusinessIdAndBarcode(businessId, barcode.trim())
                .orElseThrow(() -> new ResourceNotFoundException("Item not found with barcode: " + barcode.trim()));
        return toResponse(item);
    }

    @Override
    @Transactional(readOnly = true)
    public ItemSummaryDTO getItemSummary(Long businessId) {
        long totalItems = itemRepository.countByBusinessId(businessId);
        long activeItems = itemRepository.countByBusinessIdAndStatus(businessId, ItemStatus.ACTIVE);
        long inactiveItems = itemRepository.countByBusinessIdAndStatus(businessId, ItemStatus.INACTIVE);
        long inStockCount = itemRepository.countInStock(businessId);
        long lowStockCount = itemRepository.countLowStock(businessId);
        long outOfStockCount = itemRepository.countOutOfStock(businessId);
        BigDecimal totalStockValue = itemRepository.sumStockValueByBusinessId(businessId);

        return ItemSummaryDTO.builder()
                .totalItems(totalItems)
                .activeItems(activeItems)
                .inactiveItems(inactiveItems)
                .inStockCount(inStockCount)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .totalStockValue(totalStockValue != null ? totalStockValue : BigDecimal.ZERO)
                .build();
    }

    @Override
    public List<String> getStandardUnits() {
        return STANDARD_UNITS;
    }

    private synchronized String generateUniqueItemCode(Long businessId) {
        Long maxId = itemRepository.getMaxId();
        long nextNum = (maxId != null ? maxId : 0) + 1;
        String code = String.format("ITM-%06d", nextNum);

        while (itemRepository.existsByBusinessIdAndItemCode(businessId, code)) {
            nextNum++;
            code = String.format("ITM-%06d", nextNum);
        }
        return code;
    }

    private ItemResponse toResponse(Item item) {
        return ItemResponse.builder()
                .id(item.getId())
                .itemCode(item.getItemCode())
                .itemName(item.getItemName())
                .barcode(item.getBarcode())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getCategoryName() : null)
                .companyName(item.getCompanyName())
                .unit(item.getUnit())
                .purchaseRate(item.getPurchaseRate())
                .saleRate(item.getSaleRate())
                .currentStock(item.getCurrentStock())
                .minimumStock(item.getMinimumStock())
                .stockStatus(item.getStockStatus())
                .stockValue(item.getStockValue())
                .description(item.getDescription())
                .status(item.getStatus())
                .createdAt(item.getCreatedAt())
                .updatedAt(item.getUpdatedAt())
                .build();
    }
}
