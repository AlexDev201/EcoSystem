package com.ecoenergy.eco_energy.device.controller;

import com.ecoenergy.eco_energy.device.dto.DeviceReadingRequest;
import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.device.repository.DeviceRepository;
import com.ecoenergy.eco_energy.device.service.DeviceService;
import com.ecoenergy.eco_energy.ubidots.dto.UbidotsDTO;
import com.ecoenergy.eco_energy.ubidots.service.UbidotsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@RequiredArgsConstructor
@RestController
@RequestMapping("/devices")
public class DeviceController {
    private final UbidotsService ubidotsService;
    private final DeviceService deviceService;
    private final DeviceRepository deviceRepository;
    @PostMapping
    public ResponseEntity<Device> createDevice(@RequestBody Device device) {
        Device createdDevice = deviceService.createDevice(device);
        URI location = URI.create("/devices/" + createdDevice.getId());
        return ResponseEntity.created(location).body(createdDevice);
    }
    @GetMapping("/{id}")
    public ResponseEntity<Device> getDeviceById(@PathVariable UUID id){
        return deviceService.getDevice(id)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Device> updateDevice(@PathVariable UUID id, @RequestBody Device updatedData) {
        return deviceService.getDevice(id)
                .map(existingDevice -> {
                    existingDevice.setName(updatedData.getName());
                    existingDevice.setType(updatedData.getType());

                    // Asignamos ACTIVE hasta que el usuario lo cambie
                    Device.DeviceStatus status = updatedData.getStatus() != null
                            ? updatedData.getStatus()
                            : Device.DeviceStatus.ACTIVE;
                    existingDevice.setStatus(status);

                    existingDevice.setUpdatedAt(LocalDateTime.now());

                    Device updatedDevice = deviceService.updateDevice(existingDevice);
                    return ResponseEntity.ok(updatedDevice);
                })
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDevice(@PathVariable UUID id) {
        if (deviceService.getDevice(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        deviceService.deleteDevice(id);
        return ResponseEntity.noContent().build();
    }

    //Simulator
    @GetMapping("/status/{status}")
    public ResponseEntity<List<Device>> getDevicesByStatus(@PathVariable String status) {
        try {
            Device.DeviceStatus deviceStatus = Device.DeviceStatus.valueOf(status.toUpperCase());
            List<Device> devices = deviceRepository.findByStatus(deviceStatus);
            return ResponseEntity.ok(devices);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    //Dashboard
    @GetMapping("/type/{type}")
    public ResponseEntity<List<Device>> getDeviceByType(@PathVariable String type){
        List<Device> devices = deviceService.getDevicesByType(type.toLowerCase());
        if (devices.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(devices);
    }

    //Implementacion con Ubidots
    @PostMapping("/{id}/send-reading")
    public ResponseEntity<Void> sendReadingToUbidots(
            @PathVariable UUID id,
            @RequestBody DeviceReadingRequest reading) {
        Optional<Device> optionalDevice = deviceService.getDevice(id);
        if (optionalDevice.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Device device = optionalDevice.get();
        ubidotsService.sendDataReading(
                device.getUbidotsLabel(),
                reading.getVoltage(),
                reading.getCurrent(),
                reading.getPower(),
                reading.getTemperature()
        );

        return ResponseEntity.accepted().build();
    }

    @GetMapping("/{id}/ubidots-info")
    public Mono<ResponseEntity<UbidotsDTO>> getDeviceInfoFromUbidots(@PathVariable UUID id) {
        Optional<Device> optionalDevice = deviceService.getDevice(id);
        if (optionalDevice.isEmpty()) {
            return Mono.just(ResponseEntity.notFound().build());
        }

        String ubidotsLabel = optionalDevice.get().getUbidotsLabel();
        return ubidotsService.getDeviceInfo(ubidotsLabel)
                .map(ResponseEntity::ok)
                .onErrorResume(e -> {
                    log.error("Error retrieving device info from Ubidots", e);
                    return Mono.just(ResponseEntity.status(HttpStatus.BAD_GATEWAY).build());
                });
    }

}
