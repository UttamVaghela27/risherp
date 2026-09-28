package com.risherp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.risherp.dto.purchase.CreatePurchaseRequest;
import com.risherp.dto.purchase.PurchaseItemRequest;
import com.risherp.dto.purchase.PurchaseItemResponse;
import com.risherp.dto.purchase.PurchaseResponse;
import com.risherp.dto.purchase.PurchaseSummaryDTO;
import com.risherp.entity.PaymentMode;
import com.risherp.entity.PaymentStatus;
import com.risherp.entity.PurchaseStatus;
import com.risherp.entity.PurchaseType;
import com.risherp.exception.GlobalExceptionHandler;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.service.PurchaseService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class PurchaseControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private PurchaseService purchaseService;

    @InjectMocks
    private PurchaseController purchaseController;

    private PurchaseResponse samplePurchase;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(purchaseController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        samplePurchase = PurchaseResponse.builder()
                .id(1L)
                .purchaseNumber("PUR-000001")
                .partyId(20L)
                .partyName("ABC Supplier")
                .partyCode("SUP-001")
                .purchaseDate(LocalDate.now())
                .purchaseType(PurchaseType.CREDIT)
                .subtotal(new BigDecimal("900.00"))
                .itemDiscount(new BigDecimal("100.00"))
                .overallDiscount(BigDecimal.ZERO)
                .totalDiscount(new BigDecimal("100.00"))
                .grandTotal(new BigDecimal("900.00"))
                .paidAmount(new BigDecimal("400.00"))
                .balanceAmount(new BigDecimal("500.00"))
                .paymentStatus(PaymentStatus.PARTIAL)
                .paymentMode(PaymentMode.CASH)
                .status(PurchaseStatus.COMPLETED)
                .items(List.of(
                        PurchaseItemResponse.builder()
                                .id(1L)
                                .itemId(100L)
                                .itemNameSnapshot("Product A")
                                .itemCodeSnapshot("PRD-001")
                                .unitSnapshot("PCS")
                                .quantity(new BigDecimal("10.000"))
                                .rate(new BigDecimal("100.00"))
                                .lineTotal(new BigDecimal("900.00"))
                                .build()
                ))
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/purchases/{id} — Returns 200 with purchase details")
    void testGetPurchaseById_Success() throws Exception {
        when(purchaseService.getPurchaseById(eq(1L), anyLong())).thenReturn(samplePurchase);

        mockMvc.perform(get("/api/purchases/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.purchaseNumber").value("PUR-000001"))
                .andExpect(jsonPath("$.data.grandTotal").value(900.00))
                .andExpect(jsonPath("$.data.paidAmount").value(400.00))
                .andExpect(jsonPath("$.data.balanceAmount").value(500.00))
                .andExpect(jsonPath("$.data.paymentStatus").value("PARTIAL"));
    }

    @Test
    @DisplayName("GET /api/purchases/number/{purchaseNumber} — Returns 200")
    void testGetPurchaseByNumber_Success() throws Exception {
        when(purchaseService.getPurchaseByNumber(eq("PUR-000001"), anyLong())).thenReturn(samplePurchase);

        mockMvc.perform(get("/api/purchases/number/PUR-000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.purchaseNumber").value("PUR-000001"));
    }

    @Test
    @DisplayName("GET /api/purchases/summary — Returns 200 with summary KPIs")
    void testGetPurchaseSummary_Success() throws Exception {
        PurchaseSummaryDTO summary = PurchaseSummaryDTO.builder()
                .totalInvoices(10L)
                .totalPurchases(new BigDecimal("50000.00"))
                .totalPurchasesAmount(new BigDecimal("50000.00"))
                .totalPaid(new BigDecimal("40000.00"))
                .totalOutstanding(new BigDecimal("10000.00"))
                .totalBalance(new BigDecimal("10000.00"))
                .paidCount(6L)
                .partialCount(3L)
                .pendingCount(1L)
                .build();

        when(purchaseService.getPurchaseSummary(anyLong(), any(), any(), any(), any(), any(), any())).thenReturn(summary);

        mockMvc.perform(get("/api/purchases/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalInvoices").value(10))
                .andExpect(jsonPath("$.data.totalPurchases").value(50000.00));
    }

    @Test
    @DisplayName("PUT /api/purchases/{id}/cancel — Successfully cancels purchase")
    void testCancelPurchase_Success() throws Exception {
        PurchaseResponse cancelledPurchase = PurchaseResponse.builder()
                .id(1L)
                .purchaseNumber("PUR-000001")
                .status(PurchaseStatus.CANCELLED)
                .build();

        when(purchaseService.cancelPurchase(eq(1L), anyLong(), any(), any())).thenReturn(cancelledPurchase);

        mockMvc.perform(put("/api/purchases/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }

    @Test
    @DisplayName("GET /api/purchases/{id}/pdf — Returns application/pdf content")
    void testDownloadPurchasePdf_Success() throws Exception {
        byte[] fakePdf = "%PDF-1.4 test purchase pdf content".getBytes();
        when(purchaseService.getPurchaseById(eq(1L), anyLong())).thenReturn(samplePurchase);
        when(purchaseService.generatePurchasePdf(eq(1L), anyLong())).thenReturn(fakePdf);

        mockMvc.perform(get("/api/purchases/1/pdf"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"PUR-000001.pdf\""))
                .andExpect(content().bytes(fakePdf));
    }

    @Test
    @DisplayName("POST /api/purchases — Validates required fields")
    void testCreatePurchase_ValidationFailure() throws Exception {
        CreatePurchaseRequest emptyReq = new CreatePurchaseRequest();

        mockMvc.perform(post("/api/purchases")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(emptyReq)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }
}
