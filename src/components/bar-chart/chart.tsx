import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ChartOptions,
} from 'chart.js';

// Đăng ký các thành phần cần thiết cho Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

type FilterType = 'year' | 'month' | 'week';

// Hàm tạo dữ liệu mẫu theo từng filter
const generateData = (filterType: FilterType) => {
    if (filterType === 'year') {
        return {
            labels: Array.from({ length: 12 }, (_, i) => `Tháng ${i + 1}`),
            data: Array.from({ length: 12 }, () => Math.floor(Math.random() * 20000) + 5000),
        };
    } else if (filterType === 'month') {
        return {
            labels: Array.from({ length: 4 }, (_, i) => `Tuần ${i + 1}`),
            data: Array.from({ length: 4 }, () => Math.floor(Math.random() * 5000) + 1000),
        };
    } else { // week
        return {
            labels: Array.from({ length: 7 }, (_, i) => `Ngày ${i + 1}`),
            data: Array.from({ length: 7 }, () => Math.floor(Math.random() * 1000) + 300),
        };
    }
};

// Cấu hình biểu đồ
const options: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
        legend: {
            display: true,
            labels: { color: '#555' },
        },
        title: {
            display: true,
            text: 'Báo cáo điểm danh',
            color: '#333',
            font: { size: 18 },
        },
        tooltip: {
            mode: 'index',
            intersect: false,
        },
    },
    interaction: {
        mode: 'index',
        intersect: false,
    },
    scales: {
        x: {
            ticks: { color: '#555' },
            grid: { color: '#f0f0f0' },
        },
        y: {
            beginAtZero: true,
            ticks: { color: '#555' },
            grid: { color: '#f0f0f0' },
        },
    },
};

const AttendanceChart: React.FC = () => {
    const [filterType, setFilterType] = useState<FilterType>('year');
    const { labels, data } = generateData(filterType);

    // Ví dụ sử dụng 1 dataset "Có mặt" (bạn có thể thêm dataset khác nếu cần)
    const chartData = {
        labels,
        datasets: [
            {
                label: 'Có mặt',
                data,
                backgroundColor: 'rgba(40, 167, 69, 0.6)',
                borderColor: 'rgba(40, 167, 69, 1)',
                borderWidth: 1,
            },
            // Bạn có thể thêm các dataset khác tương tự như "Vắng", "Đi trễ" nếu cần
        ],
    };

    return (
        <div className="p-4 bg-white rounded-[16px] shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-lg font-semibold">Báo cáo điểm danh</h1>
                <select
                    className="p-2 border rounded"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value as FilterType)}
                >
                    <option value="year">Năm</option>
                    <option value="month">Tháng</option>
                    <option value="week">Tuần</option>
                </select>
            </div>
            <div className="w-full h-96">
                <Bar data={chartData} options={options} />
            </div>
        </div>
    );
};

export default AttendanceChart;
