package com.ecoenergy.eco_energy.device.controller;

import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
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
}
