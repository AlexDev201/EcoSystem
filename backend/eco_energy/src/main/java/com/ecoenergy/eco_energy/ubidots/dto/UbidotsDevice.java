package com.ecoenergy.eco_energy.ubidots.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.Data;

import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class UbidotsDevice {
    private String id;
    private String label;
    private String name;
    private String description;
    private Map<String, Object> properties;
}
