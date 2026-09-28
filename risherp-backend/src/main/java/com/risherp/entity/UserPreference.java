package com.risherp.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * UserPreference Entity
 * Stores personalized UI and workflow preferences per authenticated user.
 */
@Entity
@Table(name = "user_preferences", uniqueConstraints = {
    @UniqueConstraint(name = "uk_user_pref_user_key", columnNames = {"user_id", "preference_key"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "preference_key", nullable = false, length = 100)
    private String preferenceKey;

    @Column(name = "preference_value", columnDefinition = "TEXT")
    private String preferenceValue;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
