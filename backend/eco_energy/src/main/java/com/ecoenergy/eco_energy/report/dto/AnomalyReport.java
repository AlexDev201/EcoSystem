package com.ecoenergy.eco_energy.report.dto;

import com.ecoenergy.eco_energy.analytics.model.Anomaly;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnomalyReport {
   private List<Anomaly>  anomalies;
   private Map<String, Integer> anomaliesByType;
   private LocalDateTime startPeriod;
   private LocalDateTime endPeriod;
   private int totalCount;
}
