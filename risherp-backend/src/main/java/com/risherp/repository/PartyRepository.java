package com.risherp.repository;

import com.risherp.entity.OpeningBalanceType;
import com.risherp.entity.Party;
import com.risherp.entity.PartyStatus;
import com.risherp.entity.PartyType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.Optional;

/**
 * PartyRepository
 * Data access layer for Party entity supporting JpaSpecificationExecutor
 * for dynamic multi-criteria search, filtering, and pagination.
 */
@Repository
public interface PartyRepository extends JpaRepository<Party, Long>, JpaSpecificationExecutor<Party> {

    Optional<Party> findByIdAndBusinessId(Long id, Long businessId);

    boolean existsByBusinessIdAndPartyCode(Long businessId, String partyCode);

    boolean existsByBusinessIdAndMobile(Long businessId, String mobile);

    @Query("SELECT COUNT(p) > 0 FROM Party p WHERE p.business.id = :businessId AND p.mobile = :mobile AND p.id <> :id")
    boolean existsByBusinessIdAndMobileAndIdNot(@Param("businessId") Long businessId, @Param("mobile") String mobile, @Param("id") Long id);

    Optional<Party> findTopByOrderByIdDesc();

    @Query("SELECT COALESCE(MAX(p.id), 0) FROM Party p")
    Long getMaxId();

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndPartyType(Long businessId, PartyType partyType);

    long countByBusinessIdAndStatus(Long businessId, PartyStatus status);

    @Query("SELECT COALESCE(SUM(p.openingBalance), 0) FROM Party p WHERE p.business.id = :businessId AND p.openingBalanceType = :balanceType")
    BigDecimal sumOpeningBalanceByBusinessIdAndType(@Param("businessId") Long businessId, @Param("balanceType") OpeningBalanceType balanceType);
}
