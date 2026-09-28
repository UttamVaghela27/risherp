package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;

/**
 * Permission Entity
 * Represents a single capability/action in the system.
 * Permissions are system-defined and seeded at startup.
 * They are assigned to Roles which are then assigned to Users.
 */
@Entity
@Table(name = "permissions", uniqueConstraints = {
    @UniqueConstraint(name = "ux_permission_code", columnNames = {"permission_code"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "permission_code", nullable = false, unique = true, length = 100)
    private String permissionCode;

    @Column(name = "permission_name", nullable = false, length = 150)
    private String permissionName;

    @Column(name = "module", nullable = false, length = 50)
    private String module;

    @Column(length = 255)
    private String description;
}
