package com.risherp.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import com.risherp.dto.category.CategoryResponse;
import com.risherp.dto.category.CategoryStatusUpdateRequest;
import com.risherp.dto.category.CreateCategoryRequest;
import com.risherp.entity.CategoryStatus;
import com.risherp.exception.GlobalExceptionHandler;
import com.risherp.service.CategoryService;
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

import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@ExtendWith(MockitoExtension.class)
class CategoryControllerTest {

    private MockMvc mockMvc;
    private final ObjectMapper objectMapper = new ObjectMapper().registerModule(new JavaTimeModule());

    @Mock
    private CategoryService categoryService;

    @InjectMocks
    private CategoryController categoryController;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders.standaloneSetup(categoryController)
                .setControllerAdvice(new GlobalExceptionHandler())
                .build();
    }

    @Test
    @DisplayName("POST /api/categories - Success")
    void testCreateCategory_Success() throws Exception {
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .categoryName("Computer Accessories")
                .description("Mice and Keyboards")
                .status(CategoryStatus.ACTIVE)
                .build();

        CategoryResponse response = CategoryResponse.builder()
                .id(1L)
                .categoryName("Computer Accessories")
                .description("Mice and Keyboards")
                .status(CategoryStatus.ACTIVE)
                .itemCount(0)
                .build();

        when(categoryService.createCategory(any(CreateCategoryRequest.class), anyLong(), any(), any()))
                .thenReturn(response);

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(1))
                .andExpect(jsonPath("$.data.categoryName").value("Computer Accessories"));
    }

    @Test
    @DisplayName("POST /api/categories - Validation Failure (Blank Name)")
    void testCreateCategory_ValidationFailure() throws Exception {
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .categoryName("")
                .build();

        mockMvc.perform(post("/api/categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("GET /api/categories - Success")
    void testGetCategories_Success() throws Exception {
        CategoryResponse response = CategoryResponse.builder()
                .id(1L)
                .categoryName("Electronics")
                .status(CategoryStatus.ACTIVE)
                .build();

        Page<CategoryResponse> page = new PageImpl<>(List.of(response));
        when(categoryService.getCategories(anyLong(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].categoryName").value("Electronics"));
    }

    @Test
    @DisplayName("PATCH /api/categories/{id}/status - Success")
    void testUpdateCategoryStatus_Success() throws Exception {
        CategoryStatusUpdateRequest request = CategoryStatusUpdateRequest.builder()
                .status(CategoryStatus.INACTIVE)
                .build();

        CategoryResponse response = CategoryResponse.builder()
                .id(1L)
                .categoryName("Electronics")
                .status(CategoryStatus.INACTIVE)
                .build();

        when(categoryService.updateCategoryStatus(eq(1L), eq(CategoryStatus.INACTIVE), anyLong(), any(), any()))
                .thenReturn(response);

        mockMvc.perform(patch("/api/categories/1/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("INACTIVE"));
    }
}
