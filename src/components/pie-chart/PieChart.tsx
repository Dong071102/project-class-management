import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
    ChartOptions,
    Title,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels'; // Import plugin

// Đăng ký các thành phần của Chart.js và plugin datalabels
ChartJS.register(ArcElement, Tooltip, Legend, Title, ChartDataLabels);

interface PieChartProps {
    presentDays: number;
    lateDays: number;
    absentDays: number;
}

const PieChartComponent: React.FC<PieChartProps> = ({ presentDays, lateDays, absentDays }) => {
    // Kiểm tra và thay thế giá trị NaN hoặc undefined bằng 0
    const validPresentDays = isNaN(presentDays) ? 0 : presentDays;
    const validLateDays = isNaN(lateDays) ? 0 : lateDays;
    const validAbsentDays = isNaN(absentDays) ? 0 : absentDays;

    const totalDays = validPresentDays + validLateDays + validAbsentDays;

    const data = {
        labels: ['Đúng giờ', 'Trễ', 'Vắng'],
        datasets: [
            {
                data: [validPresentDays, validLateDays, validAbsentDays],
                backgroundColor: ['#22c55e', '#facc15', '#ef4444'], // Màu xanh, vàng, đỏ
                hoverBackgroundColor: ['#16a34a', '#eab308', '#dc2626'],
            },
        ],
    };

    const options: ChartOptions<'pie'> = {
        maintainAspectRatio: false, // Đảm bảo tỉ lệ giữ nguyên
        responsive: true, // Cho phép điều chỉnh kích thước
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    font: {
                        size: 18, // Tăng kích thước chữ của legend
                    },
                    generateLabels: (chart) => {
                        const dataset = chart.data.datasets[0];
                        return (chart.data.labels ?? []).map((label, i) => {
                            const value = dataset.data[i];
                            // Kiểm tra kiểu dữ liệu và đảm bảo value là number hợp lệ
                            if (typeof value !== 'number' || isNaN(value)) {
                                return {
                                    text: `${label}: 0 (0%)`, // Nếu value không hợp lệ, hiển thị 0
                                    fillStyle: dataset.backgroundColor
                                        ? (dataset.backgroundColor as string[])[i]
                                        : undefined,
                                    strokeStyle: dataset.backgroundColor
                                        ? (dataset.backgroundColor as string[])[i]
                                        : undefined,
                                    hidden: true,
                                    index: i,
                                };
                            }

                            const percentage = totalDays > 0 ? ((value / totalDays) * 100).toFixed(1) : '0.0';
                            return {
                                text: `${label}: ${value} (${percentage}%)`, // Thêm phần trăm vào nhãn
                                fillStyle: dataset.backgroundColor
                                    ? (dataset.backgroundColor as string[])[i]
                                    : undefined,
                                strokeStyle: dataset.backgroundColor
                                    ? (dataset.backgroundColor as string[])[i]
                                    : undefined,
                                hidden: false,
                                index: i,
                            };
                        });
                    },
                },
            },
            datalabels: {
                formatter: (value: number | null, context: any) => {
                    if (value === null || isNaN(value)) {
                        return '0%'; // Nếu value không hợp lệ, trả về 0%
                    }

                    const total = context.dataset.data.reduce((acc: number, val: number) => acc + val, 0);
                    // Kiểm tra tổng để tránh chia cho 0
                    if (total > 0) {
                        const percentage = ((value / total) * 100).toFixed(1); // Tính tỷ lệ phần trăm
                        return `${percentage}%`; // Hiển thị phần trăm
                    }
                    return '0%'; // Tránh chia cho 0
                },
                color: 'white', // Màu chữ trên mỗi phần của biểu đồ
                font: {
                    weight: 'bold',
                    size: 14, // Kích thước chữ phần trăm
                },
                padding: 10, // Khoảng cách chữ với phần của biểu đồ
            },
        },
    };

    return (
        <div className="w-full h-80 mx-auto"> {/* Đảm bảo biểu đồ chiếm toàn bộ chiều rộng */}
            <div className="relative w-full h-full">
                <Pie data={data} options={options} />
            </div>
        </div>
    );
};

export default PieChartComponent;
