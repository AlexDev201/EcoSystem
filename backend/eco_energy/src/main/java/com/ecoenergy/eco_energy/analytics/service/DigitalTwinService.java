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
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DigitalTwinService {
    private final UbidotsService ubidotsService;

    public PowerConsumption predict(Device device, Duration timeFrame) {
        LocalDateTime startTime = LocalDateTime.now().minus(timeFrame);
        LocalDateTime endTime = LocalDateTime.now();
        List<Reading> readings = ubidotsService.getReading(device.getUbidotsLabel(), startTime, endTime);

        if (readings.isEmpty()) {
            log.warn("No readings found for device: {}", device.getUbidotsLabel());
            return new PowerConsumption(0.0, LocalDateTime.now(), 0.0, "No Data");
        }

        double totalPowe = 0.0;
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

    public List<Anomaly> detectAnomalies(List<Reading> readings) {
        //Verificamos que las lecturas no estén vacías
        if (readings.isEmpty()) {
            log.warn("No readings provided for anomaly detection.");
            return List.of();
        }
        // Calculamos la media de las lecturas
        // y la desviación estándar para detectar anomalías
        double sum = 0;
        for (Reading reading : readings) {
            sum += reading.getValue();
        }
        double mean = sum / readings.size();

        double totalDiference = 0;
        for (Reading reading : readings) {
            totalDiference += Math.pow(reading.getValue() - mean, 2);
        }
        //Aplicamos la fórmula de desviación estándar
        //para detectar anomalías
        double stdDev = Math.sqrt(totalDiference / readings.size());
        //Identificamos las anomalías
        List<Anomaly> listAnomalies = new ArrayList<>();
        for (Reading reading : readings) {
            if (Math.abs(reading.getValue() - mean) > 2 * stdDev) {
                Anomaly anomaly = new Anomaly();
                anomaly.setDeviceId(UUID.fromString(reading.getDeviceId()));
                anomaly.setAnomalyType("Z-SCORE");
                anomaly.setValue(reading.getValue());
                anomaly.setDetectedAt(LocalDateTime.now());
                listAnomalies.add(anomaly);
            }
        }
        return listAnomalies;
    }

    public SimulationResult simulateScenario(Device device, Map<String, Double> parameters) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime oneDayAgo = now.minusDays(1);

        List<Reading> readings = ubidotsService.getReading(device.getUbidotsLabel(), oneDayAgo, now);
        if (readings.isEmpty()) {
            log.warn("No readings available for device: {}", device.getUbidotsLabel());
            return new SimulationResult(0.0, 0.0, parameters, "No Data", 0.0);
        }

        Reading lastReading = readings.get(readings.size() - 1);
        double originalPower = lastReading.getPower();
        double currentVoltage = lastReading.getVoltage();
        double currentCurrent = lastReading.getCurrent();
        double newVoltage = currentVoltage;
        double newCurrent = currentCurrent;

        // Aplicamos los cambios de voltaje, corriente y temperatura
        if (parameters.containsKey("voltage")) {
            double voltageChange = parameters.get("voltage");
            newVoltage = currentVoltage * (1 + voltageChange / 100.0);
        }

        if (parameters.containsKey("current")) {
            double currentChange = parameters.get("current");
            newCurrent = currentCurrent * (1 + currentChange / 100.0);
        }

        if (parameters.containsKey("temperature")) {
            double tempIncrease = parameters.get("temperature");
            newCurrent = newCurrent * (1 - tempIncrease / 500.0); // 1% menos por cada 5°C
        }

        double simulatedPower = newVoltage * newCurrent;
        double impact = ((simulatedPower - originalPower) / originalPower) * 100.0;

        String scenario = buildScenarioDescription(parameters);

        return new SimulationResult(
                originalPower,
                simulatedPower,
                parameters,
                scenario,
                impact
        );
    }

    //Generamos una descripción del escenario de simulación
    //con los parámetros de entrada
    //para que sea más fácil de entender
    private String buildScenarioDescription(Map<String, Double> parameters) {
        if (parameters.isEmpty()) return "No change";
        return parameters.entrySet().stream()
                .map(e -> e.getKey() + ": " + (e.getValue() >= 0 ? "+" : "") + e.getValue() + "%")
                .collect(Collectors.joining(", "));
    }


}
