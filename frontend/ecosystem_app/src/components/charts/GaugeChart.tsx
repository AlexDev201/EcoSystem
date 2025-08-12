// src/components/charts/GaugeChart.tsx
import React from 'react'
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  ChartOptions,
} from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

interface GaugeChartProps {
  value: number
  maxValue: number
  title: string
  unit: string
  color: string
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  value,
  maxValue,
  title,
  unit,
  color
}) => {
  const percentage = Math.min((value / maxValue) * 100, 100)
  const remaining = 100 - percentage

  const data = {
    datasets: [
      {
        data: [percentage, remaining],
        backgroundColor: [color, '#f0f0f0'],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  }

  const options: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        enabled: false,
      },
    },
  }

  return (
    <div className="bg-white p-4 rounded-xl shadow-sm h-48 flex flex-col items-center justify-center">
      <div className="relative w-32 h-32">
        <Doughnut data={data} options={options} />
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold" style={{ color }}>
            {value.toFixed(1)}
          </span>
          <span className="text-xs text-gray-500">{unit}</span>
        </div>
      </div>
      <h3 className="text-sm font-semibold mt-2 text-center">{title}</h3>
    </div>
  )
}
