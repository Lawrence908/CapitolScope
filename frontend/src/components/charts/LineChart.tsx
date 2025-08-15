import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export interface LineChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
    fill?: boolean;
    tension?: number;
  }[];
}

interface LineChartProps {
  data: LineChartData;
  title?: string;
  height?: number;
  className?: string;
}

const LineChart: React.FC<LineChartProps> = ({ data, title, height = 400, className = '' }) => {
  const options: ChartOptions<'line'> = {
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
      <Line data={data} options={options} />
    </div>
  );
};

export default LineChart; 