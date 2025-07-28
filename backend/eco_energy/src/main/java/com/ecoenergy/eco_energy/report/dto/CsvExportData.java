package com.ecoenergy.eco_energy.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Builder
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CsvExportData {
    private  List<String[]> rows;
    private String[] headers;
}
