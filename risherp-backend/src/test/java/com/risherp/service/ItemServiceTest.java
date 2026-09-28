package com.risherp.service;

import com.risherp.dto.item.CreateItemRequest;
import com.risherp.dto.item.ItemResponse;
import com.risherp.dto.item.UpdateItemRequest;
import com.risherp.entity.*;
import com.risherp.exception.DuplicateResourceException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.BusinessRepository;
import com.risherp.repository.CategoryRepository;
import com.risherp.repository.ItemRepository;
import com.risherp.security.UserPrincipal;
import com.risherp.service.impl.ItemServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ItemServiceTest {

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private AuditLogService auditLogService;

    @InjectMocks
    private ItemServiceImpl itemService;

    private Business testBusiness;
    private Category testCategory;
    private UserPrincipal testPrincipal;

    @BeforeEach
    void setUp() {
        testBusiness = Business.builder()
                .id(1L)
                .businessName("Rishabh Traders")
                .build();

        testCategory = Category.builder()
                .id(10L)
                .business(testBusiness)
                .categoryName("Computer Accessories")
                .status(CategoryStatus.ACTIVE)
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
    @DisplayName("Should create item with auto-generated code and initial stock")
    void shouldCreateItemSuccessfully() {
        CreateItemRequest request = CreateItemRequest.builder()
                .itemName("Wireless Keyboard")
                .barcode("8901234567890")
                .categoryId(10L)
                .companyName("Logitech")
                .unit("PCS")
                .purchaseRate(new BigDecimal("750.00"))
                .saleRate(new BigDecimal("1000.00"))
                .initialStock(new BigDecimal("25.00"))
                .minimumStock(new BigDecimal("5.00"))
                .description("Logitech Wireless Keyboard")
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(categoryRepository.findByIdAndBusinessId(10L, 1L)).thenReturn(Optional.of(testCategory));
        when(itemRepository.existsByBusinessIdAndBarcode(1L, "8901234567890")).thenReturn(false);
        when(itemRepository.getMaxId()).thenReturn(0L);
        when(itemRepository.existsByBusinessIdAndItemCode(1L, "ITM-000001")).thenReturn(false);

        Item saved = Item.builder()
                .id(1L)
                .business(testBusiness)
                .itemCode("ITM-000001")
                .itemName("Wireless Keyboard")
                .barcode("8901234567890")
                .category(testCategory)
                .companyName("Logitech")
                .unit("PCS")
                .purchaseRate(new BigDecimal("750.00"))
                .saleRate(new BigDecimal("1000.00"))
                .currentStock(new BigDecimal("25.00"))
                .minimumStock(new BigDecimal("5.00"))
                .status(ItemStatus.ACTIVE)
                .build();

        when(itemRepository.save(any(Item.class))).thenReturn(saved);

        ItemResponse response = itemService.createItem(request, 1L, testPrincipal, "127.0.0.1");

        assertNotNull(response);
        assertEquals("ITM-000001", response.getItemCode());
        assertEquals("Wireless Keyboard", response.getItemName());
        assertEquals(new BigDecimal("25.00"), response.getCurrentStock());
        assertEquals(StockStatus.IN_STOCK, response.getStockStatus());
        verify(itemRepository).save(any(Item.class));
    }

    @Test
    @DisplayName("Should prevent duplicate barcode across items")
    void shouldPreventDuplicateBarcode() {
        CreateItemRequest request = CreateItemRequest.builder()
                .itemName("Duplicate Barcode Item")
                .barcode("8901234567890")
                .categoryId(10L)
                .unit("PCS")
                .purchaseRate(BigDecimal.TEN)
                .saleRate(BigDecimal.valueOf(20))
                .build();

        when(businessRepository.findById(1L)).thenReturn(Optional.of(testBusiness));
        when(categoryRepository.findByIdAndBusinessId(10L, 1L)).thenReturn(Optional.of(testCategory));
        when(itemRepository.existsByBusinessIdAndBarcode(1L, "8901234567890")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () ->
                itemService.createItem(request, 1L, testPrincipal, "127.0.0.1")
        );
        verify(itemRepository, never()).save(any(Item.class));
    }

    @Test
    @DisplayName("Should calculate correct StockStatus according to rules")
    void shouldCalculateStockStatusCorrectly() {
        // Current 20, Min 5 -> IN_STOCK
        assertEquals(StockStatus.IN_STOCK, StockStatus.calculate(new BigDecimal("20"), new BigDecimal("5")));

        // Current 5, Min 5 -> LOW_STOCK
        assertEquals(StockStatus.LOW_STOCK, StockStatus.calculate(new BigDecimal("5"), new BigDecimal("5")));

        // Current 2, Min 5 -> LOW_STOCK
        assertEquals(StockStatus.LOW_STOCK, StockStatus.calculate(new BigDecimal("2"), new BigDecimal("5")));

        // Current 0, Min 5 -> OUT_OF_STOCK
        assertEquals(StockStatus.OUT_OF_STOCK, StockStatus.calculate(new BigDecimal("0"), new BigDecimal("5")));

        // Negative stock -> OUT_OF_STOCK
        assertEquals(StockStatus.OUT_OF_STOCK, StockStatus.calculate(new BigDecimal("-1"), new BigDecimal("5")));
    }

    @Test
    @DisplayName("Should update item details without altering currentStock")
    void shouldUpdateItemWithoutModifyingStock() {
        Item existingItem = Item.builder()
                .id(1L)
                .business(testBusiness)
                .itemCode("ITM-000001")
                .itemName("Old Name")
                .category(testCategory)
                .unit("PCS")
                .purchaseRate(new BigDecimal("500.00"))
                .saleRate(new BigDecimal("700.00"))
                .currentStock(new BigDecimal("50.00"))
                .minimumStock(new BigDecimal("10.00"))
                .status(ItemStatus.ACTIVE)
                .build();

        UpdateItemRequest updateRequest = UpdateItemRequest.builder()
                .itemName("Updated Keyboard")
                .categoryId(10L)
                .unit("PCS")
                .purchaseRate(new BigDecimal("550.00"))
                .saleRate(new BigDecimal("800.00"))
                .minimumStock(new BigDecimal("8.00"))
                .build();

        when(itemRepository.findByIdAndBusinessId(1L, 1L)).thenReturn(Optional.of(existingItem));
        when(categoryRepository.findByIdAndBusinessId(10L, 1L)).thenReturn(Optional.of(testCategory));
        when(itemRepository.save(any(Item.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ItemResponse response = itemService.updateItem(1L, updateRequest, 1L, testPrincipal, "127.0.0.1");

        assertNotNull(response);
        assertEquals("Updated Keyboard", response.getItemName());
        // currentStock must stay untouched at 50.00
        assertEquals(new BigDecimal("50.00"), response.getCurrentStock());
        assertEquals(new BigDecimal("8.00"), response.getMinimumStock());
    }

    @Test
    @DisplayName("Should find item by barcode")
    void shouldFindItemByBarcode() {
        Item item = Item.builder()
                .id(1L)
                .business(testBusiness)
                .itemCode("ITM-000001")
                .itemName("Wireless Keyboard")
                .barcode("8901234567890")
                .category(testCategory)
                .unit("PCS")
                .currentStock(new BigDecimal("25.00"))
                .minimumStock(new BigDecimal("5.00"))
                .purchaseRate(new BigDecimal("750.00"))
                .saleRate(new BigDecimal("1000.00"))
                .status(ItemStatus.ACTIVE)
                .build();

        when(itemRepository.findByBusinessIdAndBarcode(1L, "8901234567890")).thenReturn(Optional.of(item));

        ItemResponse response = itemService.findByBarcode("8901234567890", 1L);

        assertNotNull(response);
        assertEquals("8901234567890", response.getBarcode());
        assertEquals("Wireless Keyboard", response.getItemName());
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when barcode not found")
    void shouldThrowWhenBarcodeNotFound() {
        when(itemRepository.findByBusinessIdAndBarcode(1L, "9999999999999")).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () ->
                itemService.findByBarcode("9999999999999", 1L)
        );
    }
}
