package com.risherp.service.impl;

import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import com.risherp.dto.report.*;
import com.risherp.entity.*;
import com.risherp.repository.*;
import com.risherp.service.OutstandingService;
import com.risherp.service.ReportService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.criteria.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ReportServiceImpl implements ReportService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final PurchaseRepository purchaseRepository;
    private final PurchaseItemRepository purchaseItemRepository;
    private final ItemRepository itemRepository;
    private final StockTransactionRepository stockTransactionRepository;
    private final ReceiptRepository receiptRepository;
    private final PaymentTxnRepository paymentTxnRepository;
    private final SalesReturnRepository salesReturnRepository;
    private final PurchaseReturnRepository purchaseReturnRepository;
    private final OutstandingService outstandingService;

    @PersistenceContext
    private EntityManager entityManager;

    // =========================================================================
    // 1. SALES REPORT & ANALYTICS
    // =========================================================================

    @Override
    public ReportPageResponse<SalesReportItemDTO, SalesSummaryDTO> getSalesReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, Long itemId, Long categoryId,
            PaymentStatus paymentStatus, SaleType saleType, SaleStatus status,
            String search, Pageable pageable
    ) {
        Specification<Sale> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("saleDate"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("saleDate"), dateTo));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }
            if (saleType != null) {
                predicates.add(cb.equal(root.get("saleType"), saleType));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchInv = cb.like(cb.lower(root.get("invoiceNumber")), pattern);
                Predicate searchParty = cb.like(cb.lower(root.get("party").get("partyName")), pattern);
                predicates.add(cb.or(searchInv, searchParty));
            }
            if (itemId != null || categoryId != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<SaleItem> itemRoot = subquery.from(SaleItem.class);
                subquery.select(itemRoot.get("sale").get("id"));
                List<Predicate> itemPreds = new ArrayList<>();
                itemPreds.add(cb.equal(itemRoot.get("sale").get("id"), root.get("id")));
                if (itemId != null) {
                    itemPreds.add(cb.equal(itemRoot.get("item").get("id"), itemId));
                }
                if (categoryId != null) {
                    itemPreds.add(cb.equal(itemRoot.get("item").get("category").get("id"), categoryId));
                }
                subquery.where(itemPreds.toArray(new Predicate[0]));
                predicates.add(cb.exists(subquery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Sale> salesPage = saleRepository.findAll(spec, pageable);
        List<SalesReportItemDTO> items = salesPage.getContent().stream().map(s -> SalesReportItemDTO.builder()
                .id(s.getId())
                .invoiceNumber(s.getInvoiceNumber())
                .saleDate(s.getSaleDate())
                .partyId(s.getParty() != null ? s.getParty().getId() : null)
                .partyName(s.getParty() != null ? s.getParty().getPartyName() : "Cash Customer")
                .saleType(s.getSaleType())
                .subtotal(s.getSubtotal())
                .discountAmount(s.getTotalDiscount())
                .taxAmount(BigDecimal.ZERO)
                .grandTotal(s.getGrandTotal())
                .paidAmount(s.getPaidAmount())
                .balanceAmount(s.getBalanceAmount())
                .paymentStatus(s.getPaymentStatus())
                .status(s.getStatus())
                .createdBy(s.getCreatedBy() != null ? s.getCreatedBy().getName() : "System")
                .build()
        ).collect(Collectors.toList());

        SalesSummaryDTO summary = getSalesSummary(businessId, dateFrom, dateTo, partyId, status);
        Page<SalesReportItemDTO> dtoPage = new PageImpl<SalesReportItemDTO>(items, pageable, salesPage.getTotalElements());
        return ReportPageResponse.of(dtoPage, summary);
    }

    @Override
    public SalesSummaryDTO getSalesSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, SaleStatus status) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<Sale> root = query.from(Sale.class);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("business").get("id"), businessId));
        if (dateFrom != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("saleDate"), dateFrom));
        }
        if (dateTo != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("saleDate"), dateTo));
        }
        if (partyId != null) {
            predicates.add(cb.equal(root.get("party").get("id"), partyId));
        }
        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        } else {
            predicates.add(cb.notEqual(root.get("status"), SaleStatus.CANCELLED));
        }

        query.multiselect(
                cb.count(root),
                cb.sum(root.get("grandTotal")),
                cb.sum(root.get("totalDiscount")),
                cb.sum(root.get("paidAmount")),
                cb.sum(root.get("balanceAmount"))
        ).where(predicates.toArray(new Predicate[0]));

        Object[] result = entityManager.createQuery(query).getSingleResult();
        long count = result[0] != null ? ((Number) result[0]).longValue() : 0L;
        BigDecimal totalSales = result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO;
        BigDecimal totalDiscount = result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO;
        BigDecimal totalPaid = result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO;
        BigDecimal totalOutstanding = result[4] != null ? (BigDecimal) result[4] : BigDecimal.ZERO;

        BigDecimal avgInvoice = count > 0
                ? totalSales.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return SalesSummaryDTO.builder()
                .totalInvoices(count)
                .totalSales(totalSales)
                .totalDiscount(totalDiscount)
                .totalPaid(totalPaid)
                .totalOutstanding(totalOutstanding)
                .averageInvoiceValue(avgInvoice)
                .build();
    }

    @Override
    public List<ItemWiseSalesDTO> getItemWiseSales(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId, String search) {
        StringBuilder jpql = new StringBuilder(
                "SELECT si.itemNameSnapshot, si.itemCodeSnapshot, c.categoryName, " +
                "SUM(si.quantity), SUM(si.rate * si.quantity), SUM(si.discountAmount), SUM(si.lineTotal), " +
                "i.id " +
                "FROM SaleItem si " +
                "JOIN si.sale s " +
                "LEFT JOIN si.item i " +
                "LEFT JOIN i.category c " +
                "WHERE s.business.id = :businessId AND s.status <> 'CANCELLED' "
        );

        if (dateFrom != null) {
            jpql.append("AND s.saleDate >= :dateFrom ");
        }
        if (dateTo != null) {
            jpql.append("AND s.saleDate <= :dateTo ");
        }
        if (categoryId != null) {
            jpql.append("AND c.id = :categoryId ");
        }
        if (search != null && !search.trim().isEmpty()) {
            jpql.append("AND (LOWER(si.itemNameSnapshot) LIKE :search OR LOWER(si.itemCodeSnapshot) LIKE :search) ");
        }

        jpql.append("GROUP BY si.itemNameSnapshot, si.itemCodeSnapshot, c.categoryName, i.id ");
        jpql.append("ORDER BY SUM(si.lineTotal) DESC");

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (categoryId != null) query.setParameter("categoryId", categoryId);
        if (search != null && !search.trim().isEmpty()) query.setParameter("search", "%" + search.trim().toLowerCase() + "%");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(r -> {
            String name = (String) r[0];
            String code = (String) r[1];
            String cat = r[2] != null ? (String) r[2] : "Uncategorized";
            BigDecimal qty = r[3] != null ? (BigDecimal) r[3] : BigDecimal.ZERO;
            BigDecimal gross = r[4] != null ? (BigDecimal) r[4] : BigDecimal.ZERO;
            BigDecimal discount = r[5] != null ? (BigDecimal) r[5] : BigDecimal.ZERO;
            BigDecimal net = r[6] != null ? (BigDecimal) r[6] : BigDecimal.ZERO;
            Long itemId = (Long) r[7];

            BigDecimal avgRate = qty.compareTo(BigDecimal.ZERO) > 0
                    ? net.divide(qty, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return ItemWiseSalesDTO.builder()
                    .itemId(itemId)
                    .itemName(name)
                    .itemCode(code)
                    .categoryName(cat)
                    .quantitySold(qty)
                    .grossSales(gross)
                    .discount(discount)
                    .netSales(net)
                    .averageRate(avgRate)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<PartyWiseSalesDTO> getPartyWiseSales(Long businessId, LocalDate dateFrom, LocalDate dateTo, String search) {
        StringBuilder jpql = new StringBuilder(
                "SELECT p.id, p.partyName, p.mobile, COUNT(s), " +
                "SUM(s.subtotal), SUM(s.totalDiscount), SUM(s.grandTotal), " +
                "SUM(s.paidAmount), SUM(s.balanceAmount) " +
                "FROM Sale s " +
                "JOIN s.party p " +
                "WHERE s.business.id = :businessId AND s.status <> 'CANCELLED' "
        );

        if (dateFrom != null) jpql.append("AND s.saleDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND s.saleDate <= :dateTo ");
        if (search != null && !search.trim().isEmpty()) {
            jpql.append("AND (LOWER(p.partyName) LIKE :search OR p.mobile LIKE :search) ");
        }

        jpql.append("GROUP BY p.id, p.partyName, p.mobile ");
        jpql.append("ORDER BY SUM(s.grandTotal) DESC");

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (search != null && !search.trim().isEmpty()) query.setParameter("search", "%" + search.trim().toLowerCase() + "%");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(r -> {
            Long partyId = (Long) r[0];
            String name = (String) r[1];
            String phone = (String) r[2];
            long count = r[3] != null ? ((Number) r[3]).longValue() : 0L;
            BigDecimal subtotal = r[4] != null ? (BigDecimal) r[4] : BigDecimal.ZERO;
            BigDecimal discount = r[5] != null ? (BigDecimal) r[5] : BigDecimal.ZERO;
            BigDecimal net = r[6] != null ? (BigDecimal) r[6] : BigDecimal.ZERO;
            BigDecimal paid = r[7] != null ? (BigDecimal) r[7] : BigDecimal.ZERO;
            BigDecimal balance = r[8] != null ? (BigDecimal) r[8] : BigDecimal.ZERO;

            return PartyWiseSalesDTO.builder()
                    .partyId(partyId)
                    .partyName(name)
                    .phone(phone)
                    .invoiceCount(count)
                    .totalQuantity(BigDecimal.ZERO)
                    .grossSales(subtotal)
                    .discount(discount)
                    .netSales(net)
                    .paidAmount(paid)
                    .outstandingAmount(balance)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<DailySalesDTO> getDailySales(Long businessId, LocalDate dateFrom, LocalDate dateTo) {
        StringBuilder jpql = new StringBuilder(
                "SELECT s.saleDate, COUNT(s), SUM(s.grandTotal), SUM(s.totalDiscount), " +
                "SUM(s.paidAmount), SUM(s.balanceAmount) " +
                "FROM Sale s " +
                "WHERE s.business.id = :businessId AND s.status <> 'CANCELLED' "
        );

        if (dateFrom != null) jpql.append("AND s.saleDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND s.saleDate <= :dateTo ");

        jpql.append("GROUP BY s.saleDate ORDER BY s.saleDate DESC");

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(r -> DailySalesDTO.builder()
                .date((LocalDate) r[0])
                .invoiceCount(r[1] != null ? ((Number) r[1]).longValue() : 0L)
                .totalSales(r[2] != null ? (BigDecimal) r[2] : BigDecimal.ZERO)
                .totalDiscount(r[3] != null ? (BigDecimal) r[3] : BigDecimal.ZERO)
                .totalPaid(r[4] != null ? (BigDecimal) r[4] : BigDecimal.ZERO)
                .outstanding(r[5] != null ? (BigDecimal) r[5] : BigDecimal.ZERO)
                .build()
        ).collect(Collectors.toList());
    }

    // =========================================================================
    // 2. PURCHASE REPORT & ANALYTICS
    // =========================================================================

    @Override
    public ReportPageResponse<PurchaseReportItemDTO, PurchaseSummaryDTO> getPurchaseReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long supplierId, Long itemId, Long categoryId,
            PaymentStatus paymentStatus, PurchaseType purchaseType, PurchaseStatus status,
            String search, Pageable pageable
    ) {
        Specification<Purchase> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), dateTo));
            }
            if (supplierId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), supplierId));
            }
            if (paymentStatus != null) {
                predicates.add(cb.equal(root.get("paymentStatus"), paymentStatus));
            }
            if (purchaseType != null) {
                predicates.add(cb.equal(root.get("purchaseType"), purchaseType));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate searchNum = cb.like(cb.lower(root.get("purchaseNumber")), pattern);
                Predicate searchParty = cb.like(cb.lower(root.get("party").get("partyName")), pattern);
                predicates.add(cb.or(searchNum, searchParty));
            }
            if (itemId != null || categoryId != null) {
                Subquery<Long> subquery = query.subquery(Long.class);
                Root<PurchaseItem> itemRoot = subquery.from(PurchaseItem.class);
                subquery.select(itemRoot.get("purchase").get("id"));
                List<Predicate> itemPreds = new ArrayList<>();
                itemPreds.add(cb.equal(itemRoot.get("purchase").get("id"), root.get("id")));
                if (itemId != null) {
                    itemPreds.add(cb.equal(itemRoot.get("item").get("id"), itemId));
                }
                if (categoryId != null) {
                    itemPreds.add(cb.equal(itemRoot.get("item").get("category").get("id"), categoryId));
                }
                subquery.where(itemPreds.toArray(new Predicate[0]));
                predicates.add(cb.exists(subquery));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Purchase> purchasePage = purchaseRepository.findAll(spec, pageable);
        List<PurchaseReportItemDTO> items = purchasePage.getContent().stream().map(p -> PurchaseReportItemDTO.builder()
                .id(p.getId())
                .purchaseNumber(p.getPurchaseNumber())
                .supplierInvoiceNumber(p.getPurchaseNumber())
                .purchaseDate(p.getPurchaseDate())
                .partyId(p.getParty() != null ? p.getParty().getId() : null)
                .partyName(p.getParty() != null ? p.getParty().getPartyName() : "Cash Supplier")
                .purchaseType(p.getPurchaseType())
                .subtotal(p.getSubtotal())
                .discountAmount(p.getTotalDiscount())
                .taxAmount(BigDecimal.ZERO)
                .grandTotal(p.getGrandTotal())
                .paidAmount(p.getPaidAmount())
                .balanceAmount(p.getBalanceAmount())
                .paymentStatus(p.getPaymentStatus())
                .status(p.getStatus())
                .createdBy(p.getCreatedBy() != null ? p.getCreatedBy().getName() : "System")
                .build()
        ).collect(Collectors.toList());

        PurchaseSummaryDTO summary = getPurchaseSummary(businessId, dateFrom, dateTo, supplierId, status);
        Page<PurchaseReportItemDTO> dtoPage = new PageImpl<PurchaseReportItemDTO>(items, pageable, purchasePage.getTotalElements());
        return ReportPageResponse.of(dtoPage, summary);
    }

    @Override
    public PurchaseSummaryDTO getPurchaseSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long supplierId, PurchaseStatus status) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<Purchase> root = query.from(Purchase.class);

        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("business").get("id"), businessId));
        if (dateFrom != null) {
            predicates.add(cb.greaterThanOrEqualTo(root.get("purchaseDate"), dateFrom));
        }
        if (dateTo != null) {
            predicates.add(cb.lessThanOrEqualTo(root.get("purchaseDate"), dateTo));
        }
        if (supplierId != null) {
            predicates.add(cb.equal(root.get("party").get("id"), supplierId));
        }
        if (status != null) {
            predicates.add(cb.equal(root.get("status"), status));
        } else {
            predicates.add(cb.notEqual(root.get("status"), PurchaseStatus.CANCELLED));
        }

        query.multiselect(
                cb.count(root),
                cb.sum(root.get("grandTotal")),
                cb.sum(root.get("totalDiscount")),
                cb.sum(root.get("paidAmount")),
                cb.sum(root.get("balanceAmount"))
        ).where(predicates.toArray(new Predicate[0]));

        Object[] result = entityManager.createQuery(query).getSingleResult();
        long count = result[0] != null ? ((Number) result[0]).longValue() : 0L;
        BigDecimal totalAmount = result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO;
        BigDecimal totalDiscount = result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO;
        BigDecimal totalPaid = result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO;
        BigDecimal totalPayable = result[4] != null ? (BigDecimal) result[4] : BigDecimal.ZERO;

        BigDecimal avgPurchase = count > 0
                ? totalAmount.divide(BigDecimal.valueOf(count), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return PurchaseSummaryDTO.builder()
                .totalPurchases(count)
                .totalAmount(totalAmount)
                .totalDiscount(totalDiscount)
                .totalPaid(totalPaid)
                .totalPayable(totalPayable)
                .averagePurchaseValue(avgPurchase)
                .build();
    }

    @Override
    public List<ItemWisePurchaseDTO> getItemWisePurchases(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId, String search) {
        StringBuilder jpql = new StringBuilder(
                "SELECT pi.itemNameSnapshot, pi.itemCodeSnapshot, c.categoryName, " +
                "SUM(pi.quantity), SUM(pi.rate * pi.quantity), SUM(pi.discountAmount), SUM(pi.lineTotal), " +
                "i.id " +
                "FROM PurchaseItem pi " +
                "JOIN pi.purchase p " +
                "LEFT JOIN pi.item i " +
                "LEFT JOIN i.category c " +
                "WHERE p.business.id = :businessId AND p.status <> 'CANCELLED' "
        );

        if (dateFrom != null) jpql.append("AND p.purchaseDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND p.purchaseDate <= :dateTo ");
        if (categoryId != null) jpql.append("AND c.id = :categoryId ");
        if (search != null && !search.trim().isEmpty()) {
            jpql.append("AND (LOWER(pi.itemNameSnapshot) LIKE :search OR LOWER(pi.itemCodeSnapshot) LIKE :search) ");
        }

        jpql.append("GROUP BY pi.itemNameSnapshot, pi.itemCodeSnapshot, c.categoryName, i.id ");
        jpql.append("ORDER BY SUM(pi.lineTotal) DESC");

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (categoryId != null) query.setParameter("categoryId", categoryId);
        if (search != null && !search.trim().isEmpty()) query.setParameter("search", "%" + search.trim().toLowerCase() + "%");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(r -> {
            String name = (String) r[0];
            String code = (String) r[1];
            String cat = r[2] != null ? (String) r[2] : "Uncategorized";
            BigDecimal qty = r[3] != null ? (BigDecimal) r[3] : BigDecimal.ZERO;
            BigDecimal gross = r[4] != null ? (BigDecimal) r[4] : BigDecimal.ZERO;
            BigDecimal discount = r[5] != null ? (BigDecimal) r[5] : BigDecimal.ZERO;
            BigDecimal net = r[6] != null ? (BigDecimal) r[6] : BigDecimal.ZERO;
            Long itemId = (Long) r[7];

            BigDecimal avgRate = qty.compareTo(BigDecimal.ZERO) > 0
                    ? net.divide(qty, 2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return ItemWisePurchaseDTO.builder()
                    .itemId(itemId)
                    .itemName(name)
                    .itemCode(code)
                    .categoryName(cat)
                    .quantityPurchased(qty)
                    .grossPurchases(gross)
                    .discount(discount)
                    .netPurchases(net)
                    .averageRate(avgRate)
                    .build();
        }).collect(Collectors.toList());
    }

    @Override
    public List<SupplierWisePurchaseDTO> getSupplierWisePurchases(Long businessId, LocalDate dateFrom, LocalDate dateTo, String search) {
        StringBuilder jpql = new StringBuilder(
                "SELECT p.id, p.partyName, p.mobile, COUNT(pr), " +
                "SUM(pr.subtotal), SUM(pr.totalDiscount), SUM(pr.grandTotal), " +
                "SUM(pr.paidAmount), SUM(pr.balanceAmount) " +
                "FROM Purchase pr " +
                "JOIN pr.party p " +
                "WHERE pr.business.id = :businessId AND pr.status <> 'CANCELLED' "
        );

        if (dateFrom != null) jpql.append("AND pr.purchaseDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND pr.purchaseDate <= :dateTo ");
        if (search != null && !search.trim().isEmpty()) {
            jpql.append("AND (LOWER(p.partyName) LIKE :search OR p.mobile LIKE :search) ");
        }

        jpql.append("GROUP BY p.id, p.partyName, p.mobile ");
        jpql.append("ORDER BY SUM(pr.grandTotal) DESC");

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (search != null && !search.trim().isEmpty()) query.setParameter("search", "%" + search.trim().toLowerCase() + "%");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(r -> {
            Long partyId = (Long) r[0];
            String name = (String) r[1];
            String phone = (String) r[2];
            long count = r[3] != null ? ((Number) r[3]).longValue() : 0L;
            BigDecimal subtotal = r[4] != null ? (BigDecimal) r[4] : BigDecimal.ZERO;
            BigDecimal discount = r[5] != null ? (BigDecimal) r[5] : BigDecimal.ZERO;
            BigDecimal net = r[6] != null ? (BigDecimal) r[6] : BigDecimal.ZERO;
            BigDecimal paid = r[7] != null ? (BigDecimal) r[7] : BigDecimal.ZERO;
            BigDecimal balance = r[8] != null ? (BigDecimal) r[8] : BigDecimal.ZERO;

            return SupplierWisePurchaseDTO.builder()
                    .partyId(partyId)
                    .supplierName(name)
                    .phone(phone)
                    .invoiceCount(count)
                    .totalQuantity(BigDecimal.ZERO)
                    .grossPurchases(subtotal)
                    .discount(discount)
                    .netPurchases(net)
                    .paidAmount(paid)
                    .outstandingAmount(balance)
                    .build();
        }).collect(Collectors.toList());
    }

    // =========================================================================
    // 3. STOCK REPORT & MOVEMENT
    // =========================================================================

    @Override
    public ReportPageResponse<StockReportItemDTO, StockSummaryDTO> getStockReport(
            Long businessId, Long categoryId, StockStatus stockStatus,
            String search, Pageable pageable
    ) {
        Specification<Item> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (categoryId != null) {
                predicates.add(cb.equal(root.get("category").get("id"), categoryId));
            }
            if (stockStatus != null) {
                if (stockStatus == StockStatus.OUT_OF_STOCK) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("currentStock"), BigDecimal.ZERO));
                } else if (stockStatus == StockStatus.LOW_STOCK) {
                    predicates.add(cb.greaterThan(root.get("currentStock"), BigDecimal.ZERO));
                    predicates.add(cb.lessThanOrEqualTo(root.get("currentStock"), root.get("minimumStock")));
                } else if (stockStatus == StockStatus.IN_STOCK) {
                    predicates.add(cb.greaterThan(root.get("currentStock"), root.get("minimumStock")));
                }
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate sName = cb.like(cb.lower(root.get("itemName")), pattern);
                Predicate sCode = cb.like(cb.lower(root.get("itemCode")), pattern);
                predicates.add(cb.or(sName, sCode));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Item> itemPage = itemRepository.findAll(spec, pageable);
        List<StockReportItemDTO> items = itemPage.getContent().stream().map(i -> {
            BigDecimal stockVal = i.getCurrentStock() != null && i.getPurchaseRate() != null
                    ? i.getCurrentStock().multiply(i.getPurchaseRate()).setScale(2, RoundingMode.HALF_UP)
                    : BigDecimal.ZERO;

            return StockReportItemDTO.builder()
                    .id(i.getId())
                    .itemCode(i.getItemCode())
                    .itemName(i.getItemName())
                    .categoryName(i.getCategory() != null ? i.getCategory().getCategoryName() : "Uncategorized")
                    .unit(i.getUnit())
                    .currentStock(i.getCurrentStock())
                    .minimumStock(i.getMinimumStock())
                    .purchaseRate(i.getPurchaseRate())
                    .saleRate(i.getSaleRate())
                    .stockValue(stockVal)
                    .stockStatus(i.getStockStatus())
                    .build();
        }).collect(Collectors.toList());

        StockSummaryDTO summary = getStockSummary(businessId);
        Page<StockReportItemDTO> dtoPage = new PageImpl<StockReportItemDTO>(items, pageable, itemPage.getTotalElements());
        return ReportPageResponse.of(dtoPage, summary);
    }

    @Override
    public StockSummaryDTO getStockSummary(Long businessId) {
        CriteriaBuilder cb = entityManager.getCriteriaBuilder();
        CriteriaQuery<Object[]> query = cb.createQuery(Object[].class);
        Root<Item> root = query.from(Item.class);

        query.multiselect(
                cb.count(root),
                cb.sum(root.get("currentStock")),
                cb.sum(cb.prod(root.get("currentStock"), root.get("purchaseRate")))
        ).where(cb.equal(root.get("business").get("id"), businessId));

        Object[] result = entityManager.createQuery(query).getSingleResult();
        long totalItems = result[0] != null ? ((Number) result[0]).longValue() : 0L;
        BigDecimal totalStock = result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO;
        BigDecimal totalValue = result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO;

        long outOfStock = itemRepository.count(
                (r, q, b) -> b.and(
                        b.equal(r.get("business").get("id"), businessId),
                        b.lessThanOrEqualTo(r.get("currentStock"), BigDecimal.ZERO)
                )
        );

        long lowStock = itemRepository.count(
                (r, q, b) -> b.and(
                        b.equal(r.get("business").get("id"), businessId),
                        b.greaterThan(r.get("currentStock"), BigDecimal.ZERO),
                        b.lessThanOrEqualTo(r.get("currentStock"), r.get("minimumStock"))
                )
        );

        return StockSummaryDTO.builder()
                .totalItems(totalItems)
                .totalStockQuantity(totalStock)
                .totalStockValue(totalValue.setScale(2, RoundingMode.HALF_UP))
                .lowStockItems(lowStock)
                .outOfStockItems(outOfStock)
                .build();
    }

    @Override
    public Page<StockMovementDTO> getStockMovement(
            Long businessId, Long itemId, LocalDate dateFrom, LocalDate dateTo,
            String transactionType, String referenceType, String search, Pageable pageable
    ) {
        Specification<StockTransaction> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (itemId != null) {
                predicates.add(cb.equal(root.get("item").get("id"), itemId));
            }
            if (dateFrom != null) {
                LocalDateTime start = dateFrom.atStartOfDay();
                predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), start));
            }
            if (dateTo != null) {
                LocalDateTime end = dateTo.atTime(LocalTime.MAX);
                predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), end));
            }
            if (transactionType != null && !transactionType.isEmpty()) {
                predicates.add(cb.equal(root.get("txnType"), StockTxnType.valueOf(transactionType)));
            }
            if (referenceType != null && !referenceType.isEmpty()) {
                predicates.add(cb.equal(root.get("referenceType"), referenceType));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate sItem = cb.like(cb.lower(root.get("itemNameSnapshot")), pattern);
                Predicate sRef = cb.like(cb.lower(root.get("referenceNumber")), pattern);
                predicates.add(cb.or(sItem, sRef));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<StockTransaction> txPage = stockTransactionRepository.findAll(spec, pageable);
        List<StockMovementDTO> dtoList = txPage.getContent().stream().map(st -> {
            BigDecimal rate = st.getItem() != null ? st.getItem().getPurchaseRate() : BigDecimal.ZERO;
            BigDecimal val = rate.multiply(st.getQuantity()).setScale(2, RoundingMode.HALF_UP);

            return StockMovementDTO.builder()
                    .id(st.getId())
                    .transactionDate(st.getCreatedAt())
                    .itemId(st.getItem() != null ? st.getItem().getId() : null)
                    .itemCode(st.getItemCodeSnapshot())
                    .itemName(st.getItemNameSnapshot())
                    .transactionType(st.getTxnType().name())
                    .referenceType(st.getReferenceType())
                    .referenceNumber(st.getReferenceNumber())
                    .quantity(st.getQuantity())
                    .stockBefore(st.getStockBefore())
                    .stockAfter(st.getStockAfter())
                    .purchaseRate(rate)
                    .stockValue(val)
                    .createdBy("System")
                    .build();
        }).collect(Collectors.toList());

        return new PageImpl<StockMovementDTO>(dtoList, pageable, txPage.getTotalElements());
    }

    @Override
    public List<LowStockDTO> getLowStockReport(Long businessId, Long categoryId, String search) {
        StringBuilder jpql = new StringBuilder(
                "SELECT i FROM Item i LEFT JOIN i.category c " +
                "WHERE i.business.id = :businessId AND i.status = 'ACTIVE' " +
                "AND i.currentStock <= i.minimumStock "
        );

        if (categoryId != null) {
            jpql.append("AND c.id = :categoryId ");
        }
        if (search != null && !search.trim().isEmpty()) {
            jpql.append("AND (LOWER(i.itemName) LIKE :search OR LOWER(i.itemCode) LIKE :search) ");
        }

        jpql.append("ORDER BY (i.minimumStock - i.currentStock) DESC");

        var query = entityManager.createQuery(jpql.toString(), Item.class);
        query.setParameter("businessId", businessId);
        if (categoryId != null) query.setParameter("categoryId", categoryId);
        if (search != null && !search.trim().isEmpty()) query.setParameter("search", "%" + search.trim().toLowerCase() + "%");

        List<Item> items = query.getResultList();
        return items.stream().map(i -> {
            BigDecimal shortage = i.getMinimumStock().subtract(i.getCurrentStock());
            if (shortage.compareTo(BigDecimal.ZERO) < 0) shortage = BigDecimal.ZERO;

            return LowStockDTO.builder()
                    .itemId(i.getId())
                    .itemCode(i.getItemCode())
                    .itemName(i.getItemName())
                    .categoryName(i.getCategory() != null ? i.getCategory().getCategoryName() : "Uncategorized")
                    .unit(i.getUnit())
                    .currentStock(i.getCurrentStock())
                    .minimumStock(i.getMinimumStock())
                    .shortage(shortage)
                    .status(i.getStockStatus())
                    .build();
        }).collect(Collectors.toList());
    }

    // =========================================================================
    // 4. PROFIT REPORT (COGS & GROSS PROFIT)
    // =========================================================================

    @Override
    public ProfitSummaryDTO getProfitSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId) {
        StringBuilder jpql = new StringBuilder(
                "SELECT SUM(si.quantity), " +
                "SUM(si.rate * si.quantity), " +
                "SUM(si.discountAmount), " +
                "SUM(si.lineTotal), " +
                "SUM(si.quantity * COALESCE(i.purchaseRate, 0)), " +
                "COUNT(DISTINCT s.id) " +
                "FROM SaleItem si " +
                "JOIN si.sale s " +
                "LEFT JOIN si.item i " +
                "LEFT JOIN i.category c " +
                "WHERE s.business.id = :businessId AND s.status <> 'CANCELLED' "
        );

        if (dateFrom != null) jpql.append("AND s.saleDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND s.saleDate <= :dateTo ");
        if (categoryId != null) jpql.append("AND c.id = :categoryId ");

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (categoryId != null) query.setParameter("categoryId", categoryId);

        Object[] result = (Object[]) query.getSingleResult();
        BigDecimal totalQty = result[0] != null ? (BigDecimal) result[0] : BigDecimal.ZERO;
        BigDecimal grossSales = result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO;
        BigDecimal discount = result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO;
        BigDecimal netSales = result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO;
        BigDecimal cogs = result[4] != null ? (BigDecimal) result[4] : BigDecimal.ZERO;
        long invoiceCount = result[5] != null ? ((Number) result[5]).longValue() : 0L;

        BigDecimal grossProfit = netSales.subtract(cogs);
        BigDecimal marginPct = BigDecimal.ZERO;
        if (netSales.compareTo(BigDecimal.ZERO) > 0) {
            marginPct = grossProfit.multiply(BigDecimal.valueOf(100))
                    .divide(netSales, 2, RoundingMode.HALF_UP);
        }

        return ProfitSummaryDTO.builder()
                .grossSales(grossSales.setScale(2, RoundingMode.HALF_UP))
                .salesDiscount(discount.setScale(2, RoundingMode.HALF_UP))
                .netSales(netSales.setScale(2, RoundingMode.HALF_UP))
                .costOfGoodsSold(cogs.setScale(2, RoundingMode.HALF_UP))
                .grossProfit(grossProfit.setScale(2, RoundingMode.HALF_UP))
                .grossMarginPercentage(marginPct)
                .totalInvoices(invoiceCount)
                .totalQuantitySold(totalQty)
                .methodologyNote("Gross Profit = Net Sales - Cost of Goods Sold (COGS). Cost basis is calculated from historical item purchase rates. Does not deduct operating expenses.")
                .build();
    }

    @Override
    public List<ItemWiseProfitDTO> getItemWiseProfit(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long categoryId, String search) {
        StringBuilder jpql = new StringBuilder(
                "SELECT si.itemNameSnapshot, si.itemCodeSnapshot, c.categoryName, " +
                "SUM(si.quantity), SUM(si.rate * si.quantity), SUM(si.discountAmount), SUM(si.lineTotal), " +
                "COALESCE(i.purchaseRate, 0), " +
                "SUM(si.quantity * COALESCE(i.purchaseRate, 0)), " +
                "i.id " +
                "FROM SaleItem si " +
                "JOIN si.sale s " +
                "LEFT JOIN si.item i " +
                "LEFT JOIN i.category c " +
                "WHERE s.business.id = :businessId AND s.status <> 'CANCELLED' "
        );

        if (dateFrom != null) jpql.append("AND s.saleDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND s.saleDate <= :dateTo ");
        if (categoryId != null) jpql.append("AND c.id = :categoryId ");
        if (search != null && !search.trim().isEmpty()) {
            jpql.append("AND (LOWER(si.itemNameSnapshot) LIKE :search OR LOWER(si.itemCodeSnapshot) LIKE :search) ");
        }

        jpql.append("GROUP BY si.itemNameSnapshot, si.itemCodeSnapshot, c.categoryName, i.purchaseRate, i.id ");
        jpql.append("ORDER BY (SUM(si.lineTotal) - SUM(si.quantity * COALESCE(i.purchaseRate, 0))) DESC");

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (categoryId != null) query.setParameter("categoryId", categoryId);
        if (search != null && !search.trim().isEmpty()) query.setParameter("search", "%" + search.trim().toLowerCase() + "%");

        @SuppressWarnings("unchecked")
        List<Object[]> rows = query.getResultList();
        return rows.stream().map(r -> {
            String name = (String) r[0];
            String code = (String) r[1];
            String cat = r[2] != null ? (String) r[2] : "Uncategorized";
            BigDecimal qty = r[3] != null ? (BigDecimal) r[3] : BigDecimal.ZERO;
            BigDecimal gross = r[4] != null ? (BigDecimal) r[4] : BigDecimal.ZERO;
            BigDecimal discount = r[5] != null ? (BigDecimal) r[5] : BigDecimal.ZERO;
            BigDecimal net = r[6] != null ? (BigDecimal) r[6] : BigDecimal.ZERO;
            BigDecimal unitCost = r[7] != null ? (BigDecimal) r[7] : BigDecimal.ZERO;
            BigDecimal totalCost = r[8] != null ? (BigDecimal) r[8] : BigDecimal.ZERO;
            Long itemId = (Long) r[9];

            BigDecimal grossProfit = net.subtract(totalCost);
            BigDecimal marginPct = BigDecimal.ZERO;
            if (net.compareTo(BigDecimal.ZERO) > 0) {
                marginPct = grossProfit.multiply(BigDecimal.valueOf(100))
                        .divide(net, 2, RoundingMode.HALF_UP);
            }

            return ItemWiseProfitDTO.builder()
                    .itemId(itemId)
                    .itemName(name)
                    .itemCode(code)
                    .categoryName(cat)
                    .quantitySold(qty)
                    .grossSales(gross)
                    .discount(discount)
                    .netSales(net)
                    .unitCost(unitCost)
                    .totalCost(totalCost)
                    .grossProfit(grossProfit)
                    .marginPercentage(marginPct)
                    .build();
        }).collect(Collectors.toList());
    }

    // =========================================================================
    // 5. OUTSTANDING REPORTS (REUSING PHASE 15 OUTSTANDING SERVICE)
    // =========================================================================

    @Override
    public Page<CustomerOutstandingDTO> getCustomerOutstandingReport(
            Long businessId, String search, LocalDate dateFrom, LocalDate dateTo, Pageable pageable
    ) {
        return outstandingService.getCustomerOutstanding(businessId, search, dateFrom, dateTo, pageable);
    }

    @Override
    public Page<SupplierOutstandingDTO> getSupplierOutstandingReport(
            Long businessId, String search, LocalDate dateFrom, LocalDate dateTo, Pageable pageable
    ) {
        return outstandingService.getSupplierOutstanding(businessId, search, dateFrom, dateTo, pageable);
    }

    // =========================================================================
    // 6. RECEIPT REPORT & SUMMARY
    // =========================================================================

    @Override
    public ReportPageResponse<ReceiptReportItemDTO, ReceiptSummaryDTO> getReceiptReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, PaymentMode paymentMode, ReceiptStatus status,
            String search, Pageable pageable
    ) {
        Specification<Receipt> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("receiptDate"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("receiptDate"), dateTo));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (paymentMode != null) {
                predicates.add(cb.equal(root.get("paymentMode"), paymentMode));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate sNum = cb.like(cb.lower(root.get("receiptNumber")), pattern);
                Predicate sParty = cb.like(cb.lower(root.get("party").get("partyName")), pattern);
                predicates.add(cb.or(sNum, sParty));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Receipt> rPage = receiptRepository.findAll(spec, pageable);
        List<ReceiptReportItemDTO> items = rPage.getContent().stream().map(r -> ReceiptReportItemDTO.builder()
                .id(r.getId())
                .receiptNumber(r.getReceiptNumber())
                .receiptDate(r.getReceiptDate())
                .partyId(r.getParty() != null ? r.getParty().getId() : null)
                .partyName(r.getParty() != null ? r.getParty().getPartyName() : "Customer")
                .amount(r.getAmount())
                .paymentMode(r.getPaymentMode())
                .referenceNumber(r.getReferenceNumber())
                .allocatedAmount(r.getAllocatedAmount())
                .unallocatedAmount(r.getUnallocatedAmount())
                .status(r.getStatus())
                .createdBy("System")
                .build()
        ).collect(Collectors.toList());

        ReceiptSummaryDTO summary = getReceiptSummary(businessId, dateFrom, dateTo, partyId, status);
        Page<ReceiptReportItemDTO> dtoPage = new PageImpl<ReceiptReportItemDTO>(items, pageable, rPage.getTotalElements());
        return ReportPageResponse.of(dtoPage, summary);
    }

    @Override
    public ReceiptSummaryDTO getReceiptSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, ReceiptStatus status) {
        StringBuilder jpql = new StringBuilder(
                "SELECT COUNT(r), " +
                "SUM(r.amount), " +
                "SUM(CASE WHEN r.paymentMode = 'CASH' THEN r.amount ELSE 0 END), " +
                "SUM(CASE WHEN r.paymentMode = 'BANK_TRANSFER' THEN r.amount ELSE 0 END), " +
                "SUM(CASE WHEN r.paymentMode = 'UPI' THEN r.amount ELSE 0 END), " +
                "SUM(CASE WHEN r.paymentMode = 'CHEQUE' THEN r.amount ELSE 0 END), " +
                "SUM(CASE WHEN r.paymentMode = 'CARD' THEN r.amount ELSE 0 END), " +
                "SUM(CASE WHEN r.paymentMode NOT IN ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD') THEN r.amount ELSE 0 END), " +
                "SUM(r.allocatedAmount), " +
                "SUM(r.unallocatedAmount) " +
                "FROM Receipt r WHERE r.business.id = :businessId "
        );

        if (dateFrom != null) jpql.append("AND r.receiptDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND r.receiptDate <= :dateTo ");
        if (partyId != null) jpql.append("AND r.party.id = :partyId ");
        if (status != null) {
            jpql.append("AND r.status = :status ");
        } else {
            jpql.append("AND r.status = 'COMPLETED' ");
        }

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (partyId != null) query.setParameter("partyId", partyId);
        if (status != null) query.setParameter("status", status);

        Object[] result = (Object[]) query.getSingleResult();
        return ReceiptSummaryDTO.builder()
                .totalReceipts(result[0] != null ? ((Number) result[0]).longValue() : 0L)
                .totalAmount(result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO)
                .cashAmount(result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO)
                .bankAmount(result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO)
                .upiAmount(result[4] != null ? (BigDecimal) result[4] : BigDecimal.ZERO)
                .chequeAmount(result[5] != null ? (BigDecimal) result[5] : BigDecimal.ZERO)
                .cardAmount(result[6] != null ? (BigDecimal) result[6] : BigDecimal.ZERO)
                .otherAmount(result[7] != null ? (BigDecimal) result[7] : BigDecimal.ZERO)
                .allocatedAmount(result[8] != null ? (BigDecimal) result[8] : BigDecimal.ZERO)
                .unallocatedAmount(result[9] != null ? (BigDecimal) result[9] : BigDecimal.ZERO)
                .build();
    }

    // =========================================================================
    // 7. PAYMENT REPORT & SUMMARY
    // =========================================================================

    @Override
    public ReportPageResponse<PaymentReportItemDTO, PaymentSummaryDTO> getPaymentReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, PaymentMode paymentMode, PaymentTxnStatus status,
            String search, Pageable pageable
    ) {
        Specification<PaymentTxn> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("paymentDate"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("paymentDate"), dateTo));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (paymentMode != null) {
                predicates.add(cb.equal(root.get("paymentMode"), paymentMode));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate sNum = cb.like(cb.lower(root.get("paymentNumber")), pattern);
                Predicate sParty = cb.like(cb.lower(root.get("party").get("partyName")), pattern);
                predicates.add(cb.or(sNum, sParty));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PaymentTxn> pPage = paymentTxnRepository.findAll(spec, pageable);
        List<PaymentReportItemDTO> items = pPage.getContent().stream().map(p -> PaymentReportItemDTO.builder()
                .id(p.getId())
                .paymentNumber(p.getPaymentNumber())
                .paymentDate(p.getPaymentDate())
                .partyId(p.getParty() != null ? p.getParty().getId() : null)
                .partyName(p.getParty() != null ? p.getParty().getPartyName() : "Supplier")
                .amount(p.getAmount())
                .paymentMode(p.getPaymentMode())
                .referenceNumber(p.getReferenceNumber())
                .allocatedAmount(p.getAllocatedAmount())
                .unallocatedAmount(p.getUnallocatedAmount())
                .status(p.getStatus())
                .createdBy("System")
                .build()
        ).collect(Collectors.toList());

        PaymentSummaryDTO summary = getPaymentSummary(businessId, dateFrom, dateTo, partyId, status);
        Page<PaymentReportItemDTO> dtoPage = new PageImpl<PaymentReportItemDTO>(items, pageable, pPage.getTotalElements());
        return ReportPageResponse.of(dtoPage, summary);
    }

    @Override
    public PaymentSummaryDTO getPaymentSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, PaymentTxnStatus status) {
        StringBuilder jpql = new StringBuilder(
                "SELECT COUNT(p), " +
                "SUM(p.amount), " +
                "SUM(CASE WHEN p.paymentMode = 'CASH' THEN p.amount ELSE 0 END), " +
                "SUM(CASE WHEN p.paymentMode = 'BANK_TRANSFER' THEN p.amount ELSE 0 END), " +
                "SUM(CASE WHEN p.paymentMode = 'UPI' THEN p.amount ELSE 0 END), " +
                "SUM(CASE WHEN p.paymentMode = 'CHEQUE' THEN p.amount ELSE 0 END), " +
                "SUM(CASE WHEN p.paymentMode = 'CARD' THEN p.amount ELSE 0 END), " +
                "SUM(CASE WHEN p.paymentMode NOT IN ('CASH', 'BANK_TRANSFER', 'UPI', 'CHEQUE', 'CARD') THEN p.amount ELSE 0 END), " +
                "SUM(p.allocatedAmount), " +
                "SUM(p.unallocatedAmount) " +
                "FROM PaymentTxn p WHERE p.business.id = :businessId "
        );

        if (dateFrom != null) jpql.append("AND p.paymentDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND p.paymentDate <= :dateTo ");
        if (partyId != null) jpql.append("AND p.party.id = :partyId ");
        if (status != null) {
            jpql.append("AND p.status = :status ");
        } else {
            jpql.append("AND p.status = 'COMPLETED' ");
        }

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (partyId != null) query.setParameter("partyId", partyId);
        if (status != null) query.setParameter("status", status);

        Object[] result = (Object[]) query.getSingleResult();
        return PaymentSummaryDTO.builder()
                .totalPayments(result[0] != null ? ((Number) result[0]).longValue() : 0L)
                .totalAmount(result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO)
                .cashAmount(result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO)
                .bankAmount(result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO)
                .upiAmount(result[4] != null ? (BigDecimal) result[4] : BigDecimal.ZERO)
                .chequeAmount(result[5] != null ? (BigDecimal) result[5] : BigDecimal.ZERO)
                .cardAmount(result[6] != null ? (BigDecimal) result[6] : BigDecimal.ZERO)
                .otherAmount(result[7] != null ? (BigDecimal) result[7] : BigDecimal.ZERO)
                .allocatedAmount(result[8] != null ? (BigDecimal) result[8] : BigDecimal.ZERO)
                .unallocatedAmount(result[9] != null ? (BigDecimal) result[9] : BigDecimal.ZERO)
                .build();
    }

    // =========================================================================
    // 8. SALES RETURN REPORT & SUMMARY
    // =========================================================================

    @Override
    public ReportPageResponse<SalesReturnReportItemDTO, SalesReturnSummaryDTO> getSalesReturnReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, SalesReturnStatus status,
            String search, Pageable pageable
    ) {
        Specification<SalesReturn> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("returnDate"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("returnDate"), dateTo));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate sNum = cb.like(cb.lower(root.get("returnNumber")), pattern);
                Predicate sParty = cb.like(cb.lower(root.get("party").get("partyName")), pattern);
                Predicate sInv = cb.like(cb.lower(root.get("sale").get("invoiceNumber")), pattern);
                predicates.add(cb.or(sNum, sParty, sInv));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<SalesReturn> srPage = salesReturnRepository.findAll(spec, pageable);
        List<SalesReturnReportItemDTO> items = srPage.getContent().stream().map(sr -> SalesReturnReportItemDTO.builder()
                .id(sr.getId())
                .returnNumber(sr.getReturnNumber())
                .returnDate(sr.getReturnDate())
                .invoiceNumber(sr.getSale() != null ? sr.getSale().getInvoiceNumber() : "N/A")
                .partyId(sr.getParty() != null ? sr.getParty().getId() : null)
                .partyName(sr.getParty() != null ? sr.getParty().getPartyName() : "Customer")
                .returnAmount(sr.getReturnAmount())
                .refundAmount(sr.getRefundAmount())
                .adjustmentAmount(sr.getAdjustmentAmount())
                .reason(sr.getReason())
                .status(sr.getStatus())
                .createdBy(sr.getCreatedBy() != null ? sr.getCreatedBy().getName() : "System")
                .build()
        ).collect(Collectors.toList());

        SalesReturnSummaryDTO summary = getSalesReturnSummary(businessId, dateFrom, dateTo, partyId, status);
        Page<SalesReturnReportItemDTO> dtoPage = new PageImpl<SalesReturnReportItemDTO>(items, pageable, srPage.getTotalElements());
        return ReportPageResponse.of(dtoPage, summary);
    }

    @Override
    public SalesReturnSummaryDTO getSalesReturnSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, SalesReturnStatus status) {
        StringBuilder jpql = new StringBuilder(
                "SELECT COUNT(sr), SUM(sr.returnAmount), SUM(sr.refundAmount), SUM(sr.adjustmentAmount) " +
                "FROM SalesReturn sr WHERE sr.business.id = :businessId "
        );

        if (dateFrom != null) jpql.append("AND sr.returnDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND sr.returnDate <= :dateTo ");
        if (partyId != null) jpql.append("AND sr.party.id = :partyId ");
        if (status != null) {
            jpql.append("AND sr.status = :status ");
        } else {
            jpql.append("AND sr.status = 'COMPLETED' ");
        }

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (partyId != null) query.setParameter("partyId", partyId);
        if (status != null) query.setParameter("status", status);

        Object[] result = (Object[]) query.getSingleResult();
        return SalesReturnSummaryDTO.builder()
                .totalReturns(result[0] != null ? ((Number) result[0]).longValue() : 0L)
                .totalReturnAmount(result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO)
                .totalRefundAmount(result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO)
                .totalAdjustmentAmount(result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO)
                .build();
    }

    // =========================================================================
    // 9. PURCHASE RETURN REPORT & SUMMARY
    // =========================================================================

    @Override
    public ReportPageResponse<PurchaseReturnReportItemDTO, PurchaseReturnSummaryDTO> getPurchaseReturnReport(
            Long businessId, LocalDate dateFrom, LocalDate dateTo,
            Long partyId, PurchaseReturnStatus status,
            String search, Pageable pageable
    ) {
        Specification<PurchaseReturn> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("business").get("id"), businessId));

            if (dateFrom != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("returnDate"), dateFrom));
            }
            if (dateTo != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("returnDate"), dateTo));
            }
            if (partyId != null) {
                predicates.add(cb.equal(root.get("party").get("id"), partyId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (search != null && !search.trim().isEmpty()) {
                String pattern = "%" + search.trim().toLowerCase() + "%";
                Predicate sNum = cb.like(cb.lower(root.get("returnNumber")), pattern);
                Predicate sParty = cb.like(cb.lower(root.get("party").get("partyName")), pattern);
                Predicate sPur = cb.like(cb.lower(root.get("purchase").get("purchaseNumber")), pattern);
                predicates.add(cb.or(sNum, sParty, sPur));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<PurchaseReturn> prPage = purchaseReturnRepository.findAll(spec, pageable);
        List<PurchaseReturnReportItemDTO> items = prPage.getContent().stream().map(pr -> PurchaseReturnReportItemDTO.builder()
                .id(pr.getId())
                .returnNumber(pr.getReturnNumber())
                .returnDate(pr.getReturnDate())
                .purchaseNumber(pr.getPurchase() != null ? pr.getPurchase().getPurchaseNumber() : "N/A")
                .partyId(pr.getParty() != null ? pr.getParty().getId() : null)
                .partyName(pr.getParty() != null ? pr.getParty().getPartyName() : "Supplier")
                .returnAmount(pr.getReturnAmount())
                .refundAmount(pr.getRefundAmount())
                .adjustmentAmount(pr.getAdjustmentAmount())
                .reason(pr.getReason())
                .status(pr.getStatus())
                .createdBy(pr.getCreatedBy() != null ? pr.getCreatedBy().getName() : "System")
                .build()
        ).collect(Collectors.toList());

        PurchaseReturnSummaryDTO summary = getPurchaseReturnSummary(businessId, dateFrom, dateTo, partyId, status);
        Page<PurchaseReturnReportItemDTO> dtoPage = new PageImpl<PurchaseReturnReportItemDTO>(items, pageable, prPage.getTotalElements());
        return ReportPageResponse.of(dtoPage, summary);
    }

    @Override
    public PurchaseReturnSummaryDTO getPurchaseReturnSummary(Long businessId, LocalDate dateFrom, LocalDate dateTo, Long partyId, PurchaseReturnStatus status) {
        StringBuilder jpql = new StringBuilder(
                "SELECT COUNT(pr), SUM(pr.returnAmount), SUM(pr.refundAmount), SUM(pr.adjustmentAmount) " +
                "FROM PurchaseReturn pr WHERE pr.business.id = :businessId "
        );

        if (dateFrom != null) jpql.append("AND pr.returnDate >= :dateFrom ");
        if (dateTo != null) jpql.append("AND pr.returnDate <= :dateTo ");
        if (partyId != null) jpql.append("AND pr.party.id = :partyId ");
        if (status != null) {
            jpql.append("AND pr.status = :status ");
        } else {
            jpql.append("AND pr.status = 'COMPLETED' ");
        }

        var query = entityManager.createQuery(jpql.toString());
        query.setParameter("businessId", businessId);
        if (dateFrom != null) query.setParameter("dateFrom", dateFrom);
        if (dateTo != null) query.setParameter("dateTo", dateTo);
        if (partyId != null) query.setParameter("partyId", partyId);
        if (status != null) query.setParameter("status", status);

        Object[] result = (Object[]) query.getSingleResult();
        return PurchaseReturnSummaryDTO.builder()
                .totalReturns(result[0] != null ? ((Number) result[0]).longValue() : 0L)
                .totalReturnAmount(result[1] != null ? (BigDecimal) result[1] : BigDecimal.ZERO)
                .totalRefundAmount(result[2] != null ? (BigDecimal) result[2] : BigDecimal.ZERO)
                .totalAdjustmentAmount(result[3] != null ? (BigDecimal) result[3] : BigDecimal.ZERO)
                .build();
    }
}
