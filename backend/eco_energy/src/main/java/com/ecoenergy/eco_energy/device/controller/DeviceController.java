package com.ecoenergy.eco_energy.device.controller;

import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.device.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@RequiredArgsConstructor
@RestController
@RequestMapping("/devices")
public class DeviceController {
    private final DeviceService deviceService;
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



}
