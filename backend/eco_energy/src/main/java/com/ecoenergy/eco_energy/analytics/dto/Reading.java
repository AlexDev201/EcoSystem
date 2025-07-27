package com.ecoenergy.eco_energy.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reading {
    private String deviceId;
    private double voltage;
    private double current;
    private double power;
    private double temperature;
    private LocalDateTime timestamp;

    // Constructor de conveniencia para cálculos
    public Reading(double value, LocalDateTime timestamp) {
        this.power = value; // Para análisis Z-score general
        this.timestamp = timestamp;
    }

    // Getter para valor principal (usado en algoritmos)
    public double getValue() {
        return power; // O el campo que estés analizando
    }
}
