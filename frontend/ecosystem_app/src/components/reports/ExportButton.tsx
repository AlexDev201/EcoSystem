// src/components/reports/ExportButton.tsx
import { Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ExportButtonProps {
  data: any
  filename: string
  disabled?: boolean
}

export const ExportButton = ({ data, filename, disabled = false }: ExportButtonProps) => {
  const handleExport = () => {
    if (!data) return

    try {
      // Convert data to JSON string with proper formatting
      const jsonData = JSON.stringify(data, null, 2)
      
      // Create blob and download link
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      // Create temporary link and trigger download
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.json`
      document.body.appendChild(link)
      link.click()
      
      // Cleanup
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting data:', error)
    }
  }

  const handleExportCSV = () => {
    if (!data) return

    try {
      let csvContent = ""
      
      if (data.totalConsumption !== undefined) {
        // Daily Report
        csvContent = "Tipo,Valor\n"
        csvContent += `Consumo Total (kWh),${data.totalConsumption}\n`
        csvContent += `Voltaje Promedio (V),${data.avgVoltage}\n`
        csvContent += `Corriente Promedio (A),${data.avgCurrent}\n`
        csvContent += `Anomalías,${data.anomalyCount}\n`
      } else if (data.anomalies) {
        // Anomaly Report
        csvContent = "ID,Tipo,Valor,Fecha\n"
        data.anomalies.forEach((anomaly: any) => {
          csvContent += `${anomaly.id},${anomaly.anomalyType},${anomaly.value},${anomaly.detectedAt}\n`
        })
      } else if (data.currentPower !== undefined) {
        // KPIs Report
        csvContent = "Indicador,Valor\n"
        csvContent += `Potencia Actual (W),${data.currentPower}\n`
        csvContent += `Potencia Promedio (W),${data.avgPower}\n`
        csvContent += `Eficiencia (%),${data.efficiency}\n`
        csvContent += `Tiempo Activo (h),${data.uptimeHours}\n`
        csvContent += `Estado,${data.status}\n`
      }
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `${filename}.csv`
      document.body.appendChild(link)
      link.click()
      
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error exporting CSV:', error)
    }
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={handleExportCSV}
        disabled={disabled}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar CSV
      </Button>
      <Button
        onClick={handleExport}
        disabled={disabled}
        variant="outline"
        size="sm"
        className="flex items-center gap-2"
      >
        <Download className="h-4 w-4" />
        Exportar JSON
      </Button>
    </div>
  )
}