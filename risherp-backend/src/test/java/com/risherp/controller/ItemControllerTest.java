package com.risherp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.risherp.dto.item.CreateItemRequest;
import com.risherp.dto.item.ItemResponse;
import com.risherp.dto.item.ItemStatusUpdateRequest;
import com.risherp.entity.ItemStatus;
import com.risherp.entity.StockStatus;
import com.risherp.exception.GlobalExceptionHandler;
import com.risherp.service.ItemService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.math.BigDecimal;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class ItemControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private ItemService itemService;

    @InjectMocks
    private ItemController itemController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(itemController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/items - Success")
    void testCreateItem_Success() throws Exception {
        CreateItemRequest request = CreateItemRequest.builder()
                .itemName("Wireless Keyboard")
                .categoryId(1L)
                .unit("PCS")
                .purchaseRate(new BigDecimal("750.00"))
                .saleRate(new BigDecimal("1000.00"))
                .initialStock(new BigDecimal("25.00"))
                .minimumStock(new BigDecimal("5.00"))
                .build();

        ItemResponse response = ItemResponse.builder()
                .id(1L)
                .itemCode("ITM-000001")
                .itemName("Wireless Keyboard")
                .categoryId(1L)
                .unit("PCS")
                .purchaseRate(new BigDecimal("750.00"))
                .saleRate(new BigDecimal("1000.00"))
                .currentStock(new BigDecimal("25.00"))
                .minimumStock(new BigDecimal("5.00"))
                .stockStatus(StockStatus.IN_STOCK)
                .status(ItemStatus.ACTIVE)
                .build();

        when(itemService.createItem(any(CreateItemRequest.class), anyLong(), any(), any()))
                .thenReturn(response);

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.itemCode").value("ITM-000001"))
                .andExpect(jsonPath("$.data.itemName").value("Wireless Keyboard"))
                .andExpect(jsonPath("$.data.stockStatus").value("IN_STOCK"));
    }

    @Test
    @DisplayName("POST /api/items - Negative rate validation failure")
    void testCreateItem_NegativeRateValidationFailure() throws Exception {
        CreateItemRequest request = CreateItemRequest.builder()
                .itemName("Wireless Keyboard")
                .categoryId(1L)
                .unit("PCS")
                .purchaseRate(new BigDecimal("-10.00"))
                .saleRate(new BigDecimal("100.00"))
                .build();

        mockMvc.perform(post("/api/items")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/items/barcode/{barcode} - Success")
    void testGetItemByBarcode_Success() throws Exception {
        ItemResponse response = ItemResponse.builder()
                .id(1L)
                .itemCode("ITM-000001")
                .itemName("Wireless Keyboard")
                .barcode("8901234567890")
                .saleRate(new BigDecimal("1000.00"))
                .currentStock(new BigDecimal("25.00"))
                .stockStatus(StockStatus.IN_STOCK)
                .build();

        when(itemService.findByBarcode(eq("8901234567890"), anyLong()))
                .thenReturn(response);

        mockMvc.perform(get("/api/items/barcode/8901234567890"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.barcode").value("8901234567890"))
                .andExpect(jsonPath("$.data.itemCode").value("ITM-000001"));
    }

    @Test
    @DisplayName("PATCH /api/items/{id}/status - Success")
    void testUpdateItemStatus_Success() throws Exception {
        ItemStatusUpdateRequest request = ItemStatusUpdateRequest.builder()
                .status(ItemStatus.INACTIVE)
                .build();

        ItemResponse response = ItemResponse.builder()
                .id(1L)
                .itemCode("ITM-000001")
                .itemName("Wireless Keyboard")
                .status(ItemStatus.INACTIVE)
                .build();

        when(itemService.updateItemStatus(eq(1L), eq(ItemStatus.INACTIVE), anyLong(), any(), any()))
                .thenReturn(response);

        mockMvc.perform(patch("/api/items/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
    }
}
