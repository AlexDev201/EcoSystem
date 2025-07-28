package com.ecoenergy.eco_energy.notification.websocket;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.logging.ErrorManager;

@Slf4j
@Component
public class EnergyDataHandler extends TextWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();
    private final Map<String, List<String>> deviceSubscriptions = new ConcurrentHashMap<>();
    private final ObjectMapper objectMapper = new ObjectMapper(); // Para parsear JSON

    @Override
    public void afterConnectionEstablished(WebSocketSession session) throws Exception {
        sessions.put(session.getId(), session);
        log.info("Client connected: {}", session.getId());

        Map<String, String> welcome = Map.of("type", "connection", "status", "connected");
        session.sendMessage(toTextMessage(welcome));
    }

    @Override
    public void handleTextMessage(WebSocketSession session, TextMessage message) throws Exception {
        JsonNode data = objectMapper.readTree(message.getPayload());

        String type = data.get("type").asText();
        String deviceId = data.get("deviceId").asText();

        if ("subscribe".equals(type)) {
            deviceSubscriptions
                    .computeIfAbsent(session.getId(), k -> new ArrayList<>())
                    .add(deviceId);

            Map<String, String> confirm = Map.of("type", "subscribed", "deviceId", deviceId);
            session.sendMessage(toTextMessage(confirm));
        }

        if ("unsubscribe".equals(type)) {
            deviceSubscriptions.getOrDefault(session.getId(), new ArrayList<>()).remove(deviceId);
        }
    }

    @Override
    public void afterConnectionClosed(WebSocketSession session, CloseStatus status) {
        sessions.remove(session.getId());
        deviceSubscriptions.remove(session.getId());
        log.info("Client disconnected: {}", session.getId());
    }

    // Método llamado desde DeviceSimulator o servicio externo
    public void sendEnergyData(String deviceId, Object reading) {
        sessions.forEach((sessionId, session) -> {
            List<String> subscribedDevices = deviceSubscriptions.get(sessionId);
            if (subscribedDevices != null && subscribedDevices.contains(deviceId)) {
                try {
                    Map<String, Object> message = Map.of(
                            "type", "energy_data",
                            "deviceId", deviceId,
                            "data", reading
                    );
                    session.sendMessage(toTextMessage(message));
                } catch (IOException e) {
                    log.error("Error sending data to session {}: {}", sessionId, e.getMessage());
                }
            }
        });
    }

    private TextMessage toTextMessage(Object obj) throws JsonProcessingException {
        return new TextMessage(objectMapper.writeValueAsString(obj));
    }
}
