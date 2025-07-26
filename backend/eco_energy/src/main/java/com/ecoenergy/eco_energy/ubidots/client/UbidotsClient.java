package com.ecoenergy.eco_energy.ubidots.client;

import com.ecoenergy.eco_energy.ubidots.dto.UbidotsDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Component
@RequiredArgsConstructor
@Slf4j
public class UbidotsClient {
    private final WebClient ubidotsWebClient;

    public Mono<String> sendDataDevice(String deviceLabel, Map<String, Object> data){
        return  ubidotsWebClient
                .post()
                .uri("/devices/{deviceLabek}", deviceLabel)
                .retrieve()
                .bodyToMono(String.class)
                .doOnSuccess(response -> log.info("Data sent to Ubidots: {}", deviceLabel))
                .doOnError(error -> log.error("Error sending to Ubidots: {}", error.getMessage()));
    }
    public Mono<UbidotsDTO> getDevice(String deviceLabel){
        return ubidotsWebClient
                .get()
                .uri("/devices/{deviceLabel}", deviceLabel)
                .retrieve()
                .bodyToMono(UbidotsDTO.class);
    }
}
