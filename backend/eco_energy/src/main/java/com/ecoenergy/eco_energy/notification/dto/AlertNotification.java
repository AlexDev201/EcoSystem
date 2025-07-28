package com.ecoenergy.eco_energy.notification.dto;

import com.ecoenergy.eco_energy.notification.service.NotificationService;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class AlertNotification {
    private String deviceId;
    private AlertType type;
    private String message;
    private Object data;
    private LocalDateTime timestamp;
    private String severity; // NEW: Severity level of the alert (e.g., LOW, MEDIUM, HIGH)

    public enum AlertType {
        ANOMALY("Anomaly Detected"),
        PREDICTION("Prediction Alert"),
        SYSTEM("System Alert"),
        INFO("Information");

        private final String displayName;

        AlertType(String displayName) {
            this.displayName = displayName;
        }

        public String getDisplayName() {
            return displayName;
        }
    }
}
