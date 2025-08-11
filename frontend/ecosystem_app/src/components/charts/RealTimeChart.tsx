// src/components/charts/RealTimeChart.tsx
import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { Reading } from '@/services/types'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

interface RealTimeChartProps {
  readings: Reading[]
  dataKey: keyof Pick<Reading, 'voltage' | 'current' | 'power' | 'temperature'>
  title: string
  color: string
  unit: string
  deviceId: string
}

export const RealTimeChart: React.FC<RealTimeChartProps> = ({
  readings,
  dataKey,
  title,
  color,
  unit,
  deviceId
}) => {
  // Preparar datos para el gráfico
  const chartData = {
    labels: readings.map((_, index) => {
      // Mostrar solo cada 5ta etiqueta para evitar saturación
      return index % 5 === 0 ? `${index + 1}` : ''
    }),
    datasets: [
      {
        label: `${title} (${unit})`,
        data: readings.map(reading => reading[dataKey]),
        borderColor: color,
        backgroundColor: `${color}20`,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  }

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: `${title} - ${deviceId}`,
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
        display: true,
        title: {
          display: true,
          text: 'Lecturas',
        },
        grid: {
          display: false,
        },
      },
      y: {
        display: true,
        title: {
          display: true,
          text: unit,
        },
        grid: {
          color: '#f0f0f0',
        },
      },
    },
    animation: {
      duration: 300,
      easing: 'easeInOutQuart',
    },
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-64">
      <Line data={chartData} options={options} />
    </div>
  )
}
