"use client";
import { useState, useEffect } from "react";

interface ProgressData {
  date: string;
  totalSavings: number;
  totalInvestments: number;
  activeGoals: number;
  completedGoals: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  timeframe: '7d' | '30d' | '90d' | '1y';
  onTimeframeChange: (timeframe: '7d' | '30d' | '90d' | '1y') => void;
}

const ProgressChart = ({ data, timeframe, onTimeframeChange }: ProgressChartProps) => {
  const [chartType, setChartType] = useState<'savings' | 'investments' | 'goals'>('savings');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    switch (timeframe) {
      case '7d':
        return date.toLocaleDateString('en-US', { weekday: 'short' });
      case '30d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '90d':
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      case '1y':
        return date.toLocaleDateString('en-US', { month: 'short' });
      default:
        return date.toLocaleDateString();
    }
  };

  const getMaxValue = () => {
    switch (chartType) {
      case 'savings':
        return Math.max(...data.map(d => d.totalSavings));
      case 'investments':
        return Math.max(...data.map(d => d.totalInvestments));
      case 'goals':
        return Math.max(...data.map(d => d.activeGoals + d.completedGoals));
      default:
        return 100;
    }
  };

  const getValue = (item: ProgressData) => {
    switch (chartType) {
      case 'savings':
        return item.totalSavings;
      case 'investments':
        return item.totalInvestments;
      case 'goals':
        return item.activeGoals + item.completedGoals;
      default:
        return 0;
    }
  };

  const getChartColor = () => {
    switch (chartType) {
      case 'savings':
        return 'bg-blue-500';
      case 'investments':
        return 'bg-green-500';
      case 'goals':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getChartLabel = () => {
    switch (chartType) {
      case 'savings':
        return 'Total Savings ($)';
      case 'investments':
        return 'Total Investments ($)';
      case 'goals':
        return 'Total Goals';
      default:
        return '';
    }
  };

  const maxValue = getMaxValue();

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Progress Visualization</h3>
        <div className="flex space-x-2">
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as 'savings' | 'investments' | 'goals')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="savings">Savings</option>
            <option value="investments">Investments</option>
            <option value="goals">Goals</option>
          </select>
          <select
            value={timeframe}
            onChange={(e) => onTimeframeChange(e.target.value as '7d' | '30d' | '90d' | '1y')}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            <option value="7d">7 Days</option>
            <option value="30d">30 Days</option>
            <option value="90d">90 Days</option>
            <option value="1y">1 Year</option>
          </select>
        </div>
      </div>

      <div className="mb-4">
        <p className="text-sm text-gray-600">{getChartLabel()}</p>
        <p className="text-2xl font-bold text-gray-900">
          {chartType === 'goals' 
            ? `${data[data.length - 1]?.activeGoals || 0} active, ${data[data.length - 1]?.completedGoals || 0} completed`
            : `$${data[data.length - 1] ? getValue(data[data.length - 1]).toLocaleString() : '0'}`
          }
        </p>
      </div>

      <div className="h-64 flex items-end space-x-2">
        {data.map((item, index) => {
          const value = getValue(item);
          const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
          
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-100 rounded-t-lg relative" style={{ height: '200px' }}>
                <div
                  className={`w-full ${getChartColor()} rounded-t-lg transition-all duration-500 hover:opacity-80`}
                  style={{ height: `${height}%` }}
                  title={`${formatDate(item.date)}: $${value.toLocaleString()}`}
                ></div>
              </div>
              <div className="mt-2 text-xs text-gray-600 text-center">
                {formatDate(item.date)}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-600">Current</p>
          <p className="font-semibold text-gray-900">
            {chartType === 'goals' 
              ? `${data[data.length - 1]?.activeGoals || 0}`
              : `$${data[data.length - 1] ? getValue(data[data.length - 1]).toLocaleString() : '0'}`
            }
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Peak</p>
          <p className="font-semibold text-gray-900">
            {chartType === 'goals' 
              ? `${Math.max(...data.map(d => d.activeGoals + d.completedGoals))}`
              : `$${maxValue.toLocaleString()}`
            }
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Growth</p>
          <p className="font-semibold text-gray-900">
            {data.length > 1 
              ? `+${(((getValue(data[data.length - 1]) - getValue(data[0])) / getValue(data[0])) * 100).toFixed(1)}%`
              : '0%'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default ProgressChart;
