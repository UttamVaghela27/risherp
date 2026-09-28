package com.risherp.repository;

import com.risherp.entity.User;
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
public interface UserRepository extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmail(String email);

    /**
     * Load user with role and its permissions eagerly — used by UserPrincipal constructor.
     * Avoids N+1 by fetching role + permissions in one query.
     */
    @Query("""
        SELECT u FROM User u
        JOIN FETCH u.role r
        LEFT JOIN FETCH r.permissions
        JOIN FETCH u.business
        WHERE u.email = :email
    """)
    Optional<User> findByEmailWithRoleAndBusiness(@Param("email") String email);

    /**
     * Load user by ID with role and permissions for UserManagement responses.
     */
    @Query("""
        SELECT u FROM User u
        JOIN FETCH u.role r
        LEFT JOIN FETCH r.permissions
        WHERE u.id = :id AND u.business.id = :businessId
    """)
    Optional<User> findByIdAndBusinessIdWithRole(
            @Param("id") Long id,
            @Param("businessId") Long businessId
    );

    boolean existsByEmail(String email);

    boolean existsByUsernameAndBusinessId(String username, Long businessId);

    Optional<User> findByEmailAndBusinessId(String email, Long businessId);

    Page<User> findByBusinessId(Long businessId, Pageable pageable);

    /**
     * Count users assigned to a given role (for admin safety checks).
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.role.id = :roleId AND u.business.id = :businessId")
    long countByRoleIdAndBusinessId(@Param("roleId") Long roleId, @Param("businessId") Long businessId);

    /**
     * Count active admin users in a business (for last-admin protection).
     */
    @Query("SELECT COUNT(u) FROM User u WHERE u.business.id = :businessId AND u.role.name = 'ADMIN' AND u.status = 'ACTIVE'")
    long countActiveAdmins(@Param("businessId") Long businessId);
}
