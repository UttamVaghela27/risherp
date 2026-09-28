package com.risherp.repository;

import com.risherp.entity.SystemSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SystemSettingRepository extends JpaRepository<SystemSetting, Long> {

    List<SystemSetting> findByBusinessIdAndSettingGroup(Long businessId, String settingGroup);

    Optional<SystemSetting> findByBusinessIdAndSettingKey(Long businessId, String settingKey);

    List<SystemSetting> findByBusinessId(Long businessId);
}
