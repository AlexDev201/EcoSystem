package com.ecoenergy.eco_energy.device.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.GenericGenerator;

import java.time.LocalDateTime;
import java.util.UUID;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "devices")
public class Device {
    public enum DeviceStatus {
        ACTIVE,
        INACTIVE,
        MAINTENANCE,
        ERROR
    }
    //Campos basicos
    @Id
    @GeneratedValue(generator = "UUID")
    @GenericGenerator(name = "UUID", strategy = "org.hibernate.id.UUIDGenerator")
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type;

    private String location;

    @Enumerated(EnumType.STRING)
    private DeviceStatus status;

    //Ubidots
    private String ubidotsLabel;
    //Alertas
    private Double minVoltage;
    private Double maxVoltage;
    private Double maxCurrent;
    private Double maxTemperature;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

}
