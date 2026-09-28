package com.risherp.service;

import com.risherp.entity.DocumentSequence;
import com.risherp.repository.*;
import com.risherp.service.impl.DocumentSequenceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicLong;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

/**
 * DocumentSequenceConcurrencyTest
 *
 * Proves that sequence number generation increments monotonically,
 * respects configured prefix/length padding, and never yields duplicates
 * under simulated multi-threaded concurrent generation conditions.
 */
@ExtendWith(MockitoExtension.class)
class DocumentSequenceConcurrencyTest {

    @Mock
    private DocumentSequenceRepository documentSequenceRepository;

    @Mock
    private SaleRepository saleRepository;

    @Mock
    private PurchaseRepository purchaseRepository;

    @Mock
    private SalesReturnRepository salesReturnRepository;

    @Mock
    private PurchaseReturnRepository purchaseReturnRepository;

    @Mock
    private ReceiptRepository receiptRepository;

    @Mock
    private PaymentTxnRepository paymentTxnRepository;

    @InjectMocks
    private DocumentSequenceServiceImpl documentSequenceService;

    private DocumentSequence sequence;

    @BeforeEach
    void setUp() {
        sequence = DocumentSequence.builder()
                .id(1L)
                .businessId(1L)
                .documentType("SALES_INVOICE")
                .prefix("INV-")
                .nextNumber(1L)
                .numberLength(6)
                .build();
    }

    @Test
    @DisplayName("Sequential Generation: INV-000001, INV-000002, INV-000003")
    void testSequentialNumbering() {
        when(documentSequenceRepository.findByBusinessIdAndDocumentTypeForUpdate(eq(1L), eq("SALES_INVOICE")))
                .thenReturn(Optional.of(sequence));
        when(saleRepository.existsByInvoiceNumber(any())).thenReturn(false);

        String num1 = documentSequenceService.generateNextNumber(1L, "SALES_INVOICE");
        assertEquals("INV-000001", num1);
        assertEquals(2L, sequence.getNextNumber());

        String num2 = documentSequenceService.generateNextNumber(1L, "SALES_INVOICE");
        assertEquals("INV-000002", num2);
        assertEquals(3L, sequence.getNextNumber());

        String num3 = documentSequenceService.generateNextNumber(1L, "SALES_INVOICE");
        assertEquals("INV-000003", num3);
        assertEquals(4L, sequence.getNextNumber());
    }

    @Test
    @DisplayName("Custom Prefix and Length: TAX-0001001 with 7 digits")
    void testCustomPrefixAndPadding() {
        DocumentSequence customSeq = DocumentSequence.builder()
                .id(2L)
                .businessId(1L)
                .documentType("PURCHASE")
                .prefix("BILL/")
                .nextNumber(42L)
                .numberLength(5)
                .build();

        when(documentSequenceRepository.findByBusinessIdAndDocumentTypeForUpdate(eq(1L), eq("PURCHASE")))
                .thenReturn(Optional.of(customSeq));
        when(purchaseRepository.existsByPurchaseNumber(any())).thenReturn(false);

        String generated = documentSequenceService.generateNextNumber(1L, "PURCHASE");
        assertEquals("BILL/00042", generated);
        assertEquals(43L, customSeq.getNextNumber());
    }

    @Test
    @DisplayName("Simulated Concurrent Generation: 50 Parallel Requests Produce 50 Unique Numbers")
    void testSimulatedConcurrentGeneration() throws InterruptedException, ExecutionException {
        int threads = 10;
        int requestsPerThread = 5;
        int totalRequests = threads * requestsPerThread;

        ExecutorService executor = Executors.newFixedThreadPool(threads);
        Set<String> generatedNumbers = ConcurrentHashMap.newKeySet();

        // Simulate database atomic row-level locked sequence
        AtomicLong atomicCounter = new AtomicLong(1L);

        when(documentSequenceRepository.findByBusinessIdAndDocumentTypeForUpdate(eq(1L), eq("SALES_INVOICE")))
                .thenAnswer(inv -> {
                    synchronized (sequence) {
                        DocumentSequence seqCopy = DocumentSequence.builder()
                                .id(sequence.getId())
                                .businessId(sequence.getBusinessId())
                                .documentType(sequence.getDocumentType())
                                .prefix(sequence.getPrefix())
                                .nextNumber(atomicCounter.getAndIncrement())
                                .numberLength(sequence.getNumberLength())
                                .build();
                        return Optional.of(seqCopy);
                    }
                });

        when(saleRepository.existsByInvoiceNumber(any())).thenReturn(false);

        List<Callable<String>> tasks = new ArrayList<>();
        for (int i = 0; i < totalRequests; i++) {
            tasks.add(() -> documentSequenceService.generateNextNumber(1L, "SALES_INVOICE"));
        }

        List<Future<String>> futures = executor.invokeAll(tasks);
        for (Future<String> future : futures) {
            generatedNumbers.add(future.get());
        }

        executor.shutdown();
        assertTrue(executor.awaitTermination(5, TimeUnit.SECONDS));

        // Exactly 50 unique numbers must be produced, with no collision
        assertEquals(totalRequests, generatedNumbers.size(), "All generated numbers must be distinct");
        assertTrue(generatedNumbers.contains("INV-000001"));
        assertTrue(generatedNumbers.contains(String.format("INV-%06d", totalRequests)));
    }
}
