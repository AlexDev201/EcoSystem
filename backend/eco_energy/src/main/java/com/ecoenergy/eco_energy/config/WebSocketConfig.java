package com.ecoenergy.eco_energy.config;

import com.ecoenergy.eco_energy.notification.websocket.EnergyDataHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.EnableWebSocket;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
@EnableWebSocket
@RequiredArgsConstructor

public class WebSocketConfig  implements WebSocketConfigurer {
    private final EnergyDataHandler energyDataHandler;
    @Override
    public void registerWebSocketHandlers(WebSocketHandlerRegistry registry) {
        registry.addHandler(energyDataHandler, "/ws/energy").setAllowedOrigins("*");
    }


}
