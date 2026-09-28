package com.risherp.repository;

import com.risherp.entity.DocumentSequence;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DocumentSequenceRepository extends JpaRepository<DocumentSequence, Long> {

    /**
     * Acquires an exclusive row-level write lock (SELECT ... FOR UPDATE in MySQL)
     * to guarantee strictly sequential, non-colliding numbering under concurrent requests.
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT d FROM DocumentSequence d WHERE d.businessId = :businessId AND d.documentType = :documentType")
    Optional<DocumentSequence> findByBusinessIdAndDocumentTypeForUpdate(
            @Param("businessId") Long businessId,
            @Param("documentType") String documentType);

    Optional<DocumentSequence> findByBusinessIdAndDocumentType(Long businessId, String documentType);

    List<DocumentSequence> findByBusinessIdOrderByDocumentTypeAsc(Long businessId);
}
