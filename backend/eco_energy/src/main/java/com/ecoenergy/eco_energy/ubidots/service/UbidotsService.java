package com.ecoenergy.eco_energy.ubidots.service;

import com.ecoenergy.eco_energy.analytics.dto.Reading;
import com.ecoenergy.eco_energy.ubidots.client.UbidotsClient;
import com.ecoenergy.eco_energy.ubidots.dto.UbidotsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;
import reactor.util.function.Tuple4;

import java.time.Instant;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class UbidotsService {
    private final UbidotsClient ubidotsClient;

    public void sendDataReading(String deviceId, double voltage, double current,
                                double power, double temperature) {
        //Este mapeo convierte los atributos en objetos clave-valor
        //los valores pueden tomar el atributo que el contexto los requiera
        Map<String, Object> payload = Map.of(
                "voltage", voltage,
                "current", current,
                "power", power,
                "temperature", temperature,
                "timestamp", System.currentTimeMillis()
        );
        //Procedemos a enviar el Id del Device y la carga util con el siguiente metodo
        ubidotsClient.sendDataDevice(deviceId, payload)
                .subscribe(
                        response -> log.info("Retrieved device {}", deviceId),
                        error -> log.error("Failed to seend reading for devive{}", deviceId)
                );
    }

    //Con este metodo podemos obtener informacion de un dispositivo desde Ubidots.
    public Mono<UbidotsDTO> getDeviceInfo(String deviceLabel) {
        return ubidotsClient.getDevice(deviceLabel)
                .doOnSuccess(device -> log.info("Retrieved device: {}", device.getLabel()))
                .doOnError(error -> log.error("Failed to get device: {}", deviceLabel, error));
    }

    //Con este metodo podemos registrat metodos anomalos
    public void sendAnomaly(String deviceId, String anomalyType, double value) {
        Map<String, Object> payload = Map.of(
                "anomaly_type", anomalyType,
                "anomaly_value", value,
                "detected_at", System.currentTimeMillis()
        );


        ubidotsClient.sendDataDevice(deviceId + "_anomalies", payload)
                .subscribe();
    }

    //Metodo para obtener lecturas de un dispositivo en un rango de tiempo especificado
    //Este metodo recibe el Id del dispositivo, la fecha de inicio y la fecha de fin
    public List<Reading> getReading(String deviceId, LocalDateTime from, LocalDateTime to) {
        long startTimestamp = from.toEpochSecond(ZoneOffset.UTC) * 1000;
        long endTimestamp = to.toEpochSecond(ZoneOffset.UTC) * 1000;

        List<String> variables = List.of("voltage", "current", "power", "temperature");

        List<Reading> readings = new ArrayList<>();

        try {
            Map<String, List<Map<String, Object>>> variableData = new HashMap<>();

            for (String variable : variables) {
                List<Map<String, Object>> data = ubidotsClient.getDeviceReadings(deviceId, variable, startTimestamp, endTimestamp)
                        .block();
                variableData.put(variable, data);
            }

            List<Map<String, Object>> powerData = variableData.get("power");

            for (Map<String, Object> powerReading : powerData) {
                long timestamp = ((Number) powerReading.get("timestamp")).longValue();
                LocalDateTime dateTime = LocalDateTime.ofEpochSecond(timestamp / 1000, 0, ZoneOffset.UTC);

                Reading reading = new Reading();
                reading.setDeviceId(deviceId);
                reading.setTimestamp(dateTime);
                reading.setPower(((Number) powerReading.get("value")).doubleValue());
                reading.setVoltage(findValueByTimestamp(variableData.get("voltage"), timestamp));
                reading.setCurrent(findValueByTimestamp(variableData.get("current"), timestamp));
                reading.setTemperature(findValueByTimestamp(variableData.get("temperature"), timestamp));

                readings.add(reading);
            }
        } catch (Exception e) {
            log.error("Error getting readings from Ubidots for device: {}", deviceId, e);
            return Collections.emptyList();
        }
        return readings;
    }

    private double findValueByTimestamp(List<Map<String, Object>> temperature, long timestamp) {
        return temperature.stream()
                .filter(reading -> ((Number) reading.get("timestamp")).longValue() == timestamp)
                .findFirst()
                .map(reading -> ((Number) reading.get("value")).doubleValue())
                .orElse(0.0);
    }
}