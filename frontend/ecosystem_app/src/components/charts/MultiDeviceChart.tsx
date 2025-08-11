// src/components/charts/MultiDeviceChart.tsx
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { Reading } from '@/services/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
)

interface MultiDeviceChartProps {
  latestReadings: Record<string, Reading>
  dataKey: keyof Pick<Reading, 'voltage' | 'current' | 'power' | 'temperature'>
  title: string
  unit: string
  color: string
}

export const MultiDeviceChart: React.FC<MultiDeviceChartProps> = ({
  latestReadings,
  dataKey,
  title,
  unit,
  color
}) => {
  const devices = Object.keys(latestReadings)
  const values = devices.map(deviceId => latestReadings[deviceId][dataKey])

  const chartData = {
    labels: devices,
    datasets: [
      {
        label: `${title} (${unit})`,
        data: values,
        backgroundColor: `${color}80`,
        borderColor: color,
        borderWidth: 2,
      },
    ],
  }

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${title} por Dispositivo`,
        font: {
          size: 14,
          weight: 'bold',
        },
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}`
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Dispositivos',
        },
      },
      y: {
        title: {
          display: true,
          text: unit,
        },
        beginAtZero: true,
      },
    },
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-64">
      <Bar data={chartData} options={options} />
    </div>
  )
}
