package com.risherp.service;

import com.risherp.dto.purchase.CreatePurchaseRequest;
import com.risherp.dto.purchase.PurchaseItemRequest;
import com.risherp.dto.purchase.PurchaseResponse;
import com.risherp.dto.purchase.PurchaseSummaryDTO;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.impl.PurchaseServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PurchaseServiceTest {

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private PurchaseItemRepository purchaseItemRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private PartyRepository partyRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private StockService stockService;

    @Mock
    private PurchasePdfService purchasePdfService;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private FinancialPostingService financialPostingService;

    @Mock
    private DocumentSequenceService documentSequenceService;

    @InjectMocks
    private PurchaseServiceImpl purchaseService;

    private Business business;
    private Party supplier;
    private Item item;
    private User user;
    private UserPrincipal principal;

    @BeforeEach
    void setUp() {
        business = Business.builder()
                .id(1L)
                .businessName("Test Enterprises")
                .ownerName("John Doe")
                .email("test@enterprise.com")
                .mobile("9876543210")
                .build();

        supplier = Party.builder()
                .id(20L)
                .business(business)
                .partyName("ABC Supplier")
                .partyCode("SUP-001")
                .mobile("9876500000")
                .partyType(PartyType.SUPPLIER)
                .status(PartyStatus.ACTIVE)
                .build();

        item = Item.builder()
                .id(100L)
                .business(business)
                .itemName("Product A")
                .itemCode("PRD-001")
                .unit("PCS")
                .purchaseRate(new BigDecimal("100.00"))
                .saleRate(new BigDecimal("150.00"))
                .currentStock(new BigDecimal("50.000"))
                .minimumStock(new BigDecimal("10.000"))
                .status(ItemStatus.ACTIVE)
                .build();

        user = User.builder()
                .id(5L)
                .name("Test Staff")
                .email("staff@example.com")
                .business(business)
                .status("ACTIVE")
                .build();

        principal = new UserPrincipal(user);
        lenient().when(documentSequenceService.generateNextNumber(any(), anyString())).thenReturn("PUR-000001");
    }

    @Test
    @DisplayName("Create valid purchase — increases stock and calculates totals accurately")
    void testCreatePurchase_Success() {
        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(partyRepository.findByIdAndBusinessId(20L, 1L)).thenReturn(Optional.of(supplier));
        when(itemRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(item));
        when(userRepository.findById(5L)).thenReturn(Optional.of(user));

        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(inv -> {
            Purchase p = inv.getArgument(0);
            p.setId(1L);
            return p;
        });

        PurchaseItemRequest itemReq = PurchaseItemRequest.builder()
                .itemId(100L)
                .quantity(new BigDecimal("10"))
                .rate(new BigDecimal("100.00"))
                .discountType(DiscountType.PERCENTAGE)
                .discountValue(new BigDecimal("10"))
                .build();

        CreatePurchaseRequest request = CreatePurchaseRequest.builder()
                .partyId(20L)
                .purchaseDate(LocalDate.now())
                .purchaseType(PurchaseType.CREDIT)
                .items(List.of(itemReq))
                .paidAmount(new BigDecimal("400.00"))
                .build();

        PurchaseResponse response = purchaseService.createPurchase(request, 1L, principal);

        assertNotNull(response);
        assertEquals("PUR-000001", response.getPurchaseNumber());
        // Subtotal = 10 * 100 = 1000, 10% disc = 100 => Subtotal after disc = 900
        assertEquals(new BigDecimal("900.00"), response.getSubtotal());
        assertEquals(new BigDecimal("100.00"), response.getItemDiscount());
        assertEquals(new BigDecimal("900.00"), response.getGrandTotal());
        assertEquals(new BigDecimal("400.00"), response.getPaidAmount());
        assertEquals(new BigDecimal("500.00"), response.getBalanceAmount());
        assertEquals(PaymentStatus.PARTIAL, response.getPaymentStatus());

        // Stock increase verified
        verify(stockService).increaseStock(eq(1L), eq(100L), eq(new BigDecimal("10.000")), eq("PURCHASE"), eq("PUR-000001"));
    }

    @Test
    @DisplayName("Create purchase with decimal quantity (e.g. 2.5 KG)")
    void testCreatePurchase_DecimalQuantity() {
        item.setUnit("KG");
        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(partyRepository.findByIdAndBusinessId(20L, 1L)).thenReturn(Optional.of(supplier));
        when(itemRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(item));

        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(inv -> {
            Purchase p = inv.getArgument(0);
            p.setId(6L);
            return p;
        });

        PurchaseItemRequest itemReq = PurchaseItemRequest.builder()
                .itemId(100L)
                .quantity(new BigDecimal("2.5"))
                .rate(new BigDecimal("200.00"))
                .discountType(DiscountType.AMOUNT)
                .discountValue(BigDecimal.ZERO)
                .build();

        CreatePurchaseRequest request = CreatePurchaseRequest.builder()
                .partyId(20L)
                .purchaseType(PurchaseType.CASH)
                .items(List.of(itemReq))
                .paidAmount(new BigDecimal("500.00"))
                .build();

        PurchaseResponse response = purchaseService.createPurchase(request, 1L, principal);

        assertNotNull(response);
        assertEquals(new BigDecimal("500.00"), response.getGrandTotal());
        assertEquals(PaymentStatus.PAID, response.getPaymentStatus());
        verify(stockService).increaseStock(eq(1L), eq(100L), eq(new BigDecimal("2.500")), eq("PURCHASE"), anyString());
    }

    @Test
    @DisplayName("Reject purchase when supplier is inactive")
    void testCreatePurchase_InactiveSupplier() {
        supplier.setStatus(PartyStatus.INACTIVE);
        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(partyRepository.findByIdAndBusinessId(20L, 1L)).thenReturn(Optional.of(supplier));

        CreatePurchaseRequest request = CreatePurchaseRequest.builder()
                .partyId(20L)
                .items(List.of(PurchaseItemRequest.builder().itemId(100L).quantity(BigDecimal.ONE).rate(BigDecimal.TEN).build()))
                .paidAmount(BigDecimal.ZERO)
                .build();

        assertThrows(BadRequestException.class, () -> purchaseService.createPurchase(request, 1L, principal));
    }

    @Test
    @DisplayName("Reject purchase when party is CUSTOMER instead of SUPPLIER or BOTH")
    void testCreatePurchase_InvalidPartyType() {
        supplier.setPartyType(PartyType.CUSTOMER);
        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(partyRepository.findByIdAndBusinessId(20L, 1L)).thenReturn(Optional.of(supplier));

        CreatePurchaseRequest request = CreatePurchaseRequest.builder()
                .partyId(20L)
                .items(List.of(PurchaseItemRequest.builder().itemId(100L).quantity(BigDecimal.ONE).rate(BigDecimal.TEN).build()))
                .paidAmount(BigDecimal.ZERO)
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> purchaseService.createPurchase(request, 1L, principal));
        assertTrue(ex.getMessage().contains("not a supplier"));
    }

    @Test
    @DisplayName("Reject purchase when paidAmount exceeds grand total")
    void testCreatePurchase_OverpaymentRejected() {
        when(businessRepository.findById(1L)).thenReturn(Optional.of(business));
        when(partyRepository.findByIdAndBusinessId(20L, 1L)).thenReturn(Optional.of(supplier));
        when(itemRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(item));

        PurchaseItemRequest itemReq = PurchaseItemRequest.builder()
                .itemId(100L)
                .quantity(new BigDecimal("1"))
                .rate(new BigDecimal("100.00"))
                .build();

        CreatePurchaseRequest request = CreatePurchaseRequest.builder()
                .partyId(20L)
                .purchaseType(PurchaseType.CASH)
                .items(List.of(itemReq))
                .paidAmount(new BigDecimal("150.00")) // Grand total is 100
                .build();

        BadRequestException ex = assertThrows(BadRequestException.class, () -> purchaseService.createPurchase(request, 1L, principal));
        assertTrue(ex.getMessage().contains("Paid amount cannot exceed grand total"));
    }

    @Test
    @DisplayName("Get purchase summary returns accurate statistics")
    void testGetPurchaseSummary() {
        when(purchaseRepository.countByBusinessId(1L)).thenReturn(15L);
        when(purchaseRepository.countByBusinessIdAndPaymentStatus(1L, PaymentStatus.PAID)).thenReturn(10L);
        when(purchaseRepository.countByBusinessIdAndPaymentStatus(1L, PaymentStatus.PARTIAL)).thenReturn(3L);
        when(purchaseRepository.countByBusinessIdAndPaymentStatus(1L, PaymentStatus.PENDING)).thenReturn(2L);
        when(purchaseRepository.sumGrandTotalByBusinessId(1L)).thenReturn(new BigDecimal("45000.00"));
        when(purchaseRepository.sumPaidAmountByBusinessId(1L)).thenReturn(new BigDecimal("35000.00"));
        when(purchaseRepository.sumBalanceAmountByBusinessId(1L)).thenReturn(new BigDecimal("10000.00"));

        PurchaseSummaryDTO summary = purchaseService.getPurchaseSummary(1L);

        assertEquals(15L, summary.getTotalInvoices());
        assertEquals(new BigDecimal("45000.00"), summary.getTotalPurchases());
        assertEquals(new BigDecimal("45000.00"), summary.getTotalPurchasesAmount());
        assertEquals(new BigDecimal("35000.00"), summary.getTotalPaid());
        assertEquals(new BigDecimal("10000.00"), summary.getTotalOutstanding());
        assertEquals(new BigDecimal("10000.00"), summary.getTotalBalance());
        assertEquals(10L, summary.getPaidCount());
    }

    @Test
    @DisplayName("Cancel purchase — successfully restores stock and updates status")
    void testCancelPurchase_Success() {
        Purchase purchase = Purchase.builder()
                .id(100L)
                .business(business)
                .party(supplier)
                .purchaseNumber("PUR-000100")
                .purchaseDate(LocalDate.now())
                .purchaseType(PurchaseType.CASH)
                .grandTotal(new BigDecimal("500.00"))
                .paidAmount(new BigDecimal("500.00"))
                .balanceAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PAID)
                .status(PurchaseStatus.COMPLETED)
                .purchaseItems(new ArrayList<>())
                .build();

        PurchaseItem pItem = PurchaseItem.builder()
                .id(10L)
                .purchase(purchase)
                .item(item)
                .itemNameSnapshot(item.getItemName())
                .itemCodeSnapshot(item.getItemCode())
                .unitSnapshot(item.getUnit())
                .quantity(new BigDecimal("5.000"))
                .rate(new BigDecimal("100.00"))
                .lineTotal(new BigDecimal("500.00"))
                .build();

        purchase.getPurchaseItems().add(pItem);

        when(purchaseRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(purchase));
        when(purchaseRepository.save(any(Purchase.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PurchaseResponse response = purchaseService.cancelPurchase(100L, 1L, principal, "127.0.0.1");

        assertNotNull(response);
        assertEquals(PurchaseStatus.CANCELLED, response.getStatus());
        verify(stockService).decreaseStock(eq(1L), eq(100L), eq(new BigDecimal("5.000")), eq("PURCHASE_CANCEL"), eq("PUR-000100"));
        verify(purchaseRepository).save(purchase);
        verify(auditLogService).log(any(), any(), eq(1L), eq("PURCHASE"), eq("PURCHASE_CANCELLED"), eq("100"), anyString(), eq("127.0.0.1"));
    }

    @Test
    @DisplayName("Cancel purchase — throws BadRequestException if already cancelled")
    void testCancelPurchase_AlreadyCancelled() {
        Purchase purchase = Purchase.builder()
                .id(100L)
                .business(business)
                .party(supplier)
                .purchaseNumber("PUR-000100")
                .status(PurchaseStatus.CANCELLED)
                .build();

        when(purchaseRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(purchase));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> purchaseService.cancelPurchase(100L, 1L, principal, "127.0.0.1"));
        assertTrue(ex.getMessage().contains("already cancelled"));
        verify(stockService, never()).decreaseStock(any(), any(), any(), any(), any());
    }

    @Test
    @DisplayName("Cancel purchase — throws ResourceNotFoundException if purchase missing")
    void testCancelPurchase_NotFound() {
        when(purchaseRepository.findByIdAndBusinessId(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> purchaseService.cancelPurchase(999L, 1L, principal, "127.0.0.1"));
    }
}
