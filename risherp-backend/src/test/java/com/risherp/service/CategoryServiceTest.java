package com.risherp.service;

import com.risherp.dto.category.CategoryResponse;
import com.risherp.dto.category.CreateCategoryRequest;
import com.risherp.dto.category.UpdateCategoryRequest;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.CategoryRepository;
import com.risherp.repository.ItemRepository;
import com.risherp.security.UserPrincipal;
import com.risherp.service.impl.CategoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CategoryServiceTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private CategoryServiceImpl categoryService;

    private Business testBusiness;
    private UserPrincipal testPrincipal;

    @BeforeEach
    void setUp() {
        testBusiness = Business.builder()
                .id(1L)
                .businessName("Rishabh Traders")
                .build();

        User testUser = User.builder()
                .id(1L)
                .name("Admin User")
                .email("admin@risherp.com")
                .business(testBusiness)
                .role(Role.builder().name("ADMIN").build())
                .status("ACTIVE")
                .build();

        testPrincipal = new UserPrincipal(testUser);
    }

    @Test
    @DisplayName("Should successfully create a category")
    void shouldCreateCategorySuccessfully() {
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .categoryName("Computer Accessories")
                .description("Keyboards, mice, and peripherals")
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(categoryRepository.existsByBusinessIdAndCategoryNameIgnoreCaseAndStatus(1L, "Computer Accessories", CategoryStatus.ACTIVE))
                .thenReturn(false);

        Category saved = Category.builder()
                .id(10L)
                .business(testBusiness)
                .categoryName("Computer Accessories")
                .description("Keyboards, mice, and peripherals")
                .status(CategoryStatus.ACTIVE)
                .build();

        when(categoryRepository.save(any(Category.class))).thenReturn(saved);

        CategoryResponse response = categoryService.createCategory(request, 1L, testPrincipal, "127.0.0.1");

        assertNotNull(response);
        assertEquals(10L, response.getId());
        assertEquals("Computer Accessories", response.getCategoryName());
        assertEquals(CategoryStatus.ACTIVE, response.getStatus());
        verify(categoryRepository).save(any(Category.class));
    }

    @Test
    @DisplayName("Should reject duplicate active category name")
    void shouldRejectDuplicateActiveCategoryName() {
        CreateCategoryRequest request = CreateCategoryRequest.builder()
                .categoryName("Electronics")
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(categoryRepository.existsByBusinessIdAndCategoryNameIgnoreCaseAndStatus(1L, "Electronics", CategoryStatus.ACTIVE))
                .thenReturn(true);

        assertThrows(DuplicateResourceException.class, () ->
                categoryService.createCategory(request, 1L, testPrincipal, "127.0.0.1")
        );
        verify(categoryRepository, never()).save(any(Category.class));
    }

    @Test
    @DisplayName("Should prevent deactivating category when active items are assigned")
    void shouldPreventDeactivatingCategoryWithActiveItems() {
        Category category = Category.builder()
                .id(5L)
                .business(testBusiness)
                .categoryName("Hardware")
                .status(CategoryStatus.ACTIVE)
                .build();

        when(categoryRepository.findByIdAndBusinessId(5L, 1L)).thenReturn(Optional.of(category));
        when(itemRepository.countByBusinessIdAndCategoryIdAndStatus(1L, 5L, ItemStatus.ACTIVE)).thenReturn(3L);

        BadRequestException ex = assertThrows(BadRequestException.class, () ->
                categoryService.updateCategoryStatus(5L, CategoryStatus.INACTIVE, 1L, testPrincipal, "127.0.0.1")
        );

        assertTrue(ex.getMessage().contains("3 active item(s) are currently assigned"));
        verify(categoryRepository, never()).save(any());
    }

    @Test
    @DisplayName("Should allow deactivating category when no active items exist")
    void shouldAllowDeactivatingCategoryWithNoActiveItems() {
        Category category = Category.builder()
                .id(5L)
                .business(testBusiness)
                .categoryName("Hardware")
                .status(CategoryStatus.ACTIVE)
                .build();

        when(categoryRepository.findByIdAndBusinessId(5L, 1L)).thenReturn(Optional.of(category));
        when(itemRepository.countByBusinessIdAndCategoryIdAndStatus(1L, 5L, ItemStatus.ACTIVE)).thenReturn(0L);
        when(categoryRepository.save(any(Category.class))).thenReturn(category);

        CategoryResponse response = categoryService.updateCategoryStatus(5L, CategoryStatus.INACTIVE, 1L, testPrincipal, "127.0.0.1");

        assertNotNull(response);
        assertEquals(CategoryStatus.INACTIVE, response.getStatus());
        verify(categoryRepository).save(category);
    }
}
