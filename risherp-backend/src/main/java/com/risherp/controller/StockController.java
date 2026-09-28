package com.risherp.controller;

import com.risherp.dto.ApiResponse;
import com.risherp.dto.PagedResponse;
import com.risherp.dto.stock.StockTransactionResponse;
import com.risherp.security.UserPrincipal;
import com.risherp.service.StockService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

/**
 * StockController — Phase 11 Stock Ledger REST API
 *
 * GET /api/stock/ledger             — all items, paginated, filterable
 * GET /api/stock/ledger/item/{id}   — single item history
 */
@Slf4j
@RestController
@RequestMapping("/api/stock")
@RequiredArgsConstructor
public class StockController {

    private final StockService stockService;

    // -------------------------------------------------------------------------
    // ALL-ITEMS LEDGER
    // -------------------------------------------------------------------------

    @GetMapping("/ledger")
    public ResponseEntity<ApiResponse<PagedResponse<StockTransactionResponse>>> getStockLedger(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam(required = false) Long itemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) String referenceType,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("Stock ledger request: businessId={}, itemId={}, fromDate={}, toDate={}, refType={}",
                principal.getBusinessId(), itemId, fromDate, toDate, referenceType);

        Page<StockTransactionResponse> result = stockService.getStockLedger(
                principal.getBusinessId(),
                itemId,
                fromDate,
                toDate,
                referenceType,
                page,
                Math.min(size, 100)
        );

        return ResponseEntity.ok(
                ApiResponse.success("Stock ledger retrieved successfully", PagedResponse.from(result))
        );
    }

    // -------------------------------------------------------------------------
    // SINGLE-ITEM LEDGER
    // -------------------------------------------------------------------------

    @GetMapping("/ledger/item/{itemId}")
    public ResponseEntity<ApiResponse<PagedResponse<StockTransactionResponse>>> getItemStockLedger(
            @AuthenticationPrincipal UserPrincipal principal,
            @PathVariable Long itemId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        log.debug("Item stock ledger request: itemId={}, businessId={}", itemId, principal.getBusinessId());

        Page<StockTransactionResponse> result = stockService.getStockLedger(
                principal.getBusinessId(),
                itemId,
                fromDate,
                toDate,
                null,
                page,
                Math.min(size, 100)
        );

        return ResponseEntity.ok(
                ApiResponse.success("Item stock ledger retrieved successfully", PagedResponse.from(result))
        );
    }
}
