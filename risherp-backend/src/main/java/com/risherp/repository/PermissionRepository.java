package com.risherp.repository;

import com.risherp.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Repository
public interface PermissionRepository extends JpaRepository<Permission, Long> {

    List<Permission> findAllByOrderByModuleAscPermissionNameAsc();

    Optional<Permission> findByPermissionCode(String permissionCode);

    List<Permission> findByPermissionCodeIn(Set<String> codes);

    boolean existsByPermissionCode(String permissionCode);
}
