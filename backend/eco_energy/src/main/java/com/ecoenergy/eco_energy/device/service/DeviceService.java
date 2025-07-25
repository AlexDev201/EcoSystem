package com.ecoenergy.eco_energy.device.service;

import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.device.repository.DeviceRepository;
import com.ecoenergy.eco_energy.ubidots.service.UbidotsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private final UbidotsService ubidotsService;

    // Operaciones CRUD
    public Device createDevice(Device device) {
        device.setCreatedAt(LocalDateTime.now());
        return deviceRepository.save(device);
    }

    public Optional<Device> getDevice(UUID id) {
        return deviceRepository.findById(id);
    }

    public Device updateDevice(Device device) {
        if(!deviceRepository.existsById(device.getId())){
            throw new EntityNotFoundException("Device not found with id" + device.getId());
        }
        device.setUpdatedAt(LocalDateTime.now());
        return deviceRepository.save(device);
    }

    public void deleteDevice(UUID id) {
        deviceRepository.deleteById(id);
    }

    // Para Simulator
    public List<Device> getAllActiveDevices() {
        return deviceRepository.findAllActive();
    }

    // Para Dashboard
    public List<Device> getDevicesByType(String type) {
        return deviceRepository.findByType(type);
    }

    // Integración Ubidots
    public void sendReadingToUbidots(UUID deviceId, double voltage, double current,
                                     double power, double temperature) {
        deviceRepository.findById(deviceId)
                .ifPresentOrElse(
                        device -> ubidotsService.sendDataReading(device.getUbidotsLabel(), voltage, current, power, temperature),
                        () -> log.warn("Device not found with ID: {}", deviceId)
                );
    }
}