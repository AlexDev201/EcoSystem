package com.ecoenergy.eco_energy.analytics.service;

import com.ecoenergy.eco_energy.analytics.dto.Reading;
import com.ecoenergy.eco_energy.analytics.model.Anomaly;
import com.ecoenergy.eco_energy.analytics.repository.AnomalyRepository;
import com.ecoenergy.eco_energy.ubidots.service.UbidotsService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static java.util.stream.Collectors.toList;

@RequiredArgsConstructor
@Service
public class AnalyticsService {
    private final UbidotsService ubidotsService;
    private final AnomalyRepository anomalyRepository;

    List<Anomaly> detectAnomallies(List<Reading> readings) {
        //Algoritma Z score para detectar anomalías
        //El puntaje z, también conocido como puntuación estándar o unidad tipificada,
        // es una medida estadística que indica cuántas desviaciones estándar se
        // encuentra un valor particular de la media de un conjunto de datos.
        // En esencia, permite comparar valores de diferentes conjuntos de datos con diferentes
        // medias y desviaciones estándar, expresándolos en una escala común.
        //z = (x - μ) / σ
        //
        var mean = calculateMean(readings);
        var stdDev = calculateStandardDeviation(readings, mean);

        return readings.stream()
                .filter(r -> Math.abs(r.getValue() - mean) > 2 * stdDev)
                .map(this::createAnomaly)
                .map((anomalyRepository::save))
                .collect(toList());
    }

    public Anomaly saveAnomaly(UUID deviceId, String type, double value) {
        var anomaly = new Anomaly();
        anomaly.setDeviceId(deviceId);
        anomaly.setAnomalyType(type);
        anomaly.setValue(value);
        anomaly.setDetectedAt(LocalDateTime.now());

        return anomalyRepository.save(anomaly);
    }

    private double calculateMean(List<Reading> readings) {
        return readings.stream()
                .mapToDouble(Reading::getValue)
                .average()
                .orElse(0.0);
    }

    private double calculateStandardDeviation(List<Reading> readings, double mean) {
        double variance = readings.stream()
                .mapToDouble(r -> Math.pow(r.getValue() - mean, 2))
                .average()
                .orElse(0.0);
        return Math.sqrt(variance);
    }

    private Anomaly createAnomaly(Reading reading) {
        Anomaly anomaly = new Anomaly();
        anomaly.setDeviceId(UUID.fromString(reading.getDeviceId()));
        anomaly.setAnomalyType("Z-SCORE");
        anomaly.setValue(reading.getValue());
        anomaly.setDetectedAt(LocalDateTime.now());
        return anomaly;
    }

}
