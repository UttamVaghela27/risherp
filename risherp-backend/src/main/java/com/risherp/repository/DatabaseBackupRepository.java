package com.risherp.repository;

import com.risherp.entity.DatabaseBackup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DatabaseBackupRepository extends JpaRepository<DatabaseBackup, Long> {

    Page<DatabaseBackup> findByBusinessIdOrderByCreatedAtDesc(Long businessId, Pageable pageable);

    Optional<DatabaseBackup> findByIdAndBusinessId(Long id, Long businessId);
}
