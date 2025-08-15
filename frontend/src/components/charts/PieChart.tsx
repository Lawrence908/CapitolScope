import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import type { ChartOptions } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

export interface PieChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
  }[];
}

interface PieChartProps {
  data: PieChartData;
  title?: string;
  height?: number;
  className?: string;
}

const PieChart: React.FC<PieChartProps> = ({ data, title, height = 400, className = '' }) => {
  const options: ChartOptions<'pie'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#9ca3af', // text-gray-400
          font: {
            size: 12,
          },
          padding: 20,
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
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} (${percentage}%)`;
          }
        }
      },
    },
  };

  return (
    <div className={`w-full ${className}`} style={{ height }}>
      <Pie data={data} options={options} />
    </div>
  );
};

export default PieChart; 