package com.ecoenergy.eco_energy.device.controller;

import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.device.service.DeviceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;

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

}
