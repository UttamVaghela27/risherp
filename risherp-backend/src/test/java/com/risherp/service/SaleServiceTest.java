package com.risherp.service;

import com.risherp.dto.sales.SaleResponse;
import com.risherp.entity.*;
import com.risherp.exception.BadRequestException;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.impl.SaleServiceImpl;
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
class SaleServiceTest {

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private SaleItemRepository saleItemRepository;

    @Mock
    private ItemRepository itemRepository;

    @Mock
    private PartyRepository partyRepository;

    @Mock
    private BusinessRepository businessRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AuditLogService auditLogService;

    @Mock
    private InvoicePdfService invoicePdfService;

    @Mock
    private StockService stockService;

    @Mock
    private FinancialPostingService financialPostingService;

    @Mock
    private DocumentSequenceService documentSequenceService;

    @InjectMocks
    private SaleServiceImpl saleService;

    private Business business;
    private Party party;
    private Item item;
    private Sale sale;
    private SaleItem saleItem;

    @BeforeEach
    void setUp() {
        business = Business.builder()
                .id(1L)
                .businessName("Test Enterprises")
                .ownerName("John Doe")
                .email("test@enterprise.com")
                .mobile("9876543210")
                .build();

        party = Party.builder()
                .id(10L)
                .business(business)
                .partyName("Acme Corp")
                .partyCode("CUST-001")
                .mobile("9999988888")
                .partyType(PartyType.CUSTOMER)
                .status(PartyStatus.ACTIVE)
                .build();

        item = Item.builder()
                .id(5L)
                .business(business)
                .itemName("Mechanical Keyboard")
                .itemCode("KB-01")
                .unit("PCS")
                .currentStock(new BigDecimal("10.000"))
                .saleRate(new BigDecimal("1500.00"))
                .status(ItemStatus.ACTIVE)
                .build();

        sale = Sale.builder()
                .id(100L)
                .business(business)
                .party(party)
                .invoiceNumber("INV-000100")
                .saleDate(LocalDate.now())
                .saleType(SaleType.CASH)
                .subtotal(new BigDecimal("3000.00"))
                .grandTotal(new BigDecimal("3000.00"))
                .paidAmount(new BigDecimal("3000.00"))
                .balanceAmount(BigDecimal.ZERO)
                .paymentStatus(PaymentStatus.PAID)
                .status(SaleStatus.COMPLETED)
                .saleItems(new ArrayList<>())
                .build();

        saleItem = SaleItem.builder()
                .id(1L)
                .sale(sale)
                .item(item)
                .itemNameSnapshot(item.getItemName())
                .itemCodeSnapshot(item.getItemCode())
                .unitSnapshot(item.getUnit())
                .quantity(new BigDecimal("2.000"))
                .rate(new BigDecimal("1500.00"))
                .discountAmount(BigDecimal.ZERO)
                .lineSubtotal(new BigDecimal("3000.00"))
                .lineTotal(new BigDecimal("3000.00"))
                .build();

        sale.getSaleItems().add(saleItem);
        lenient().when(documentSequenceService.generateNextNumber(any(), anyString())).thenReturn("INV-000001");
    }

    @Test
    @DisplayName("cancelSale — Successfully cancels sale and restores stock")
    void testCancelSale_Success() {
        when(saleRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(sale));
        when(saleRepository.save(any(Sale.class))).thenAnswer(invocation -> invocation.getArgument(0));

        SaleResponse response = saleService.cancelSale(100L, 1L, null, "127.0.0.1");

        assertNotNull(response);
        assertEquals(SaleStatus.CANCELLED, response.getStatus());
        verify(stockService).increaseStock(eq(1L), eq(5L), eq(new BigDecimal("2.000")), eq("SALE_CANCEL"), eq("INV-000100"));
        verify(saleRepository).save(sale);
    }

    @Test
    @DisplayName("cancelSale — Throws BadRequestException if already cancelled")
    void testCancelSale_AlreadyCancelled() {
        sale.setStatus(SaleStatus.CANCELLED);
        when(saleRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(sale));

        BadRequestException ex = assertThrows(BadRequestException.class,
                () -> saleService.cancelSale(100L, 1L, null, "127.0.0.1"));

        assertTrue(ex.getMessage().contains("already cancelled"));
        verify(itemRepository, never()).save(any());
    }

    @Test
    @DisplayName("generateInvoicePdf — Generates PDF bytes")
    void testGenerateInvoicePdf_Success() {
        when(saleRepository.findByIdAndBusinessId(100L, 1L)).thenReturn(Optional.of(sale));
        byte[] expectedBytes = new byte[]{1, 2, 3, 4};
        when(invoicePdfService.generateInvoicePdf(sale)).thenReturn(expectedBytes);

        byte[] result = saleService.generateInvoicePdf(100L, 1L);

        assertNotNull(result);
        assertArrayEquals(expectedBytes, result);
        verify(invoicePdfService).generateInvoicePdf(sale);
    }

    @Test
    @DisplayName("getSaleById — Throws ResourceNotFoundException when sale missing")
    void testGetSaleById_NotFound() {
        when(saleRepository.findByIdAndBusinessId(999L, 1L)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class,
                () -> saleService.getSaleById(999L, 1L));
    }
}
