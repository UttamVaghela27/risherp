package com.risherp.security;

import com.risherp.entity.Permission;
import com.risherp.entity.User;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.ArrayList;
import java.util.Collection;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Spring Security UserDetails implementation representing the authenticated user.
 * Phase 17: Permissions are loaded dynamically from the User -> Role -> Permissions
 * chain in the database. No more hardcoded permission mapping.
 */
@Getter
public class UserPrincipal implements UserDetails {

    private final Long id;
    private final String name;
    private final String email;
    private final String password;
    private final Long businessId;
    private final String businessName;
    private final String role;
    private final List<String> permissionCodes;
    private final Collection<? extends GrantedAuthority> authorities;
    private final boolean active;

    public UserPrincipal(User user) {
        this.id = user.getId();
        this.name = user.getName();
        this.email = user.getEmail();
        this.password = user.getPasswordHash();
        this.businessId = user.getBusiness() != null ? user.getBusiness().getId() : null;
        this.businessName = user.getBusiness() != null ? user.getBusiness().getBusinessName() : null;
        this.role = user.getRole() != null ? user.getRole().getName() : "STAFF";
        this.active = "ACTIVE".equalsIgnoreCase(user.getStatus());

        List<GrantedAuthority> authList = new ArrayList<>();

        // Always add the ROLE_ authority for Spring Security role-based checks
        authList.add(new SimpleGrantedAuthority("ROLE_" + this.role));

        // Dynamically load permissions from Role -> Permissions (DB-driven, Phase 17)
        List<String> codes = new ArrayList<>();
        if (user.getRole() != null && user.getRole().getPermissions() != null) {
            for (Permission perm : user.getRole().getPermissions()) {
                authList.add(new SimpleGrantedAuthority(perm.getPermissionCode()));
                codes.add(perm.getPermissionCode());
            }
        }

        this.permissionCodes = Collections.unmodifiableList(codes);
        this.authorities = Collections.unmodifiableList(authList);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return active;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active;
    }
}
