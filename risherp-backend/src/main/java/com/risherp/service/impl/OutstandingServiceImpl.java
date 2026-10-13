package com.risherp.service.impl;

import com.risherp.dto.outstanding.CustomerOutstandingDTO;
import com.risherp.dto.outstanding.InvoiceOutstandingDTO;
import com.risherp.dto.outstanding.OutstandingSummaryDTO;
import com.risherp.dto.outstanding.SupplierOutstandingDTO;
import com.risherp.entity.*;
import com.risherp.exception.ResourceNotFoundException;
import com.risherp.repository.*;
import com.risherp.service.OutstandingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class OutstandingServiceImpl implements OutstandingService {

    private final PartyRepository partyRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ReceiptRepository receiptRepository;
    private final PaymentTxnRepository paymentTxnRepository;
    private final SalesReturnRepository salesReturnRepository;
    private final PurchaseReturnRepository purchaseReturnRepository;
    private final LedgerEntryRepository ledgerEntryRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<CustomerOutstandingDTO> getCustomerOutstanding(
            Long businessId,
            String search,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable
    ) {
        List<Party> parties = partyRepository.findAll().stream()
                .filter(p -> p.getBusiness().getId().equals(businessId) &&
                             (p.getPartyType() == PartyType.CUSTOMER || p.getPartyType() == PartyType.BOTH))
                .filter(p -> matchesSearch(p, search))
                .collect(Collectors.toList());

        List<CustomerOutstandingDTO> dtos = new ArrayList<>();

        for (Party party : parties) {
            BigDecimal openingBal = party.getOpeningBalance() != null ? party.getOpeningBalance() : BigDecimal.ZERO;
            OpeningBalanceType obType = party.getOpeningBalanceType();

            BigDecimal openingReceivable = BigDecimal.ZERO;
            if (obType == OpeningBalanceType.RECEIVABLE) {
                openingReceivable = openingBal;
            } else if (obType == OpeningBalanceType.PAYABLE) {
                openingReceivable = openingBal.negate();
            }

            BigDecimal totalSales = saleRepository.sumGrandTotalByBusinessIdAndPartyId(businessId, party.getId());
            BigDecimal totalReceipts = ledgerEntryRepository.sumReceiptsByPartyId(businessId, party.getId());
            BigDecimal totalSalesReturns = salesReturnRepository.sumRefundAmountByBusinessIdAndPartyId(businessId, party.getId());

            if (totalSales == null) totalSales = BigDecimal.ZERO;
            if (totalReceipts == null) totalReceipts = BigDecimal.ZERO;
            if (totalSalesReturns == null) totalSalesReturns = BigDecimal.ZERO;

            BigDecimal outstanding = openingReceivable.add(totalSales).subtract(totalReceipts).subtract(totalSalesReturns);
            long pendingInvoicesCount = saleRepository.countOutstandingByPartyId(businessId, party.getId());

            dtos.add(CustomerOutstandingDTO.builder()
                    .partyId(party.getId())
                    .partyCode(party.getPartyCode())
                    .partyName(party.getPartyName())
                    .mobile(party.getMobile())
                    .city(party.getCity())
                    .openingBalance(openingBal)
                    .openingBalanceType(obType)
                    .totalSales(totalSales)
                    .totalReceipts(totalReceipts)
                    .totalSalesReturns(totalSalesReturns)
                    .outstanding(outstanding)
                    .pendingInvoicesCount(pendingInvoicesCount)
                    .build());
        }

        return paginateList(dtos, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<SupplierOutstandingDTO> getSupplierOutstanding(
            Long businessId,
            String search,
            LocalDate dateFrom,
            LocalDate dateTo,
            Pageable pageable
    ) {
        List<Party> parties = partyRepository.findAll().stream()
                .filter(p -> p.getBusiness().getId().equals(businessId) &&
                             (p.getPartyType() == PartyType.SUPPLIER || p.getPartyType() == PartyType.BOTH))
                .filter(p -> matchesSearch(p, search))
                .collect(Collectors.toList());

        List<SupplierOutstandingDTO> dtos = new ArrayList<>();

        for (Party party : parties) {
            BigDecimal openingBal = party.getOpeningBalance() != null ? party.getOpeningBalance() : BigDecimal.ZERO;
            OpeningBalanceType obType = party.getOpeningBalanceType();

            BigDecimal openingPayable = BigDecimal.ZERO;
            if (obType == OpeningBalanceType.PAYABLE) {
                openingPayable = openingBal;
            } else if (obType == OpeningBalanceType.RECEIVABLE) {
                openingPayable = openingBal.negate();
            }

            BigDecimal totalPurchases = purchaseRepository.sumGrandTotalByBusinessIdAndPartyId(businessId, party.getId());
            BigDecimal totalPayments = ledgerEntryRepository.sumPaymentsByPartyId(businessId, party.getId());
            BigDecimal totalPurchaseReturns = purchaseReturnRepository.sumRefundAmountByBusinessIdAndPartyId(businessId, party.getId());

            if (totalPurchases == null) totalPurchases = BigDecimal.ZERO;
            if (totalPayments == null) totalPayments = BigDecimal.ZERO;
            if (totalPurchaseReturns == null) totalPurchaseReturns = BigDecimal.ZERO;

            BigDecimal outstanding = openingPayable.add(totalPurchases).subtract(totalPayments).subtract(totalPurchaseReturns);
            long pendingPurchasesCount = purchaseRepository.countOutstandingByPartyId(businessId, party.getId());

            dtos.add(SupplierOutstandingDTO.builder()
                    .partyId(party.getId())
                    .partyCode(party.getPartyCode())
                    .partyName(party.getPartyName())
                    .mobile(party.getMobile())
                    .city(party.getCity())
                    .openingBalance(openingBal)
                    .openingBalanceType(obType)
                    .totalPurchases(totalPurchases)
                    .totalPayments(totalPayments)
                    .totalPurchaseReturns(totalPurchaseReturns)
                    .outstanding(outstanding)
                    .pendingPurchasesCount(pendingPurchasesCount)
                    .build());
        }

        return paginateList(dtos, pageable);
    }

    @Override
    @Transactional(readOnly = true)
    public OutstandingSummaryDTO getOutstandingSummary(Long businessId) {
        // Customers
        Page<CustomerOutstandingDTO> custPage = getCustomerOutstanding(businessId, null, null, null, Pageable.unpaged());
        List<CustomerOutstandingDTO> customers = custPage.getContent();

        BigDecimal totalReceivable = BigDecimal.ZERO;
        long customersWithOutstanding = 0;
        for (CustomerOutstandingDTO c : customers) {
            if (c.getOutstanding().compareTo(BigDecimal.ZERO) > 0) {
                totalReceivable = totalReceivable.add(c.getOutstanding());
                customersWithOutstanding++;
            }
        }

        // Suppliers
        Page<SupplierOutstandingDTO> suppPage = getSupplierOutstanding(businessId, null, null, null, Pageable.unpaged());
        List<SupplierOutstandingDTO> suppliers = suppPage.getContent();

        BigDecimal totalPayable = BigDecimal.ZERO;
        long suppliersWithOutstanding = 0;
        for (SupplierOutstandingDTO s : suppliers) {
            if (s.getOutstanding().compareTo(BigDecimal.ZERO) > 0) {
                totalPayable = totalPayable.add(s.getOutstanding());
                suppliersWithOutstanding++;
            }
        }

        return OutstandingSummaryDTO.builder()
                .totalReceivable(totalReceivable)
                .totalPayable(totalPayable)
                .customerCount(customers.size())
                .supplierCount(suppliers.size())
                .customersWithOutstandingCount(customersWithOutstanding)
                .suppliersWithOutstandingCount(suppliersWithOutstanding)
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceOutstandingDTO> getCustomerInvoiceOutstanding(Long partyId, Long businessId) {
        Party party = partyRepository.findByIdAndBusinessId(partyId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found: " + partyId));

        List<Sale> sales = saleRepository.findAll().stream()
                .filter(s -> s.getBusiness().getId().equals(businessId) &&
                             s.getParty().getId().equals(partyId) &&
                             s.getStatus() != SaleStatus.CANCELLED)
                .sorted((a, b) -> b.getSaleDate().compareTo(a.getSaleDate()))
                .collect(Collectors.toList());

        return sales.stream().map(s -> InvoiceOutstandingDTO.builder()
                .id(s.getId())
                .invoiceNumber(s.getInvoiceNumber())
                .invoiceDate(s.getSaleDate())
                .partyId(party.getId())
                .partyName(party.getPartyName())
                .grandTotal(s.getGrandTotal())
                .paidAmount(s.getPaidAmount())
                .balanceAmount(s.getBalanceAmount())
                .paymentStatus(s.getPaymentStatus())
                .status(s.getStatus().name())
                .build()
        ).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<InvoiceOutstandingDTO> getSupplierInvoiceOutstanding(Long partyId, Long businessId) {
        Party party = partyRepository.findByIdAndBusinessId(partyId, businessId)
                .orElseThrow(() -> new ResourceNotFoundException("Party not found: " + partyId));

        List<Purchase> purchases = purchaseRepository.findAll().stream()
                .filter(p -> p.getBusiness().getId().equals(businessId) &&
                             p.getParty().getId().equals(partyId) &&
                             p.getStatus() != PurchaseStatus.CANCELLED)
                .sorted((a, b) -> b.getPurchaseDate().compareTo(a.getPurchaseDate()))
                .collect(Collectors.toList());

        return purchases.stream().map(p -> InvoiceOutstandingDTO.builder()
                .id(p.getId())
                .invoiceNumber(p.getPurchaseNumber())
                .invoiceDate(p.getPurchaseDate())
                .partyId(party.getId())
                .partyName(party.getPartyName())
                .grandTotal(p.getGrandTotal())
                .paidAmount(p.getPaidAmount())
                .balanceAmount(p.getBalanceAmount())
                .paymentStatus(p.getPaymentStatus())
                .status(p.getStatus().name())
                .build()
        ).collect(Collectors.toList());
    }

    private boolean matchesSearch(Party party, String search) {
        if (search == null || search.trim().isEmpty()) return true;
        String query = search.trim().toLowerCase();
        return (party.getPartyName() != null && party.getPartyName().toLowerCase().contains(query)) ||
               (party.getPartyCode() != null && party.getPartyCode().toLowerCase().contains(query)) ||
               (party.getMobile() != null && party.getMobile().toLowerCase().contains(query)) ||
               (party.getCity() != null && party.getCity().toLowerCase().contains(query));
    }

    private <T> Page<T> paginateList(List<T> list, Pageable pageable) {
        if (pageable == null || pageable.isUnpaged()) {
            return new PageImpl<>(list, Pageable.unpaged(), list.size());
        }
        int page = pageable.getPageNumber();
        int size = pageable.getPageSize();
        int fromIndex = page * size;
        int toIndex = Math.min(fromIndex + size, list.size());

        List<T> subList;
        if (fromIndex >= list.size()) {
            subList = new ArrayList<>();
        } else {
            subList = list.subList(fromIndex, toIndex);
        }
        return new PageImpl<>(subList, pageable, list.size());
    }
}
