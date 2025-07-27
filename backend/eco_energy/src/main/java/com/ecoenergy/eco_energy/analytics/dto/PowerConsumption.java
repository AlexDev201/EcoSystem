package com.ecoenergy.eco_energy.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PowerConsumption {
    private double predictedValue;
    private LocalDateTime timestamp;
    private double confidenceInterval;
    private String predictionMethod;
}
