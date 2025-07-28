package com.ecoenergy.eco_energy.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DailyReport {
    private String deviceId;
    private LocalDate date;
    private double totalConsumption;
    private double avgVoltage, avgCurrent;
    private int anomalyCount;
}
