package com.ecoenergy.eco_energy.simulator.service;

import com.ecoenergy.eco_energy.analytics.dto.Reading;
import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.device.service.DeviceService;
import com.ecoenergy.eco_energy.notification.websocket.EnergyDataHandler;
import com.ecoenergy.eco_energy.ubidots.service.UbidotsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.RequestBody;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Random;

@Component
@RequiredArgsConstructor
@Slf4j
@EnableScheduling
public class DeviceSimulator{
    private final DeviceService deviceService;
    private final UbidotsService ubidotsService;
    private final EnergyDataHandler energyDataHandler;
    private  final Random random = new Random();

    @Scheduled(fixedRate = 5000)//Cada 5 segundos
    public void generateSensorData(){
        var devices = deviceService.getAllActiveDevices();
        devices.forEach(this::simulateReading);
    }

    private void simulateReading(Device device) {
        try {
            // Generamos datos realistas basados en tipo de dispositivo
            var voltage = generateVoltage(device);
            var current = generateCurrent(device);
            var power = voltage * current; // P = V * I
            var temperature = generateTemperature(device);

            // Inyectar anomalías ocasionalmente (5% probabilidad)
            if (random.nextDouble() < 0.05) {
                injectAnomaly(device, voltage, current, power, temperature);
            }

            // Enviar a Ubidots
            ubidotsService.sendDataReading(
                    device.getUbidotsLabel(),
                    voltage, current, power, temperature
            );

            // Enviar por WebSocket a clientes suscritos
            Reading reading = new Reading();
            reading.setDeviceId(device.getUbidotsLabel());
            reading.setVoltage(voltage);
            reading.setCurrent(current);
            reading.setPower(power);
            reading.setTemperature(temperature);
            reading.setTimestamp(LocalDateTime.now());

            energyDataHandler.sendEnergyData(device.getUbidotsLabel(), reading);

        } catch (Exception e) {
            log.error("Error simulating reading for device: {}", device.getName(), e);
        }
    }

    private double generateVoltage(Device device) {
        // Voltaje base según tipo de dispositivo
        double baseVoltage = switch (device.getType().toLowerCase()) {
            case "motor" -> 220.0;
            case "pump" -> 380.0;
            case "compressor" -> 440.0;
            default -> 220.0;
        };

        // Variación normal ±5%
        double variation = (random.nextGaussian() * 0.05) + 1.0;
        return baseVoltage * variation;
    }

    private double generateCurrent(Device device) {
        // Corriente base según tipo
        double baseCurrent = switch (device.getType().toLowerCase()) {
            case "motor" -> 15.0;
            case "pump" -> 25.0;
            case "compressor" -> 35.0;
            default -> 10.0;
        };

        // Patrón diario (más consumo en horas laborales)
        double hourFactor = getDailyPattern();
        double variation = (random.nextGaussian() * 0.1) + 1.0;

        return baseCurrent * hourFactor * variation;
    }

    private double generateTemperature(Device device) {
        double baseTemp = 45.0; // Temperatura base operacional
        double variation = random.nextGaussian() * 5.0; // ±5°C
        return Math.max(20.0, baseTemp + variation); // Mínimo 20°C
    }

    private double getDailyPattern(){
        LocalTime now = LocalTime.now();
        //Hora : &:00 am
        if(now.isBefore(LocalTime.of(6,0))){
            return 0.6;
        }else if(now.isBefore(LocalTime.of(19,0))) {
            //Simular pequeñas varias durante el día
            return 1.0 + random.nextDouble() * 0.2;
        }else{
            return 0.8;
        }
    }

    private void injectAnomaly(Device device, double voltage, double current, double power, double temperature) {
        int anomalyType = random.nextInt(4); // 0-3

        switch(anomalyType) {
            case 0: current *= 1.5; break;     // Pico consumo
            case 1: voltage *= 0.8; break;     // Caída de voltaje
            case 2: temperature += 20; break;  // Sobrecalentamiento del dispositivo
            case 3: current = 0; break;        // Corte
        }
        log.warn("Anomaly injected for device: {}", device.getName());
    }
}
