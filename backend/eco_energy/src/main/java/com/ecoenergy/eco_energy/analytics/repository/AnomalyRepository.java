package com.ecoenergy.eco_energy.analytics.repository;

import com.ecoenergy.eco_energy.analytics.model.Anomaly;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface AnomalyRepository extends JpaRepository<Anomaly, UUID> {
    List<Anomaly> findByDeviceId(UUID deviceId);
    List<Anomaly> findByDeviceIdAndAnomalyType(UUID deviceId, String anomalyType);
    List<Anomaly> findByAnomalyType(String anomalyType);
    List<Anomaly> findByDetectedAtBetween(LocalDateTime start, LocalDateTime end);
    List<Anomaly> findByDeviceAndAnomalyTypeAndDetectedAtBetween(
            UUID deviceId, String anomalyType, LocalDateTime start, LocalDateTime end
    );
}
