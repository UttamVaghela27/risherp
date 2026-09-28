package com.risherp.service.impl;

import com.risherp.dto.settings.NumberingSettingDto;
import com.risherp.entity.DocumentSequence;
import com.risherp.exception.BadRequestException;
import com.risherp.repository.*;
import com.risherp.service.DocumentSequenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class DocumentSequenceServiceImpl implements DocumentSequenceService {

    private final DocumentSequenceRepository documentSequenceRepository;
    private final SaleRepository saleRepository;
    private final PurchaseRepository purchaseRepository;
    private final SalesReturnRepository salesReturnRepository;
    private final PurchaseReturnRepository purchaseReturnRepository;
    private final ReceiptRepository receiptRepository;
    private final PaymentTxnRepository paymentTxnRepository;

    private static final Map<String, DefaultConfig> DEFAULTS = new LinkedHashMap<>();

    static {
        DEFAULTS.put("SALES_INVOICE", new DefaultConfig("Sales Invoice", "INV-", 1L, 6));
        DEFAULTS.put("PURCHASE", new DefaultConfig("Purchase Bill", "PUR-", 1L, 6));
        DEFAULTS.put("SALES_RETURN", new DefaultConfig("Sales Return (Credit Note)", "SR-", 1L, 6));
        DEFAULTS.put("PURCHASE_RETURN", new DefaultConfig("Purchase Return (Debit Note)", "PR-", 1L, 6));
        DEFAULTS.put("RECEIPT", new DefaultConfig("Receipt Voucher", "REC-", 1L, 6));
        DEFAULTS.put("PAYMENT", new DefaultConfig("Payment Voucher", "PAY-", 1L, 6));
    }

    private record DefaultConfig(String name, String prefix, Long nextNumber, Integer length) {}

    @Override
    @Transactional(propagation = Propagation.REQUIRED)
    public String generateNextNumber(Long businessId, String documentType) {
        String normalizedType = documentType.toUpperCase();
        DefaultConfig def = DEFAULTS.getOrDefault(normalizedType, new DefaultConfig(normalizedType, "DOC-", 1L, 6));

        // Acquire exclusive row-level lock (SELECT ... FOR UPDATE)
        DocumentSequence sequence = documentSequenceRepository.findByBusinessIdAndDocumentTypeForUpdate(businessId, normalizedType)
                .orElseGet(() -> {
                    DocumentSequence newSeq = DocumentSequence.builder()
                            .businessId(businessId)
                            .documentType(normalizedType)
                            .prefix(def.prefix)
                            .nextNumber(def.nextNumber)
                            .numberLength(def.length)
                            .build();
                    return documentSequenceRepository.saveAndFlush(newSeq);
                });

        long currentNum = sequence.getNextNumber();
        int length = sequence.getNumberLength() != null && sequence.getNumberLength() > 0 ? sequence.getNumberLength() : 6;
        String prefix = sequence.getPrefix() != null ? sequence.getPrefix() : "";

        String candidate = formatNumber(prefix, currentNum, length);

        // Advance sequence past any historical records that might conflict
        while (existsInBusiness(businessId, normalizedType, candidate)) {
            currentNum++;
            candidate = formatNumber(prefix, currentNum, length);
        }

        // Atomically increment and persist next number
        sequence.setNextNumber(currentNum + 1);
        documentSequenceRepository.save(sequence);

        log.debug("Allocated document number [{}] for business {} type {}", candidate, businessId, normalizedType);
        return candidate;
    }

    @Override
    @Transactional
    public List<NumberingSettingDto> getNumberingSettings(Long businessId) {
        List<NumberingSettingDto> result = new ArrayList<>();

        for (Map.Entry<String, DefaultConfig> entry : DEFAULTS.entrySet()) {
            String type = entry.getKey();
            DefaultConfig def = entry.getValue();

            DocumentSequence seq = documentSequenceRepository.findByBusinessIdAndDocumentType(businessId, type)
                    .orElseGet(() -> {
                        DocumentSequence newSeq = DocumentSequence.builder()
                                .businessId(businessId)
                                .documentType(type)
                                .prefix(def.prefix)
                                .nextNumber(def.nextNumber)
                                .numberLength(def.length)
                                .build();
                        return documentSequenceRepository.save(newSeq);
                    });

            result.add(toDto(seq, def.name));
        }

        return result;
    }

    @Override
    @Transactional
    public NumberingSettingDto updateNumberingSetting(Long businessId, NumberingSettingDto dto) {
        if (dto.getDocumentType() == null || dto.getDocumentType().isBlank()) {
            throw new BadRequestException("Document type is required");
        }

        String type = dto.getDocumentType().toUpperCase();
        if (!DEFAULTS.containsKey(type)) {
            throw new BadRequestException("Unsupported document type: " + type);
        }

        if (dto.getPrefix() == null || dto.getPrefix().trim().isEmpty()) {
            throw new BadRequestException("Prefix cannot be empty");
        }

        if (dto.getNextNumber() == null || dto.getNextNumber() < 1) {
            throw new BadRequestException("Next number must be greater than or equal to 1");
        }

        if (dto.getNumberLength() == null || dto.getNumberLength() < 1 || dto.getNumberLength() > 12) {
            throw new BadRequestException("Number length must be between 1 and 12 digits");
        }

        DocumentSequence seq = documentSequenceRepository.findByBusinessIdAndDocumentTypeForUpdate(businessId, type)
                .orElseGet(() -> DocumentSequence.builder()
                        .businessId(businessId)
                        .documentType(type)
                        .build());

        seq.setPrefix(dto.getPrefix().trim());
        seq.setNextNumber(dto.getNextNumber());
        seq.setNumberLength(dto.getNumberLength());

        DocumentSequence saved = documentSequenceRepository.save(seq);
        String name = DEFAULTS.get(type).name;
        log.info("Updated numbering setting for business {} type {}: prefix={}, next={}, length={}",
                businessId, type, saved.getPrefix(), saved.getNextNumber(), saved.getNumberLength());

        return toDto(saved, name);
    }

    private String formatNumber(String prefix, long num, int length) {
        return prefix + String.format("%0" + length + "d", num);
    }

    private boolean existsInBusiness(Long businessId, String docType, String docNumber) {
        return switch (docType) {
            case "SALES_INVOICE" -> saleRepository.existsByInvoiceNumber(docNumber);
            case "PURCHASE" -> purchaseRepository.existsByPurchaseNumber(docNumber);
            case "SALES_RETURN" -> salesReturnRepository.existsByReturnNumber(docNumber);
            case "PURCHASE_RETURN" -> purchaseReturnRepository.existsByReturnNumber(docNumber);
            case "RECEIPT" -> receiptRepository.existsByReceiptNumber(docNumber);
            case "PAYMENT" -> paymentTxnRepository.existsByPaymentNumber(docNumber);
            default -> false;
        };
    }

    private NumberingSettingDto toDto(DocumentSequence seq, String name) {
        String preview = formatNumber(seq.getPrefix(), seq.getNextNumber(), seq.getNumberLength());
        return NumberingSettingDto.builder()
                .documentType(seq.getDocumentType())
                .documentTypeName(name)
                .prefix(seq.getPrefix())
                .nextNumber(seq.getNextNumber())
                .numberLength(seq.getNumberLength())
                .examplePreview(preview)
                .build();
    }
}
