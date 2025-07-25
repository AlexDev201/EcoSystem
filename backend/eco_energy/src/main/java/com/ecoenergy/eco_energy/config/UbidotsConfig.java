package com.ecoenergy.eco_energy.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
@ConfigurationProperties(prefix = "ubidots")
@Data
public class UbidotsConfig {
    private String apiUrl = "https://industrial.api.ubidots.com/api/v1.6";
    private String token;

    @Bean
    public WebClient ubidotsWebClient(){
        return  WebClient.builder()
                .baseUrl(apiUrl)
                .defaultHeader("X-Auth-Token", token)
                .defaultHeader("Content-Type", "applicaton/json")
                .build();
    }
}
