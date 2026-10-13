package com.risherp.repository;

import com.risherp.entity.Notification;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByBusinessIdOrderByCreatedAtDesc(Long businessId, Pageable pageable);

    long countByBusinessIdAndIsReadFalse(Long businessId);

    Optional<Notification> findByIdAndBusinessId(Long id, Long businessId);

    boolean existsByBusinessIdAndTitleAndIsReadFalse(Long businessId, String title);

    @Modifying
    @Query("UPDATE Notification n SET n.isRead = true WHERE n.business.id = :businessId AND n.isRead = false")
    void markAllAsRead(@Param("businessId") Long businessId);
}
