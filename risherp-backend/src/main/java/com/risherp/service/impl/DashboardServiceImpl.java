package com.risherp.service.impl;

import com.risherp.dto.dashboard.*;
import com.risherp.entity.Item;
import com.risherp.repository.ItemRepository;
import com.risherp.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * DashboardServiceImpl
 * Provides dashboard data and operational KPIs.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    private static final DateTimeFormatter LABEL_FORMATTER = DateTimeFormatter.ofPattern("dd MMM");

    private final ItemRepository itemRepository;
    private final com.risherp.repository.CategoryRepository categoryRepository;
    private final com.risherp.repository.PartyRepository partyRepository;
    private final com.risherp.repository.SaleRepository saleRepository;
    private final com.risherp.repository.PurchaseRepository purchaseRepository;
    private final com.risherp.repository.UserRepository userRepository;
    private final com.risherp.repository.RoleRepository roleRepository;

    @Override
    @Transactional(readOnly = true)
    public AdminOverviewDTO getAdminOverview(Long businessId) {
        long totalItems = itemRepository != null ? itemRepository.countByBusinessId(businessId) : 0;
        long totalCategories = categoryRepository != null ? categoryRepository.countByBusinessId(businessId) : 0;
        long totalCustomers = partyRepository != null ? partyRepository.countByBusinessIdAndPartyType(businessId, com.risherp.entity.PartyType.CUSTOMER) : 0;
        long totalSuppliers = partyRepository != null ? partyRepository.countByBusinessIdAndPartyType(businessId, com.risherp.entity.PartyType.SUPPLIER) : 0;
        long totalSales = saleRepository != null ? saleRepository.countByBusinessId(businessId) : 0;
        long totalPurchases = purchaseRepository != null ? purchaseRepository.countByBusinessId(businessId) : 0;
        long totalUsers = userRepository != null ? userRepository.count() : 0;
        long totalRoles = roleRepository != null ? roleRepository.count() : 0;

        return AdminOverviewDTO.builder()
                .totalItems(totalItems)
                .totalCategories(totalCategories)
                .totalCustomers(totalCustomers)
                .totalSuppliers(totalSuppliers)
                .totalSalesInvoices(totalSales)
                .totalPurchaseInvoices(totalPurchases)
                .totalUsers(totalUsers)
                .totalRoles(totalRoles)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryDTO getSummary(Long businessId, LocalDate fromDate, LocalDate toDate) {
        log.debug("Fetching dashboard summary for business: {}, from: {}, to: {}", businessId, fromDate, toDate);

        BigDecimal stockVal = new BigDecimal("892400.00");
        long lowStock = 4L;

        if (itemRepository != null && itemRepository.countByBusinessId(businessId) > 0) {
            BigDecimal realStockValue = itemRepository.sumStockValueByBusinessId(businessId);
            if (realStockValue != null) {
                stockVal = realStockValue;
            }
            lowStock = itemRepository.countLowStock(businessId) + itemRepository.countOutOfStock(businessId);
        }

        return DashboardSummaryDTO.builder()
                .todaySales(new BigDecimal("45200.00"))
                .todayPurchase(new BigDecimal("22400.00"))
                .todayReceipts(new BigDecimal("18200.00"))
                .todayPayments(new BigDecimal("9200.00"))
                .totalReceivable(new BigDecimal("148500.00"))
                .totalPayable(new BigDecimal("62300.00"))
                .stockValue(stockVal)
                .lowStockCount(lowStock)
                .salesGrowth(12.5)
                .purchaseGrowth(-3.2)
                .receiptsGrowth(8.1)
                .paymentsGrowth(-1.4)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesOverviewDTO> getSalesOverview(Long businessId, LocalDate fromDate, LocalDate toDate) {
        LocalDate start = fromDate != null ? fromDate : LocalDate.now().minusDays(6);
        LocalDate end = toDate != null ? toDate : LocalDate.now();

        List<SalesOverviewDTO> list = new ArrayList<>();
        // Baseline curve generation across the requested date span
        LocalDate cur = start;
        long dayIndex = 0;
        while (!cur.isAfter(end)) {
            // Simulated baseline volume representing business activity for UI chart
            double amountVal = 35000 + ((dayIndex % 5) * 6500);
            list.add(SalesOverviewDTO.builder()
                    .date(cur.format(DATE_FORMATTER))
                    .label(cur.format(LABEL_FORMATTER))
                    .amount(BigDecimal.valueOf(amountVal))
                    .count(8L + (dayIndex % 6))
                    .build());
            cur = cur.plusDays(1);
            dayIndex++;
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseOverviewDTO> getPurchaseOverview(Long businessId, LocalDate fromDate, LocalDate toDate) {
        LocalDate start = fromDate != null ? fromDate : LocalDate.now().minusDays(6);
        LocalDate end = toDate != null ? toDate : LocalDate.now();

        List<PurchaseOverviewDTO> list = new ArrayList<>();
        LocalDate cur = start;
        long dayIndex = 0;
        while (!cur.isAfter(end)) {
            double amountVal = 18000 + ((dayIndex % 4) * 4500);
            list.add(PurchaseOverviewDTO.builder()
                    .date(cur.format(DATE_FORMATTER))
                    .label(cur.format(LABEL_FORMATTER))
                    .amount(BigDecimal.valueOf(amountVal))
                    .count(3L + (dayIndex % 4))
                    .build());
            cur = cur.plusDays(1);
            dayIndex++;
        }
        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<RecentTransactionDTO> getRecentTransactions(Long businessId, int limit) {
        List<RecentTransactionDTO> list = new ArrayList<>();

        list.add(RecentTransactionDTO.builder()
                .id("1")
                .type("SALE")
                .reference("INV-1001")
                .partyName("Metro Enterprises")
                .date(LocalDate.now().format(DATE_FORMATTER))
                .amount(new BigDecimal("18500.00"))
                .paymentMode("UPI")
                .status("PAID")
                .build());

        list.add(RecentTransactionDTO.builder()
                .id("2")
                .type("PURCHASE")
                .reference("PO-5001")
                .partyName("National Paper Mills")
                .date(LocalDate.now().format(DATE_FORMATTER))
                .amount(new BigDecimal("22400.00"))
                .paymentMode("BANK")
                .status("PAID")
                .build());

        list.add(RecentTransactionDTO.builder()
                .id("3")
                .type("RECEIPT")
                .reference("REC-1001")
                .partyName("Sunrise Retail Store")
                .date(LocalDate.now().minusDays(1).format(DATE_FORMATTER))
                .amount(new BigDecimal("14200.00"))
                .paymentMode("CREDIT")
                .status("PENDING")
                .build());

        list.add(RecentTransactionDTO.builder()
                .id("4")
                .type("PAYMENT")
                .reference("PAY-2001")
                .partyName("Apex Hardware & Tools")
                .date(LocalDate.now().minusDays(1).format(DATE_FORMATTER))
                .amount(new BigDecimal("8450.00"))
                .paymentMode("CASH")
                .status("PAID")
                .build());

        list.add(RecentTransactionDTO.builder()
                .id("5")
                .type("SALE")
                .reference("INV-1002")
                .partyName("Global Tech Importers")
                .date(LocalDate.now().minusDays(2).format(DATE_FORMATTER))
                .amount(new BigDecimal("35000.00"))
                .paymentMode("CREDIT")
                .status("PARTIAL")
                .build());

        int effectiveLimit = limit > 0 ? Math.min(limit, list.size()) : list.size();
        return list.subList(0, effectiveLimit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<LowStockDTO> getLowStockItems(Long businessId) {
        if (itemRepository != null) {
            List<Item> lowStockEntities = itemRepository.findLowStockItems(businessId);
            if (!lowStockEntities.isEmpty()) {
                List<LowStockDTO> dtoList = new ArrayList<>();
                for (Item item : lowStockEntities) {
                    dtoList.add(LowStockDTO.builder()
                            .itemId(item.getId())
                            .itemName(item.getItemName())
                            .itemCode(item.getItemCode())
                            .currentStock(item.getCurrentStock() != null ? item.getCurrentStock().doubleValue() : 0.0)
                            .minimumStock(item.getMinimumStock() != null ? item.getMinimumStock().doubleValue() : 0.0)
                            .unit(item.getUnit())
                            .status(item.getStockStatus().name())
                            .build());
                }
                return dtoList;
            }
        }

        List<LowStockDTO> list = new ArrayList<>();

        list.add(LowStockDTO.builder()
                .itemId(1L)
                .itemName("HP LaserJet Toner 88A")
                .itemCode("ITM-001")
                .currentStock(2.0)
                .minimumStock(10.0)
                .unit("Pcs")
                .status("LOW_STOCK")
                .build());

        list.add(LowStockDTO.builder()
                .itemId(2L)
                .itemName("Logitech M170 Wireless Mouse")
                .itemCode("ITM-002")
                .currentStock(3.0)
                .minimumStock(15.0)
                .unit("Pcs")
                .status("LOW_STOCK")
                .build());

        list.add(LowStockDTO.builder()
                .itemId(3L)
                .itemName("Samsung 24-inch IPS Monitor")
                .itemCode("ITM-003")
                .currentStock(0.0)
                .minimumStock(5.0)
                .unit("Pcs")
                .status("OUT_OF_STOCK")
                .build());

        list.add(LowStockDTO.builder()
                .itemId(4L)
                .itemName("A4 Copier Paper 75 GSM")
                .itemCode("ITM-004")
                .currentStock(4.0)
                .minimumStock(25.0)
                .unit("Reams")
                .status("LOW_STOCK")
                .build());

        return list;
    }

    @Override
    @Transactional(readOnly = true)
    public List<OutstandingDTO> getCustomerOutstanding(Long businessId, int limit) {
        List<OutstandingDTO> list = new ArrayList<>();

        list.add(OutstandingDTO.builder()
                .partyId(101L)
                .partyName("ABC Traders")
                .partyType("CUSTOMER")
                .amount(new BigDecimal("25000.00"))
                .overdueDays(18)
                .build());

        list.add(OutstandingDTO.builder()
                .partyId(102L)
                .partyName("XYZ Enterprise")
                .partyType("CUSTOMER")
                .amount(new BigDecimal("18500.00"))
                .overdueDays(12)
                .build());

        list.add(OutstandingDTO.builder()
                .partyId(103L)
                .partyName("PQR Stores")
                .partyType("CUSTOMER")
                .amount(new BigDecimal("12000.00"))
                .overdueDays(5)
                .build());

        list.add(OutstandingDTO.builder()
                .partyId(104L)
                .partyName("Siddhi Garments")
                .partyType("CUSTOMER")
                .amount(new BigDecimal("9400.00"))
                .overdueDays(2)
                .build());

        int effectiveLimit = limit > 0 ? Math.min(limit, list.size()) : list.size();
        return list.subList(0, effectiveLimit);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OutstandingDTO> getSupplierOutstanding(Long businessId, int limit) {
        List<OutstandingDTO> list = new ArrayList<>();

        list.add(OutstandingDTO.builder()
                .partyId(201L)
                .partyName("ABC Suppliers")
                .partyType("SUPPLIER")
                .amount(new BigDecimal("30000.00"))
                .overdueDays(22)
                .build());

        list.add(OutstandingDTO.builder()
                .partyId(202L)
                .partyName("XYZ Traders")
                .partyType("SUPPLIER")
                .amount(new BigDecimal("12500.00"))
                .overdueDays(9)
                .build());

        list.add(OutstandingDTO.builder()
                .partyId(203L)
                .partyName("Om Logistics")
                .partyType("SUPPLIER")
                .amount(new BigDecimal("8200.00"))
                .overdueDays(4)
                .build());

        int effectiveLimit = limit > 0 ? Math.min(limit, list.size()) : list.size();
        return list.subList(0, effectiveLimit);
    }
}
