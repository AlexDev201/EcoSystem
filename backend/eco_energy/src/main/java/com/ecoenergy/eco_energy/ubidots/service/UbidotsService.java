package com.ecoenergy.eco_energy.ubidots.service;

import com.ecoenergy.eco_energy.ubidots.client.UbidotsClient;
import com.ecoenergy.eco_energy.ubidots.dto.UbidotsDevice;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class UbidotsService {
    private final UbidotsClient ubidotsClient;

    public  void sendDataReading(String deviceId, double voltage, double current,
                                  double power, double temperature){
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
                        error ->  log.error("Failed to seend reading for devive{}", deviceId)
                );
    }
    //Con este metodo podemos obtener informacion de un dispositivo desde Ubidots.
    public Mono<UbidotsDevice> getDeviceInfo(String deviceLabel) {
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
}
