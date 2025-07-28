package com.ecoenergy.eco_energy.notification.service;
import com.ecoenergy.eco_energy.analytics.dto.PowerConsumption;
import com.ecoenergy.eco_energy.analytics.model.Anomaly;

import com.ecoenergy.eco_energy.notification.dto.AlertNotification;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    // Para enviar por WebSocket
    private final SimpMessagingTemplate messagingTemplate;



    // Método principal
    public void sendAlert(String deviceId, AlertNotification.AlertType type, String message, Object data) {
        try {
            AlertNotification alert = AlertNotification.builder()
                    .deviceId(deviceId)
                    .type(type)
                    .message(message)
                    .data(data)
                    .timestamp(LocalDateTime.now())
                    .build();

            // Enviar por WebSocket a topic específico
            messagingTemplate.convertAndSend("/topic/alerts", alert);

            log.info("Alert sent for device {}: {}", deviceId, message);

        } catch (Exception e) {
            log.error("Failed to send alert for device: {}", deviceId, e);
        }
    }

    public void notifyAnomaly(Anomaly anomaly) {
        String message = String.format("Anomaly detected: %s with value %.2f",
                anomaly.getAnomalyType(), anomaly.getValue());

        Map<String, Object> data = Map.of(
                "anomalyId", anomaly.getId(),
                "type", anomaly.getAnomalyType(),
                "value", anomaly.getValue(),
                "detectedAt", anomaly.getDetectedAt()
        );

        sendAlert(anomaly.getDeviceId().toString(), AlertNotification.AlertType.ANOMALY, message, data);
    }

    public void notifyPrediction(String deviceId, PowerConsumption prediction) {
        // Solo alertar si predicción es crítica (>threshold)
        if (prediction.getPredictedValue() > 3000) { // 3kW threshold ejemplo
            String message = String.format("High consumption predicted: %.2f kW",
                    prediction.getPredictedValue());

            sendAlert(deviceId, AlertNotification.AlertType.PREDICTION, message, prediction);
        }
    }

    public void broadcastSystemMessage(String message) {
        AlertNotification alert = AlertNotification.builder()
                .type(AlertNotification.AlertType.SYSTEM)
                .message(message)
                .timestamp(LocalDateTime.now())
                .build();

        messagingTemplate.convertAndSend("/topic/system", alert);
    }

}