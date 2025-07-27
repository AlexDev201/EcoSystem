package com.ecoenergy.eco_energy.analytics.service;

import com.ecoenergy.eco_energy.analytics.dto.PowerConsumption;
import com.ecoenergy.eco_energy.analytics.dto.Reading;
import com.ecoenergy.eco_energy.analytics.dto.SimulationResult;
import com.ecoenergy.eco_energy.analytics.model.Anomaly;
import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.ubidots.service.UbidotsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigitalTwinService {
    private final UbidotsService ubidotsService;

    public PowerConsumption predict(Device device, Duration timeFrame){
        LocalDateTime startTime = LocalDateTime.now().minus(timeFrame);
        LocalDateTime endTime = LocalDateTime.now();
        List<Reading> readings = ubidotsService.getReading(device.getUbidotsLabel(), startTime, endTime);

        if (readings.isEmpty()) {
            log.warn("No readings found for device: {}", device.getUbidotsLabel());
            return new PowerConsumption(0.0, LocalDateTime.now(), 0.0, "No Data");
        }

        double totalPowe= 0.0;
        for (Reading reading : readings) {
            totalPowe += reading.getValue();
        }

        double averagePower = totalPowe / readings.size();

        double variance = readings.stream()
                .mapToDouble(r -> Math.pow(r.getValue() - averagePower, 2))
                .average()
                .orElse(0.0);

        double stdDev = Math.sqrt(variance);

        return new PowerConsumption(
                averagePower,
                LocalDateTime.now(),
                stdDev,
                "SimpleAverage"
        );
    }

    public List<Anomaly> detectAnomalies(List<Reading>){


    }

    public SimulationResult simulateScenario(Device device, Map<String, Double>){

    }
}
