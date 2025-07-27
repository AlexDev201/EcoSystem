package com.ecoenergy.eco_energy.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SimulationResult {
    private double originalPower;
    private double simulatedPower;
    private Map<String, Double> parameters;
    private String scenario;
    private double impact;
}
