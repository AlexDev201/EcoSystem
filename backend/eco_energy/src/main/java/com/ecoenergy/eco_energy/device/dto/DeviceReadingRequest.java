package com.ecoenergy.eco_energy.device.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DeviceReadingRequest {
    private double voltage;
    private double current;
    private double power;
    private double temperature;
}
