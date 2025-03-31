import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartProps {
    presentDays: number;
    lateDatys: number;
    absentDatys: number;
}

const PieChartComponent: React.FC<PieChartProps> = ({ presentDays, lateDatys, absentDatys }) => {
    const data = {
        labels: ['Đúng giờ', 'Trễ', 'Vắng'],
        datasets: [
            {
                data: [presentDays, lateDatys, absentDatys],
                backgroundColor: ['#22c55e', '#facc15', '#ef4444'], // xanh, vàng, đỏ
                hoverBackgroundColor: ['#16a34a', '#eab308', '#dc2626'],
            },
        ],
    };

    // Legend bên phải, tắt giữ nguyên tỉ lệ để có thể điều chỉnh kích thước
    const options: ChartOptions<'pie'> = {
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right', // Đưa legend sang bên phải
                labels: {
                    // Hiển thị nhãn kèm số lượng
                    generateLabels: (chart) => {
                        const dataset = chart.data.datasets[0];
                        return (chart.data.labels ?? []).map((label, i) => {
                            const value = dataset.data[i];
                            return {
                                text: `${label}: ${value}`,
                                fillStyle: dataset.backgroundColor
                                    ? (dataset.backgroundColor as string[])[i]
                                    : undefined,
                                strokeStyle: dataset.backgroundColor
                                    ? (dataset.backgroundColor as string[])[i]
                                    : undefined,
                                hidden: isNaN(dataset.data[i] as number),
                                index: i,
                            };
                        });
                    },
                },
            },
        },
    };
    return (
        < div className="w-64 h-64 mx-auto" >
            <div className="relative w-full h-full">
                <Pie data={data} options={options} />
            </div>
        </div >
    );

};

export default PieChartComponent;
