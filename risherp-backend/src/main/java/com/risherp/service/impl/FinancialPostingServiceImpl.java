package com.risherp.service.impl;

import com.risherp.entity.*;
import com.risherp.repository.*;
import com.risherp.security.UserPrincipal;
import com.risherp.service.FinancialPostingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class FinancialPostingServiceImpl implements FinancialPostingService {

    private final LedgerEntryRepository ledgerEntryRepository;
    private final PartyRepository partyRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final ReceiptRepository receiptRepository;
    private final PaymentTxnRepository paymentTxnRepository;
    private final SalesReturnRepository salesReturnRepository;
    private final PurchaseReturnRepository purchaseReturnRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void postOpeningBalance(Party party, UserPrincipal principal) {
        if (party == null || party.getId() == null || party.getBusiness() == null) return;
        Long businessId = party.getBusiness().getId();

        List<LedgerEntry> existingList = ledgerEntryRepository.findByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
                businessId, party.getId(), "OPENING_BALANCE", party.getId()
        );

        BigDecimal balance = party.getOpeningBalance();
        OpeningBalanceType balanceType = party.getOpeningBalanceType();

        if (balance == null || balance.compareTo(BigDecimal.ZERO) <= 0 || balanceType == null || balanceType == OpeningBalanceType.NONE) {
            if (existingList != null && !existingList.isEmpty()) {
                ledgerEntryRepository.deleteAll(existingList);
                ledgerEntryRepository.flush();
            }
            return;
        }

        BigDecimal debit = BigDecimal.ZERO;
        BigDecimal credit = BigDecimal.ZERO;

        if (balanceType == OpeningBalanceType.RECEIVABLE) {
            debit = balance;
        } else if (balanceType == OpeningBalanceType.PAYABLE) {
            credit = balance;
        }

        User user = resolveUser(principal);
        LocalDate txnDate = party.getCreatedAt() != null ? party.getCreatedAt().toLocalDate() : LocalDate.now();

        if (existingList != null && !existingList.isEmpty()) {
            LedgerEntry existing = existingList.get(0);
            existing.setDebitAmount(debit);
            existing.setCreditAmount(credit);
            existing.setRemarks("Opening Balance: " + balanceType.name() + " ₹" + balance.toPlainString());
            if (user != null) {
                existing.setCreatedBy(user);
            }
            ledgerEntryRepository.save(existing);
            if (existingList.size() > 1) {
                ledgerEntryRepository.deleteAll(existingList.subList(1, existingList.size()));
                ledgerEntryRepository.flush();
            }
            log.info("Updated Opening Balance for Party ID {}: Debit={}, Credit={}", party.getId(), debit, credit);
        } else {
            LedgerEntry entry = LedgerEntry.builder()
                    .business(party.getBusiness())
                    .party(party)
                    .transactionDate(txnDate)
                    .transactionType(LedgerTransactionType.OPENING_BALANCE)
                    .referenceType("OPENING_BALANCE")
                    .referenceId(party.getId())
                    .referenceNumber("OPENING")
                    .debitAmount(debit)
                    .creditAmount(credit)
                    .remarks("Opening Balance: " + balanceType.name() + " ₹" + balance.toPlainString())
                    .createdBy(user)
                    .build();

            ledgerEntryRepository.save(entry);
            log.info("Posted Opening Balance for Party ID {}: Debit={}, Credit={}", party.getId(), debit, credit);
        }
    }

    @Override
    @Transactional
    public void postSale(Sale sale, UserPrincipal principal) {
        if (sale == null || sale.getStatus() == SaleStatus.CANCELLED) return;
        Long businessId = sale.getBusiness().getId();
        Long partyId = sale.getParty().getId();

        if (ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                businessId, partyId, "SALE", sale.getId(), LedgerTransactionType.SALE)) {
            log.warn("Ledger entry already exists for Sale ID {}", sale.getId());
            return;
        }

        User user = resolveUser(principal);
        LedgerEntry entry = LedgerEntry.builder()
                .business(sale.getBusiness())
                .party(sale.getParty())
                .transactionDate(sale.getSaleDate())
                .transactionType(LedgerTransactionType.SALE)
                .referenceType("SALE")
                .referenceId(sale.getId())
                .referenceNumber(sale.getInvoiceNumber())
                .debitAmount(sale.getGrandTotal())
                .creditAmount(BigDecimal.ZERO)
                .remarks("Sale Invoice: " + sale.getInvoiceNumber())
                .createdBy(user)
                .build();

        ledgerEntryRepository.save(entry);
        log.info("Posted Sale to Ledger: Sale ID {}, Invoice {}, Debit={}", sale.getId(), sale.getInvoiceNumber(), sale.getGrandTotal());

        if (sale.getPaidAmount() != null && sale.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            if (!ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                    businessId, partyId, "SALE", sale.getId(), LedgerTransactionType.RECEIPT)) {
                LedgerEntry paymentEntry = LedgerEntry.builder()
                        .business(sale.getBusiness())
                        .party(sale.getParty())
                        .transactionDate(sale.getSaleDate())
                        .transactionType(LedgerTransactionType.RECEIPT)
                        .referenceType("SALE")
                        .referenceId(sale.getId())
                        .referenceNumber(sale.getInvoiceNumber())
                        .debitAmount(BigDecimal.ZERO)
                        .creditAmount(sale.getPaidAmount())
                        .remarks("Payment received on Sale " + sale.getInvoiceNumber() + (sale.getPaymentMode() != null ? " (" + sale.getPaymentMode() + ")" : ""))
                        .createdBy(user)
                        .build();
                ledgerEntryRepository.save(paymentEntry);
                log.info("Posted Sale Initial Payment to Ledger: Sale ID {}, Invoice {}, Credit={}", sale.getId(), sale.getInvoiceNumber(), sale.getPaidAmount());
            }
        }
    }

    @Override
    @Transactional
    public void postReceipt(Receipt receipt, UserPrincipal principal) {
        if (receipt == null || receipt.getStatus() == ReceiptStatus.CANCELLED) return;
        Long businessId = receipt.getBusiness().getId();
        Long partyId = receipt.getParty().getId();

        if (ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                businessId, partyId, "RECEIPT", receipt.getId(), LedgerTransactionType.RECEIPT)) {
            log.warn("Ledger entry already exists for Receipt ID {}", receipt.getId());
            return;
        }

        User user = resolveUser(principal);
        LedgerEntry entry = LedgerEntry.builder()
                .business(receipt.getBusiness())
                .party(receipt.getParty())
                .transactionDate(receipt.getReceiptDate())
                .transactionType(LedgerTransactionType.RECEIPT)
                .referenceType("RECEIPT")
                .referenceId(receipt.getId())
                .referenceNumber(receipt.getReceiptNumber())
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(receipt.getAmount())
                .remarks("Receipt: " + receipt.getReceiptNumber() + " (" + receipt.getPaymentMode() + ")")
                .createdBy(user)
                .build();

        ledgerEntryRepository.save(entry);
        log.info("Posted Receipt to Ledger: Receipt ID {}, Number {}, Credit={}", receipt.getId(), receipt.getReceiptNumber(), receipt.getAmount());
    }

    @Override
    @Transactional
    public void postSalesReturn(SalesReturn salesReturn, UserPrincipal principal) {
        if (salesReturn == null || salesReturn.getStatus() == SalesReturnStatus.CANCELLED) return;
        Long businessId = salesReturn.getBusiness().getId();
        Long partyId = salesReturn.getParty().getId();

        if (ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                businessId, partyId, "SALES_RETURN", salesReturn.getId(), LedgerTransactionType.SALES_RETURN)) {
            log.warn("Ledger entry already exists for SalesReturn ID {}", salesReturn.getId());
            return;
        }

        User user = resolveUser(principal);
        LedgerEntry entry = LedgerEntry.builder()
                .business(salesReturn.getBusiness())
                .party(salesReturn.getParty())
                .transactionDate(salesReturn.getReturnDate())
                .transactionType(LedgerTransactionType.SALES_RETURN)
                .referenceType("SALES_RETURN")
                .referenceId(salesReturn.getId())
                .referenceNumber(salesReturn.getReturnNumber())
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(salesReturn.getRefundAmount())
                .remarks("Sales Return: " + salesReturn.getReturnNumber())
                .createdBy(user)
                .build();

        ledgerEntryRepository.save(entry);
        log.info("Posted Sales Return to Ledger: ID {}, Number {}, Credit={}", salesReturn.getId(), salesReturn.getReturnNumber(), salesReturn.getRefundAmount());
    }

    @Override
    @Transactional
    public void postPurchase(Purchase purchase, UserPrincipal principal) {
        if (purchase == null || purchase.getStatus() == PurchaseStatus.CANCELLED) return;
        Long businessId = purchase.getBusiness().getId();
        Long partyId = purchase.getParty().getId();

        if (ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                businessId, partyId, "PURCHASE", purchase.getId(), LedgerTransactionType.PURCHASE)) {
            log.warn("Ledger entry already exists for Purchase ID {}", purchase.getId());
            return;
        }

        User user = resolveUser(principal);
        LedgerEntry entry = LedgerEntry.builder()
                .business(purchase.getBusiness())
                .party(purchase.getParty())
                .transactionDate(purchase.getPurchaseDate())
                .transactionType(LedgerTransactionType.PURCHASE)
                .referenceType("PURCHASE")
                .referenceId(purchase.getId())
                .referenceNumber(purchase.getPurchaseNumber())
                .debitAmount(BigDecimal.ZERO)
                .creditAmount(purchase.getGrandTotal())
                .remarks("Purchase: " + purchase.getPurchaseNumber())
                .createdBy(user)
                .build();

        ledgerEntryRepository.save(entry);
        log.info("Posted Purchase to Ledger: Purchase ID {}, Number {}, Credit={}", purchase.getId(), purchase.getPurchaseNumber(), purchase.getGrandTotal());

        if (purchase.getPaidAmount() != null && purchase.getPaidAmount().compareTo(BigDecimal.ZERO) > 0) {
            if (!ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                    businessId, partyId, "PURCHASE", purchase.getId(), LedgerTransactionType.PAYMENT)) {
                LedgerEntry paymentEntry = LedgerEntry.builder()
                        .business(purchase.getBusiness())
                        .party(purchase.getParty())
                        .transactionDate(purchase.getPurchaseDate())
                        .transactionType(LedgerTransactionType.PAYMENT)
                        .referenceType("PURCHASE")
                        .referenceId(purchase.getId())
                        .referenceNumber(purchase.getPurchaseNumber())
                        .debitAmount(purchase.getPaidAmount())
                        .creditAmount(BigDecimal.ZERO)
                        .remarks("Payment made on Purchase " + purchase.getPurchaseNumber() + (purchase.getPaymentMode() != null ? " (" + purchase.getPaymentMode() + ")" : ""))
                        .createdBy(user)
                        .build();
                ledgerEntryRepository.save(paymentEntry);
                log.info("Posted Purchase Initial Payment to Ledger: Purchase ID {}, Number {}, Debit={}", purchase.getId(), purchase.getPurchaseNumber(), purchase.getPaidAmount());
            }
        }
    }

    @Override
    @Transactional
    public void postPayment(PaymentTxn payment, UserPrincipal principal) {
        if (payment == null || payment.getStatus() == PaymentTxnStatus.CANCELLED) return;
        Long businessId = payment.getBusiness().getId();
        Long partyId = payment.getParty().getId();

        if (ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                businessId, partyId, "PAYMENT", payment.getId(), LedgerTransactionType.PAYMENT)) {
            log.warn("Ledger entry already exists for Payment ID {}", payment.getId());
            return;
        }

        User user = resolveUser(principal);
        LedgerEntry entry = LedgerEntry.builder()
                .business(payment.getBusiness())
                .party(payment.getParty())
                .transactionDate(payment.getPaymentDate())
                .transactionType(LedgerTransactionType.PAYMENT)
                .referenceType("PAYMENT")
                .referenceId(payment.getId())
                .referenceNumber(payment.getPaymentNumber())
                .debitAmount(payment.getAmount())
                .creditAmount(BigDecimal.ZERO)
                .remarks("Payment: " + payment.getPaymentNumber() + " (" + payment.getPaymentMode() + ")")
                .createdBy(user)
                .build();

        ledgerEntryRepository.save(entry);
        log.info("Posted Payment to Ledger: Payment ID {}, Number {}, Debit={}", payment.getId(), payment.getPaymentNumber(), payment.getAmount());
    }

    @Override
    @Transactional
    public void postPurchaseReturn(PurchaseReturn purchaseReturn, UserPrincipal principal) {
        if (purchaseReturn == null || purchaseReturn.getStatus() == PurchaseReturnStatus.CANCELLED) return;
        Long businessId = purchaseReturn.getBusiness().getId();
        Long partyId = purchaseReturn.getParty().getId();

        if (ledgerEntryRepository.existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
                businessId, partyId, "PURCHASE_RETURN", purchaseReturn.getId(), LedgerTransactionType.PURCHASE_RETURN)) {
            log.warn("Ledger entry already exists for PurchaseReturn ID {}", purchaseReturn.getId());
            return;
        }

        User user = resolveUser(principal);
        LedgerEntry entry = LedgerEntry.builder()
                .business(purchaseReturn.getBusiness())
                .party(purchaseReturn.getParty())
                .transactionDate(purchaseReturn.getReturnDate())
                .transactionType(LedgerTransactionType.PURCHASE_RETURN)
                .referenceType("PURCHASE_RETURN")
                .referenceId(purchaseReturn.getId())
                .referenceNumber(purchaseReturn.getReturnNumber())
                .debitAmount(purchaseReturn.getRefundAmount())
                .creditAmount(BigDecimal.ZERO)
                .remarks("Purchase Return: " + purchaseReturn.getReturnNumber())
                .createdBy(user)
                .build();

        ledgerEntryRepository.save(entry);
        log.info("Posted Purchase Return to Ledger: ID {}, Number {}, Debit={}", purchaseReturn.getId(), purchaseReturn.getReturnNumber(), purchaseReturn.getRefundAmount());
    }

    @Override
    @Transactional
    public void reverseSale(Sale sale, UserPrincipal principal) {
        if (sale == null) return;
        ledgerEntryRepository.deleteByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
                sale.getBusiness().getId(), sale.getParty().getId(), "SALE", sale.getId()
        );
        log.info("Reversed Sale from Ledger: Sale ID {}", sale.getId());
    }

    @Override
    @Transactional
    public void reverseReceipt(Receipt receipt, UserPrincipal principal) {
        if (receipt == null) return;
        ledgerEntryRepository.deleteByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
                receipt.getBusiness().getId(), receipt.getParty().getId(), "RECEIPT", receipt.getId()
        );
        log.info("Reversed Receipt from Ledger: Receipt ID {}", receipt.getId());
    }

    @Override
    @Transactional
    public void reverseSalesReturn(SalesReturn salesReturn, UserPrincipal principal) {
        if (salesReturn == null) return;
        ledgerEntryRepository.deleteByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
                salesReturn.getBusiness().getId(), salesReturn.getParty().getId(), "SALES_RETURN", salesReturn.getId()
        );
        log.info("Reversed Sales Return from Ledger: ID {}", salesReturn.getId());
    }

    @Override
    @Transactional
    public void reversePurchase(Purchase purchase, UserPrincipal principal) {
        if (purchase == null) return;
        ledgerEntryRepository.deleteByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
                purchase.getBusiness().getId(), purchase.getParty().getId(), "PURCHASE", purchase.getId()
        );
        log.info("Reversed Purchase from Ledger: Purchase ID {}", purchase.getId());
    }

    @Override
    @Transactional
    public void reversePayment(PaymentTxn payment, UserPrincipal principal) {
        if (payment == null) return;
        ledgerEntryRepository.deleteByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
                payment.getBusiness().getId(), payment.getParty().getId(), "PAYMENT", payment.getId()
        );
        log.info("Reversed Payment from Ledger: Payment ID {}", payment.getId());
    }

    @Override
    @Transactional
    public void reversePurchaseReturn(PurchaseReturn purchaseReturn, UserPrincipal principal) {
        if (purchaseReturn == null) return;
        ledgerEntryRepository.deleteByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
                purchaseReturn.getBusiness().getId(), purchaseReturn.getParty().getId(), "PURCHASE_RETURN", purchaseReturn.getId()
        );
        log.info("Reversed Purchase Return from Ledger: ID {}", purchaseReturn.getId());
    }

    @Override
    @Transactional
    public void syncAllExistingRecords(Long businessId) {
        log.info("Starting synchronization of existing transactions into ledger for Business ID {}", businessId);

        // 1. Parties Opening Balances
        List<Party> parties = partyRepository.findAll();
        for (Party p : parties) {
            if (p.getBusiness().getId().equals(businessId) &&
                p.getOpeningBalance() != null &&
                p.getOpeningBalance().compareTo(BigDecimal.ZERO) > 0 &&
                p.getOpeningBalanceType() != null &&
                p.getOpeningBalanceType() != OpeningBalanceType.NONE) {
                postOpeningBalance(p, null);
            }
        }

        // 2. Sales
        List<Sale> sales = saleRepository.findAll();
        for (Sale s : sales) {
            if (s.getBusiness().getId().equals(businessId) && s.getStatus() != SaleStatus.CANCELLED) {
                postSale(s, null);
            }
        }

        // 3. Receipts
        List<Receipt> receipts = receiptRepository.findAll();
        for (Receipt r : receipts) {
            if (r.getBusiness().getId().equals(businessId) && r.getStatus() != ReceiptStatus.CANCELLED) {
                postReceipt(r, null);
            }
        }

        // 4. Sales Returns
        List<SalesReturn> salesReturns = salesReturnRepository.findAll();
        for (SalesReturn sr : salesReturns) {
            if (sr.getBusiness().getId().equals(businessId) && sr.getStatus() != SalesReturnStatus.CANCELLED) {
                postSalesReturn(sr, null);
            }
        }

        // 5. Purchases
        List<Purchase> purchases = purchaseRepository.findAll();
        for (Purchase p : purchases) {
            if (p.getBusiness().getId().equals(businessId) && p.getStatus() != PurchaseStatus.CANCELLED) {
                postPurchase(p, null);
            }
        }

        // 6. Payments
        List<PaymentTxn> payments = paymentTxnRepository.findAll();
        for (PaymentTxn pt : payments) {
            if (pt.getBusiness().getId().equals(businessId) && pt.getStatus() != PaymentTxnStatus.CANCELLED) {
                postPayment(pt, null);
            }
        }

        // 7. Purchase Returns
        List<PurchaseReturn> purchaseReturns = purchaseReturnRepository.findAll();
        for (PurchaseReturn pr : purchaseReturns) {
            if (pr.getBusiness().getId().equals(businessId) && pr.getStatus() != PurchaseReturnStatus.CANCELLED) {
                postPurchaseReturn(pr, null);
            }
        }

        log.info("Completed synchronization of existing transactions into ledger for Business ID {}", businessId);
    }

    private User resolveUser(UserPrincipal principal) {
        if (principal == null || principal.getId() == null) return null;
        return userRepository.findById(principal.getId()).orElse(null);
    }
}
