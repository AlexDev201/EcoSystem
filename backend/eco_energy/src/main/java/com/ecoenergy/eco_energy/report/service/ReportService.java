package  com.ecoenergy.eco_energy.report.service;

import com.ecoenergy.eco_energy.analytics.dto.Reading;
import com.ecoenergy.eco_energy.analytics.model.Anomaly;
import com.ecoenergy.eco_energy.analytics.repository.AnomalyRepository;
import com.ecoenergy.eco_energy.device.model.Device;
import com.ecoenergy.eco_energy.device.service.DeviceService;
import com.ecoenergy.eco_energy.report.dto.AnomalyReport;
import com.ecoenergy.eco_energy.report.dto.DailyReport;
import com.ecoenergy.eco_energy.report.dto.DeviceKpis;
import com.ecoenergy.eco_energy.ubidots.service.UbidotsService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.DoubleSummaryStatistics;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final UbidotsService ubidotsService;
    private final AnomalyRepository anomalyRepository;
    private final DeviceService deviceService;

    public DailyReport generateDailyReport(UUID deviceId, LocalDate date) {
        try {
            Device device = deviceService.getDevice(deviceId)
                    .orElseThrow(() -> new EntityNotFoundException("Device not found with ID: " + deviceId));

            LocalDateTime startOfDay = date.atStartOfDay();
            LocalDateTime endOfDay = date.atTime(23, 59, 59);

            List<Reading> readings = ubidotsService.getReading(
                    device.getUbidotsLabel(), startOfDay, endOfDay
            );

            if (readings.isEmpty()) {
                return DailyReport.builder()
                        .deviceId(deviceId.toString())
                        .date(date)
                        .totalConsumption(0.0)
                        .avgCurrent(0.0)
                        .avgVoltage(0.0)
                        .anomalyCount(0)
                        .build();
            }

            double totalConsumption = readings.stream()
                    .mapToDouble(Reading::getPower)
                    .sum();

            double averageConsumption = readings.stream()
                    .mapToDouble(Reading::getPower)
                    .average()
                    .orElse(0.0);

            double peakConsumption = readings.stream()
                    .mapToDouble(Reading::getPower)
                    .max()
                    .orElse(0.0);

            long anomaliesCount = anomalyRepository
                    .countByDeviceIdAndDetectedAtBetween(deviceId, startOfDay, endOfDay);

            return DailyReport.builder()
                    .deviceId(deviceId.toString())
                    .date(date)
                    .totalConsumption(totalConsumption)
                    .avgCurrent(readings.stream()
                            .mapToDouble(Reading::getCurrent)
                            .average()
                            .orElse(0.0))
                    .avgVoltage(readings.stream()
                            .mapToDouble(Reading::getVoltage)
                            .average()
                            .orElse(0.0))
                    .anomalyCount((int) anomaliesCount)
                    .build();

        } catch (Exception e) {
            log.error("Error generating daily report for device: {}", deviceId, e);
            throw new RuntimeException("Failed to generate daily report", e);
        }
    }

    public AnomalyReport generateAnomalyReport(UUID deviceId, LocalDate from, LocalDate to) {
        try {
            Device device = deviceService.getDevice(deviceId)
                    .orElseThrow(() -> new EntityNotFoundException("Device not found with ID: " + deviceId));

            LocalDateTime startDateTime = from.atStartOfDay();
            LocalDateTime endDateTime = to.atTime(23, 59, 59);

            List<Anomaly> anomalies = anomalyRepository
                    .findByDeviceIdAndDetectedAtBetween(deviceId, startDateTime, endDateTime);

            Map<String, Long> anomaliesByType = anomalies.stream()
                    .collect(Collectors.groupingBy(
                            Anomaly::getAnomalyType,
                            Collectors.counting()
                    ));

            return AnomalyReport.builder()
                    .anomalies(anomalies)
                    .anomaliesByType(
                            anomaliesByType.entrySet().stream()
                                    .collect(Collectors.toMap(
                                            Map.Entry::getKey,
                                            entry -> entry.getValue().intValue() // Convertir Long a Integer
                                    ))
                    )
                    .startPeriod(startDateTime)
                    .endPeriod(endDateTime)
                    .totalCount(anomalies.size())
                    .build();

        } catch (Exception e) {
            log.error("Error generating anomaly report for device: {}", deviceId, e);
            throw new RuntimeException("Failed to generate anomaly report", e);
        }
    }

    public DeviceKpis getDeviceStatistics(UUID deviceId, LocalDate from, LocalDate to) {
        try {
            Device device = deviceService.getDevice(deviceId)
                    .orElseThrow(() -> new EntityNotFoundException("Device not found with ID: " + deviceId));

            LocalDateTime startDateTime = from.atStartOfDay();
            LocalDateTime endDateTime = to.atTime(23, 59, 59);

            List<Reading> readings = ubidotsService.getReading(
                    device.getUbidotsLabel(), startDateTime, endDateTime
            );

            if (readings.isEmpty()) {
                return DeviceKpis.builder()
                        .deviceId(deviceId.toString())
                        .avgPower(0.0)
                        .currentPower(0.0)
                        .efficiency(0.0)
                        .status("No Data")
                        .uptimeHours(0)
                        .build();
            }

            DoubleSummaryStatistics powerStats = readings.stream()
                    .mapToDouble(Reading::getPower)
                    .summaryStatistics();

            DoubleSummaryStatistics voltageStats = readings.stream()
                    .mapToDouble(Reading::getVoltage)
                    .summaryStatistics();

            DoubleSummaryStatistics currentStats = readings.stream()
                    .mapToDouble(Reading::getCurrent)
                    .summaryStatistics();

            long anomaliesCount = anomalyRepository
                    .countByDeviceIdAndDetectedAtBetween(deviceId, startDateTime, endDateTime);

            return DeviceKpis.builder()
                    .deviceId(deviceId.toString())
                    .avgPower(powerStats.getAverage())
                    .currentPower(powerStats.getMax())
                    .efficiency(calculateEfficiencyScore(powerStats.getAverage(), powerStats.getMax()))
                    .uptimeHours((int) readings.stream()
                            .filter(r -> r.getPower() > 0)
                            .count())
                    .status(anomaliesCount > 0 ? "Anomalies Detected" : "Normal")

                    .build();

        } catch (Exception e) {
            log.error("Error getting device statistics for: {}", deviceId, e);
            throw new RuntimeException("Failed to get device statistics", e);
        }
    }

    public String exportToCsv(List<Reading> readings) {
        try {
            StringBuilder csv = new StringBuilder();

            // Header
            csv.append("Device ID,Timestamp,Voltage,Current,Power,Temperature\n");

            // Data rows
            for (Reading reading : readings) {
                csv.append(reading.getDeviceId()).append(",")
                        .append(reading.getTimestamp()).append(",")
                        .append(reading.getVoltage()).append(",")
                        .append(reading.getCurrent()).append(",")
                        .append(reading.getPower()).append(",")
                        .append(reading.getTemperature()).append("\n");
            }

            return csv.toString();

        } catch (Exception e) {
            log.error("Error exporting readings to CSV", e);
            throw new RuntimeException("Failed to export to CSV", e);
        }
    }

    public List<DeviceKpis> getSystemKpis() {
        try {
            List<Device> activeDevices = deviceService.getAllActiveDevices();
            LocalDate today = LocalDate.now();
            LocalDate weekAgo = today.minusDays(7);

            return activeDevices.stream()
                    .map(device -> getDeviceStatistics(device.getId(), weekAgo, today))
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Error getting system KPIs", e);
            throw new RuntimeException("Failed to get system KPIs", e);
        }
    }

    // Helper methods
    private double calculateEfficiencyScore(double average, double peak) {
        if (peak == 0) return 0.0;
        return Math.max(0, 100 - ((peak - average) / peak * 100));
    }

    private double calculateAverageAnomaliesPerDay(List<Anomaly> anomalies, LocalDate from, LocalDate to) {
        long daysBetween = ChronoUnit.DAYS.between(from, to) + 1;
        return daysBetween > 0 ? (double) anomalies.size() / daysBetween : 0.0;
    }

    private double calculateUptimePercentage(List<Reading> readings) {
        if (readings.isEmpty()) return 0.0;

        long activeReadings = readings.stream()
                .filter(r -> r.getPower() > 0)
                .count();

        return (double) activeReadings / readings.size() * 100;
    }
}