package com.risherp.repository;

import com.risherp.entity.LedgerEntry;
import com.risherp.entity.LedgerTransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LedgerEntryRepository extends JpaRepository<LedgerEntry, Long>, JpaSpecificationExecutor<LedgerEntry> {

    boolean existsByBusinessIdAndPartyIdAndReferenceTypeAndReferenceIdAndTransactionType(
            Long businessId, Long partyId, String referenceType, Long referenceId, LedgerTransactionType transactionType
    );

    List<LedgerEntry> findByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
            Long businessId, Long partyId, String referenceType, Long referenceId
    );

    void deleteByBusinessIdAndPartyIdAndReferenceTypeAndReferenceId(
            Long businessId, Long partyId, String referenceType, Long referenceId
    );

    List<LedgerEntry> findByBusinessIdAndPartyIdOrderByTransactionDateAscIdAsc(Long businessId, Long partyId);

    @Query("SELECT le FROM LedgerEntry le WHERE le.business.id = :businessId AND le.party.id = :partyId " +
           "AND (:dateFrom IS NULL OR le.transactionDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR le.transactionDate <= :dateTo) " +
           "AND (:txnType IS NULL OR le.transactionType = :txnType) " +
           "AND (:search IS NULL OR LOWER(le.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(le.remarks) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY le.transactionDate ASC, le.id ASC")
    List<LedgerEntry> findFilteredEntries(
            @Param("businessId") Long businessId,
            @Param("partyId") Long partyId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("txnType") LedgerTransactionType txnType,
            @Param("search") String search
    );

    @Query("SELECT le FROM LedgerEntry le WHERE le.business.id = :businessId AND le.party.id = :partyId " +
           "AND (:dateFrom IS NULL OR le.transactionDate >= :dateFrom) " +
           "AND (:dateTo IS NULL OR le.transactionDate <= :dateTo) " +
           "AND (:txnType IS NULL OR le.transactionType = :txnType) " +
           "AND (:search IS NULL OR LOWER(le.referenceNumber) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(le.remarks) LIKE LOWER(CONCAT('%', :search, '%')))")
    Page<LedgerEntry> findFilteredPage(
            @Param("businessId") Long businessId,
            @Param("partyId") Long partyId,
            @Param("dateFrom") LocalDate dateFrom,
            @Param("dateTo") LocalDate dateTo,
            @Param("txnType") LedgerTransactionType txnType,
            @Param("search") String search,
            Pageable pageable
    );

    @Query("SELECT COALESCE(SUM(le.debitAmount), 0) FROM LedgerEntry le WHERE le.business.id = :businessId AND le.party.id = :partyId")
    BigDecimal sumDebitByPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);

    @Query("SELECT COALESCE(SUM(le.creditAmount), 0) FROM LedgerEntry le WHERE le.business.id = :businessId AND le.party.id = :partyId")
    BigDecimal sumCreditByPartyId(@Param("businessId") Long businessId, @Param("partyId") Long partyId);
}
