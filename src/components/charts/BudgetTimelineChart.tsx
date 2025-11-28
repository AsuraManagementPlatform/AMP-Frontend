import React, { useMemo } from 'react';
import { BudgetTimelinePoint } from '@/types/report.types';

interface BudgetTimelineChartProps {
    data: BudgetTimelinePoint[];
    currency: string;
}

export const BudgetTimelineChart: React.FC<BudgetTimelineChartProps> = ({ data, currency }) => {
    const chartData = useMemo(() => {
        if (!data || data.length === 0) return null;

        const maxValue = Math.max(
            ...data.map(d => Math.max(d.plannedBudget, d.cumulativeRevenue, d.cumulativeExpenses))
        );
        const minValue = 0;
        const range = maxValue - minValue;

        const width = 800;
        const height = 400;
        const padding = { top: 40, right: 120, bottom: 60, left: 60 };
        const chartWidth = width - padding.left - padding.right;
        const chartHeight = height - padding.top - padding.bottom;

        const points = data.map((point, index) => {
            const x = data.length === 1 
                ? padding.left + chartWidth / 2 
                : padding.left + (index / (data.length - 1)) * chartWidth;
            
            const safeRange = range === 0 ? 1 : range;
            const yPlanned = padding.top + chartHeight - ((point.plannedBudget - minValue) / safeRange) * chartHeight;
            const yRevenue = padding.top + chartHeight - ((point.cumulativeRevenue - minValue) / safeRange) * chartHeight;
            const yExpense = padding.top + chartHeight - ((point.cumulativeExpenses - minValue) / safeRange) * chartHeight;
            const yBalance = padding.top + chartHeight - ((point.availableBalance - minValue) / safeRange) * chartHeight;

            return { x, yPlanned, yRevenue, yExpense, yBalance, ...point };
        });

        return { points, width, height, padding, chartWidth, chartHeight, maxValue, minValue };
    }, [data]);

    if (!chartData) {
        return <div className="text-center text-gray-500">Nu există date disponibile</div>;
    }

    const { points, width, height, padding, chartHeight, maxValue, minValue } = chartData;

    const plannedLine = points.map(p => `${p.x},${p.yPlanned}`).join(' ');
    const revenueLine = points.map(p => `${p.x},${p.yRevenue}`).join(' ');
    const expenseLine = points.map(p => `${p.x},${p.yExpense}`).join(' ');
    const balanceLine = points.map(p => `${p.x},${p.yBalance}`).join(' ');

    const formatValue = (value: number) => {
        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
        if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
        return value.toFixed(0);
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return `${date.getDate()}/${date.getMonth() + 1}`;
    };

    const yAxisTicks = 5;
    const yTicks = Array.from({ length: yAxisTicks + 1 }, (_, i) => {
        const value = minValue + (maxValue - minValue) * (i / yAxisTicks);
        const safeRange = (maxValue - minValue) === 0 ? 1 : (maxValue - minValue);
        const y = padding.top + chartHeight - ((value - minValue) / safeRange) * chartHeight;
        return { value, y };
    });

    return (
        <div className="overflow-x-auto">
            <svg width={width} height={height} className="mx-auto">
                <rect x={padding.left} y={padding.top} width={width - padding.left - padding.right} height={chartHeight} fill="#f9fafb" />
                
                {yTicks.map((tick, i) => (
                    <g key={i}>
                        <line
                            x1={padding.left}
                            y1={tick.y}
                            x2={width - padding.right}
                            y2={tick.y}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                        />
                        <text
                            x={padding.left - 10}
                            y={tick.y}
                            textAnchor="end"
                            alignmentBaseline="middle"
                            fontSize="12"
                            fill="#6b7280"
                        >
                            {formatValue(tick.value)} {currency}
                        </text>
                    </g>
                ))}

                <polyline
                    points={plannedLine}
                    fill="none"
                    stroke="#9ca3af"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                />

                <polyline
                    points={revenueLine}
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="3"
                />

                <polyline
                    points={expenseLine}
                    fill="none"
                    stroke="#ef4444"
                    strokeWidth="3"
                />

                <polyline
                    points={balanceLine}
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                />

                {points.map((point, i) => {
                    if (i % Math.ceil(points.length / 10) === 0 || i === points.length - 1) {
                        return (
                            <g key={i}>
                                <line
                                    x1={point.x}
                                    y1={padding.top + chartHeight}
                                    x2={point.x}
                                    y2={padding.top + chartHeight + 5}
                                    stroke="#6b7280"
                                    strokeWidth="1"
                                />
                                <text
                                    x={point.x}
                                    y={padding.top + chartHeight + 20}
                                    textAnchor="middle"
                                    fontSize="12"
                                    fill="#6b7280"
                                >
                                    {formatDate(point.date)}
                                </text>
                            </g>
                        );
                    }
                    return null;
                })}

                <line
                    x1={padding.left}
                    y1={padding.top + chartHeight}
                    x2={width - padding.right}
                    y2={padding.top + chartHeight}
                    stroke="#374151"
                    strokeWidth="2"
                />
                <line
                    x1={padding.left}
                    y1={padding.top}
                    x2={padding.left}
                    y2={padding.top + chartHeight}
                    stroke="#374151"
                    strokeWidth="2"
                />

                <g transform={`translate(${width - padding.right + 10}, ${padding.top + 20})`}>
                    <g>
                        <line x1="0" y1="0" x2="30" y2="0" stroke="#9ca3af" strokeWidth="2" strokeDasharray="5,5" />
                        <text x="35" y="5" fontSize="12" fill="#374151">Buget Planificat</text>
                    </g>
                    <g transform="translate(0, 25)">
                        <line x1="0" y1="0" x2="30" y2="0" stroke="#10b981" strokeWidth="3" />
                        <text x="35" y="5" fontSize="12" fill="#374151">Venituri Cumulate</text>
                    </g>
                    <g transform="translate(0, 50)">
                        <line x1="0" y1="0" x2="30" y2="0" stroke="#ef4444" strokeWidth="3" />
                        <text x="35" y="5" fontSize="12" fill="#374151">Cheltuieli Cumulate</text>
                    </g>
                    <g transform="translate(0, 75)">
                        <line x1="0" y1="0" x2="30" y2="0" stroke="#3b82f6" strokeWidth="2" />
                        <text x="35" y="5" fontSize="12" fill="#374151">Sold Disponibil</text>
                    </g>
                </g>
            </svg>

            <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                <div className="text-center">
                    <p className="text-gray-600">Buget Planificat</p>
                    <p className="font-bold text-gray-700">
                        {points[points.length - 1].plannedBudget.toFixed(2)} {currency}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-gray-600">Venituri Cumulate</p>
                    <p className="font-bold text-green-600">
                        {points[points.length - 1].cumulativeRevenue.toFixed(2)} {currency}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-gray-600">Cheltuieli Cumulate</p>
                    <p className="font-bold text-red-600">
                        {points[points.length - 1].cumulativeExpenses.toFixed(2)} {currency}
                    </p>
                </div>
                <div className="text-center">
                    <p className="text-gray-600">Sold Disponibil</p>
                    <p className={`font-bold ${points[points.length - 1].availableBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                        {points[points.length - 1].availableBalance.toFixed(2)} {currency}
                    </p>
                </div>
            </div>
        </div>
    );
};
