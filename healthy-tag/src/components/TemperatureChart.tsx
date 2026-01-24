'use client';

import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    ChartOptions,
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface TemperatureChartProps {
    data: {
        labels: string[];
        temperatures: number[];
        humidity: number[];
    };
    tempMin: number;
    tempMax: number;
    showHumidity?: boolean;
    height?: number;
}

export default function TemperatureChart({
    data,
    tempMin,
    tempMax,
    showHumidity = true,
    height = 300
}: TemperatureChartProps) {
    const chartData = {
        labels: data.labels,
        datasets: [
            {
                label: 'Temperature (°C)',
                data: data.temperatures,
                borderColor: '#0ea5e9',
                backgroundColor: 'rgba(14, 165, 233, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#0ea5e9',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                yAxisID: 'y',
            },
            ...(showHumidity ? [{
                label: 'Humidity (%)',
                data: data.humidity,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: '#8b5cf6',
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
                yAxisID: 'y1',
            }] : []),
        ],
    };

    const options: ChartOptions<'line'> = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: '#94a3b8',
                    usePointStyle: true,
                    padding: 20,
                    font: {
                        size: 12,
                    },
                },
            },
            tooltip: {
                backgroundColor: '#1e293b',
                titleColor: '#f8fafc',
                bodyColor: '#f8fafc',
                borderColor: '#334155',
                borderWidth: 1,
                padding: 12,
                displayColors: true,
                callbacks: {
                    label: function (context) {
                        const label = context.dataset.label || '';
                        const value = context.parsed.y;
                        const unit = label.includes('Temperature') ? '°C' : '%';
                        if (value === null || value === undefined) return label;
                        return `${label}: ${value.toFixed(1)}${unit}`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
                ticks: {
                    color: '#64748b',
                    maxRotation: 0,
                    autoSkip: true,
                    maxTicksLimit: 8,
                },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                min: tempMin - 5,
                max: tempMax + 10,
                grid: {
                    color: 'rgba(148, 163, 184, 0.1)',
                },
                ticks: {
                    color: '#64748b',
                    callback: function (value) {
                        return value + '°C';
                    },
                },
                title: {
                    display: true,
                    text: 'Temperature (°C)',
                    color: '#64748b',
                },
            },
            y1: showHumidity ? {
                type: 'linear',
                display: true,
                position: 'right',
                min: 0,
                max: 100,
                grid: {
                    drawOnChartArea: false,
                },
                ticks: {
                    color: '#64748b',
                    callback: function (value) {
                        return value + '%';
                    },
                },
                title: {
                    display: true,
                    text: 'Humidity (%)',
                    color: '#64748b',
                },
            } : undefined,
        },
    };

    // Add threshold annotations
    const thresholdPlugin = {
        id: 'thresholdLines',
        beforeDraw: (chart: ChartJS) => {
            const ctx = chart.ctx;
            const yAxis = chart.scales.y;
            const xAxis = chart.scales.x;

            // Draw min threshold
            const minY = yAxis.getPixelForValue(tempMin);
            ctx.save();
            ctx.strokeStyle = 'rgba(59, 130, 246, 0.5)';
            ctx.setLineDash([5, 5]);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xAxis.left, minY);
            ctx.lineTo(xAxis.right, minY);
            ctx.stroke();

            // Draw max threshold
            const maxY = yAxis.getPixelForValue(tempMax);
            ctx.strokeStyle = 'rgba(239, 68, 68, 0.5)';
            ctx.beginPath();
            ctx.moveTo(xAxis.left, maxY);
            ctx.lineTo(xAxis.right, maxY);
            ctx.stroke();
            ctx.restore();
        },
    };

    return (
        <div className="chart-container" style={{ height }}>
            <Line data={chartData} options={options} plugins={[thresholdPlugin]} />
        </div>
    );
}
