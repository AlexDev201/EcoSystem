package com.ecoenergy.eco_energy.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeviceKpis {
    private String deviceId;
    private Double currentPower, avgPower;
    double efficiency;
    private int uptimeHours;
    private String status;
}
