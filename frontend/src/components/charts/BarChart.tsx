import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export interface BarChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface BarChartProps {
  data: BarChartData;
  title?: string;
  height?: number;
  className?: string;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, height = 400, className = '' }) => {
  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#9ca3af', // text-gray-400
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: !!title,
        text: title,
        color: '#f9fafb', // text-gray-100
        font: {
          size: 16,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: '#374151', // bg-gray-700
        titleColor: '#f9fafb', // text-gray-100
        bodyColor: '#d1d5db', // text-gray-300
        borderColor: '#4b5563', // border-gray-600
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: {
          color: '#9ca3af', // text-gray-400
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#374151', // border-gray-700
        },
      },
      y: {
        ticks: {
          color: '#9ca3af', // text-gray-400
          font: {
            size: 11,
          },
        },
        grid: {
          color: '#374151', // border-gray-700
        },
      },
    },
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Bar data={data} options={options} />
    </div>
  );
};

export default BarChart; 