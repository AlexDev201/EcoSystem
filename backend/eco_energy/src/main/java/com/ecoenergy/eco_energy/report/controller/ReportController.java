package com.ecoenergy.eco_energy.report.controller;

import com.ecoenergy.eco_energy.analytics.dto.Reading;
import com.ecoenergy.eco_energy.report.dto.AnomalyReport;
import com.ecoenergy.eco_energy.report.dto.CsvExportData;
import com.ecoenergy.eco_energy.report.dto.DailyReport;
import com.ecoenergy.eco_energy.report.dto.DeviceKpis;
import com.ecoenergy.eco_energy.report.service.ReportService;
import com.ecoenergy.eco_energy.ubidots.service.UbidotsService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.core.io.Resource;
import org.springframework.core.io.ByteArrayResource;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {
    private final ReportService reportService;
    private  final UbidotsService ubidotsService;
    @GetMapping("/daily/{deviceId}")
    public ResponseEntity<DailyReport> getDailyReport(@PathVariable String deviceId,
                                                      @RequestParam LocalDate date) {
        try{
            DailyReport report = reportService.generateDailyReport(
                    UUID.fromString(deviceId), date
            );

            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating daily report for device {} on date {}: {}", deviceId, date, e.getMessage());
            return ResponseEntity.status(500).body(null);
        }

    }

    @GetMapping("/anomalies")
    public ResponseEntity<AnomalyReport> getAnomalyReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDate to,
            @RequestParam(required = false) String deviceId) {

        try {
            AnomalyReport report = reportService.generateAnomalyReport(
                    UUID.fromString(deviceId),
                    from,
                    to
            );

            return ResponseEntity.ok(report);

        } catch (Exception e) {
            log.error("Error generating anomaly report from {} to {}", from, to, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/kpis/{deviceId}")
    public ResponseEntity<DeviceKpis> getDeviceKpis(
            @PathVariable String deviceId
            , @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from
            , @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to
    ) {

        try {
            DeviceKpis kpis = reportService.getDeviceStatistics(UUID.fromString(deviceId), from,to);
            return ResponseEntity.ok(kpis);

        } catch (Exception e) {
            log.error("Error getting KPIs for device: {}", deviceId, e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/export/csv")
    public ResponseEntity<Resource> exportToCsv(
            @RequestParam String deviceId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {

        try {
            List<Reading> readings = ubidotsService.getReading(
                    deviceId, from.atStartOfDay(), to.plusDays(1).atStartOfDay()
            );

            String csvContent = reportService.exportToCsv(readings); // ✔ Arreglado

            ByteArrayResource resource = new ByteArrayResource(csvContent.getBytes());

            String filename = String.format("energy_data_%s_%s_to_%s.csv",
                    deviceId, from.toString(), to.toString());

            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename)
                    .header(HttpHeaders.CONTENT_TYPE, "text/csv")
                    .body(resource);

        } catch (Exception e) {
            log.error("Error exporting CSV for device: {} from {} to {}", deviceId, from, to, e);
            return ResponseEntity.badRequest().build();
        }
    }



}
