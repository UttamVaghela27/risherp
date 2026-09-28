package com.risherp.repository;

import com.risherp.entity.Category;
import com.risherp.entity.CategoryStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * CategoryRepository
 * Data access layer for Category entity with specification support.
 */
@Repository
public interface CategoryRepository extends JpaRepository<Category, Long>, JpaSpecificationExecutor<Category> {

    Optional<Category> findByIdAndBusinessId(Long id, Long businessId);

    boolean existsByBusinessIdAndCategoryNameIgnoreCaseAndStatus(Long businessId, String categoryName, CategoryStatus status);

    boolean existsByBusinessIdAndCategoryNameIgnoreCaseAndStatusAndIdNot(Long businessId, String categoryName, CategoryStatus status, Long id);

    List<Category> findByBusinessIdAndStatusOrderByCategoryNameAsc(Long businessId, CategoryStatus status);

    List<Category> findByBusinessIdOrderByCategoryNameAsc(Long businessId);

    long countByBusinessId(Long businessId);

    long countByBusinessIdAndStatus(Long businessId, CategoryStatus status);
}
