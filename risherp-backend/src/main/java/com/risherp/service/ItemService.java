package com.risherp.service;

import com.risherp.dto.item.CreateItemRequest;
import com.risherp.dto.item.ItemResponse;
import com.risherp.dto.item.ItemSummaryDTO;
import com.risherp.dto.item.UpdateItemRequest;
import com.risherp.entity.ItemStatus;
import com.risherp.entity.StockStatus;
import com.risherp.security.UserPrincipal;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * ItemService
 * Business interface for Item Master, barcode lookup, and stock foundation.
 */
public interface ItemService {

    ItemResponse createItem(CreateItemRequest request, Long businessId, UserPrincipal principal, String clientIp);

    Page<ItemResponse> getItems(Long businessId, String search, Long categoryId, ItemStatus status, StockStatus stockStatus, Pageable pageable);

    ItemResponse getItemById(Long id, Long businessId);

    ItemResponse updateItem(Long id, UpdateItemRequest request, Long businessId, UserPrincipal principal, String clientIp);

    ItemResponse updateItemStatus(Long id, ItemStatus status, Long businessId, UserPrincipal principal, String clientIp);

    void deleteItem(Long id, Long businessId, UserPrincipal principal, String clientIp);

    ItemResponse findByBarcode(String barcode, Long businessId);

    ItemSummaryDTO getItemSummary(Long businessId);

    List<String> getStandardUnits();
}
