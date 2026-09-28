package com.risherp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.risherp.dto.sales.SaleItemResponse;
import com.risherp.dto.sales.SaleResponse;
import com.risherp.dto.sales.SaleSummaryDTO;
import com.risherp.entity.PaymentMode;
import com.risherp.entity.PaymentStatus;
import com.risherp.entity.SaleStatus;
import com.risherp.entity.SaleType;
import com.risherp.exception.GlobalExceptionHandler;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.service.SaleService;
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
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class SaleControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private SaleService saleService;

    @InjectMocks
    private SaleController saleController;

    private SaleResponse sampleSale;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(saleController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();

        sampleSale = SaleResponse.builder()
                .id(1L)
                .invoiceNumber("INV-000001")
                .partyId(10L)
                .partyName("Acme Retailers")
                .partyCode("CUST-001")
                .partyMobile("9876543210")
                .partyCity("Mumbai")
                .saleDate(LocalDate.of(2026, 9, 14))
                .saleType(SaleType.CASH)
                .subtotal(new BigDecimal("1000.00"))
                .itemDiscount(BigDecimal.ZERO)
                .overallDiscount(BigDecimal.ZERO)
                .totalDiscount(BigDecimal.ZERO)
                .grandTotal(new BigDecimal("1000.00"))
                .paidAmount(new BigDecimal("1000.00"))
                .balanceAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PAID)
                .paymentMode(PaymentMode.CASH)
                .status(SaleStatus.COMPLETED)
                .items(List.of(
                        SaleItemResponse.builder()
                                .id(1L)
                                .itemId(5L)
                                .itemNameSnapshot("Wireless Mouse")
                                .itemCodeSnapshot("WM-01")
                                .unitSnapshot("PCS")
                                .quantity(new BigDecimal("2.000"))
                                .rate(new BigDecimal("500.00"))
                                .lineTotal(new BigDecimal("1000.00"))
                                .build()
                ))
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    @DisplayName("GET /api/sales - Paginated sales with filters")
    void testGetSales_Success() throws Exception {
        Page<SaleResponse> page = new PageImpl<>(List.of(sampleSale));
        when(saleService.getSales(anyLong(), any(), any(), any(), any(), any(), any(), any(Pageable.class)))
                .thenReturn(page);

        mockMvc.perform(get("/api/sales")
                        .param("page", "0")
                        .param("size", "10")
                        .param("search", "INV-000001")
                        .param("paymentStatus", "PAID")
                        .param("status", "COMPLETED"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].invoiceNumber").value("INV-000001"))
                .andExpect(jsonPath("$.data.content[0].grandTotal").value(1000.00));
    }

    @Test
    @DisplayName("GET /api/sales/summary - Filtered Summary")
    void testGetSaleSummary_Success() throws Exception {
        SaleSummaryDTO summary = SaleSummaryDTO.builder()
                .totalInvoices(10)
                .paidCount(8)
                .partialCount(1)
                .pendingCount(1)
                .totalRevenue(new BigDecimal("25000.00"))
                .totalSales(new BigDecimal("25000.00"))
                .totalCollected(new BigDecimal("20000.00"))
                .totalPaid(new BigDecimal("20000.00"))
                .totalOutstanding(new BigDecimal("5000.00"))
                .todayInvoices(2)
                .todayRevenue(new BigDecimal("3000.00"))
                .build();

        when(saleService.getSaleSummary(anyLong(), any(), any(), any(), any(), any(), any()))
                .thenReturn(summary);

        mockMvc.perform(get("/api/sales/summary"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalInvoices").value(10))
                .andExpect(jsonPath("$.data.totalRevenue").value(25000.00))
                .andExpect(jsonPath("$.data.totalOutstanding").value(5000.00));
    }

    @Test
    @DisplayName("GET /api/sales/{id} - Get by ID")
    void testGetSaleById_Success() throws Exception {
        when(saleService.getSaleById(eq(1L), anyLong())).thenReturn(sampleSale);

        mockMvc.perform(get("/api/sales/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-000001"))
                .andExpect(jsonPath("$.data.items[0].itemNameSnapshot").value("Wireless Mouse"));
    }

    @Test
    @DisplayName("GET /api/sales/{id} - Not Found")
    void testGetSaleById_NotFound() throws Exception {
        when(saleService.getSaleById(eq(999L), anyLong()))
                .thenThrow(new ResourceNotFoundException("Sale not found with id: 999"));

        mockMvc.perform(get("/api/sales/999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/sales/invoice/{invoiceNumber} - Look up by invoice number")
    void testGetSaleByInvoiceNumber_Success() throws Exception {
        when(saleService.getSaleByInvoiceNumber(eq("INV-000001"), anyLong())).thenReturn(sampleSale);

        mockMvc.perform(get("/api/sales/invoice/INV-000001"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.invoiceNumber").value("INV-000001"));
    }

    @Test
    @DisplayName("GET /api/sales/{id}/pdf - Download PDF")
    void testDownloadInvoicePdf_Success() throws Exception {
        byte[] dummyPdf = "%PDF-1.4 dummy content".getBytes();
        when(saleService.getSaleById(eq(1L), anyLong())).thenReturn(sampleSale);
        when(saleService.generateInvoicePdf(eq(1L), anyLong())).thenReturn(dummyPdf);

        mockMvc.perform(get("/api/sales/1/pdf"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"INV-000001.pdf\""))
                .andExpect(content().contentType(MediaType.APPLICATION_PDF))
                .andExpect(content().bytes(dummyPdf));
    }

    @Test
    @DisplayName("PUT /api/sales/{id}/cancel - Cancel sale successfully")
    void testCancelSale_Success() throws Exception {
        SaleResponse cancelledSale = sampleSale;
        cancelledSale.setStatus(SaleStatus.CANCELLED);

        when(saleService.cancelSale(eq(1L), anyLong(), any(), any())).thenReturn(cancelledSale);

        mockMvc.perform(put("/api/sales/1/cancel"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("CANCELLED"));
    }
}
