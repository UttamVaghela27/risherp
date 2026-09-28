package com.risherp.repository;

import com.risherp.entity.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long>, JpaSpecificationExecutor<Role> {

    Optional<Role> findFirstByName(String name);

    Optional<Role> findFirstByNameAndBusinessIsNull(String name);

    Optional<Role> findByNameAndBusinessId(String name, Long businessId);

    Optional<Role> findFirstByNameAndBusinessId(String name, Long businessId);

    List<Role> findByName(String name);

    @Query("SELECT r FROM Role r LEFT JOIN FETCH r.permissions WHERE r.id = :id")
    Optional<Role> findByIdWithPermissions(@Param("id") Long id);

    @Query(value = """
        SELECT r FROM Role r
        WHERE r.business.id = :businessId
        AND (:status IS NULL OR r.status = :status)
        AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))
    """, countQuery = """
        SELECT COUNT(r) FROM Role r
        WHERE r.business.id = :businessId
        AND (:status IS NULL OR r.status = :status)
        AND (:search IS NULL OR LOWER(r.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(r.description) LIKE LOWER(CONCAT('%', :search, '%')))
    """)
    Page<Role> findByBusinessIdFiltered(
            @Param("businessId") Long businessId,
            @Param("search") String search,
            @Param("status") String status,
            Pageable pageable
    );

    Page<Role> findByBusinessId(Long businessId, Pageable pageable);
}
