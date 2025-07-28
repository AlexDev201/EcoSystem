package com.ecoenergy.eco_energy.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class Alert {
    private String message;
    private LocalDateTime timestamp;
    private String deviceId;
    private String severity;
}
