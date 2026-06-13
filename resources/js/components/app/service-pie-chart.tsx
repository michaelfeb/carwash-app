import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type ServiceChartData } from '@/types';
import { Crown, PieChart as PieChartIcon } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from 'recharts';

interface ServicePieChartProps {
    data: ServiceChartData[];
}

// Warm blue-indigo family palette — top colors are more saturated
const COLORS = [
    '#1d4ed8', // blue-700   → #1 most popular
    '#2563eb', // blue-600   → #2
    '#3b82f6', // blue-500   → #3
    '#6366f1', // indigo-500
    '#818cf8', // indigo-400
    '#93c5fd', // blue-300
    '#a5b4fc', // indigo-300
    '#bfdbfe', // blue-200
];

// Medal-style ranking badges for top 3
const RANK_BADGES: Record<number, string> = {
    0: '1',
    1: '2',
    2: '3',
};

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: ServiceChartData & { percent: number } }>;
}

function CustomTooltip({ active, payload }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    const item = payload[0];
    const pct = (item.payload.percent * 100).toFixed(1);
    return (
        <div className="rounded-xl border border-blue-100 bg-white/95 p-3 shadow-lg backdrop-blur-sm">
            <p className="mb-1 text-xs font-semibold text-blue-600">{item.name}</p>
            <p className="text-sm font-bold text-slate-800">{item.value} transaksi</p>
            <p className="text-xs text-slate-500">{pct}% dari total</p>
        </div>
    );
}

// Active (exploded) slice shape rendered by Recharts
interface ActiveShapeProps {
    cx: number;
    cy: number;
    innerRadius: number;
    outerRadius: number;
    startAngle: number;
    endAngle: number;
    fill: string;
}

function ActiveShape(props: ActiveShapeProps) {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;
    return (
        <Sector
            cx={cx}
            cy={cy}
            innerRadius={innerRadius}
            outerRadius={outerRadius + 10}
            startAngle={startAngle}
            endAngle={endAngle}
            fill={fill}
            opacity={1}
        />
    );
}

export function ServicePieChart({ data }: ServicePieChartProps) {
    const total = useMemo(() => data.reduce((sum, d) => sum + d.total, 0), [data]);
    const [activeIndex, setActiveIndex] = useState<number | null>(null);

    const handlePieClick = useCallback((_: unknown, index: number) => {
        setActiveIndex((prev) => (prev === index ? null : index));
    }, []);

    const handlePieMouseEnter = useCallback((_: unknown, index: number) => {
        if (activeIndex === null) setActiveIndex(index);
    }, [activeIndex]);

    const handlePieMouseLeave = useCallback(() => {
        // Only clear hover if it was set by hover (not by click)
        // We track this via the click handler above — no-op here to keep click active
    }, []);

    const activeItem = activeIndex !== null ? data[activeIndex] : null;
    const activePercent = activeItem ? ((activeItem.total / total) * 100).toFixed(1) : null;

    return (
        <Card className="flex h-full flex-col border-0 shadow-md">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100">
                        <PieChartIcon className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold text-slate-800">Jenis Layanan</CardTitle>
                        <CardDescription className="text-xs">Distribusi preferensi pelanggan</CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 pb-4">
                {data.length === 0 ? (
                    <div className="flex h-48 flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <PieChartIcon className="h-10 w-10 text-slate-300" />
                        <p>Belum ada data transaksi</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="relative">
                            <ResponsiveContainer width={210} height={210}>
                                <PieChart>
                                    <Pie
                                        data={data}
                                        dataKey="total"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={54}
                                        outerRadius={88}
                                        paddingAngle={2}
                                        strokeWidth={0}
                                        onClick={handlePieClick}
                                        onMouseEnter={handlePieMouseEnter}
                                        onMouseLeave={handlePieMouseLeave}
                                        style={{ cursor: 'pointer', outline: 'none' }}
                                        activeIndex={activeIndex ?? undefined}
                                        activeShape={(props: unknown) => <ActiveShape {...(props as ActiveShapeProps)} />}
                                    >
                                        {data.map((_, index) => (
                                            <Cell
                                                key={`cell-${index}`}
                                                fill={COLORS[index % COLORS.length]}
                                                opacity={activeIndex !== null && activeIndex !== index ? 0.35 : 1}
                                                style={{ transition: 'opacity 0.2s ease' }}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip />} />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Center label — switches between total and selected slice */}
                            <div
                                className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center"
                                style={{ transition: 'all 0.2s ease' }}
                            >
                                {activeItem ? (
                                    <>
                                        <span className="max-w-[80px] text-center text-[11px] font-semibold leading-tight text-blue-600 line-clamp-2">
                                            {activeItem.name}
                                        </span>
                                        <span className="mt-0.5 text-xl font-bold text-slate-800">{activeItem.total}</span>
                                        <span className="text-[10px] text-slate-500">{activePercent}%</span>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-2xl font-bold text-slate-800">{total}</span>
                                        <span className="text-xs text-slate-500">transaksi</span>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Most Popular Callout */}
                        {data.length > 0 && (
                            <div className="mt-3 flex w-full items-center gap-2 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 px-3 py-2.5">
                                <Crown className="h-4 w-4 shrink-0 text-amber-500" />
                                <div className="min-w-0">
                                    <p className="text-[10px] font-medium uppercase tracking-wide text-amber-600">Paling Laris</p>
                                    <p className="truncate text-xs font-bold text-amber-800">{data[0].name}</p>
                                </div>
                                <div className="ml-auto shrink-0 text-right">
                                    <p className="text-xs font-bold text-amber-700">{data[0].total}</p>
                                    <p className="text-[10px] text-amber-500">
                                        {total > 0 ? ((data[0].total / total) * 100).toFixed(1) : '0'}%
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Legend */}
                        <ul className="mt-2 w-full space-y-1">
                            {data.map((item, index) => {
                                const pct = total > 0 ? ((item.total / total) * 100).toFixed(1) : '0';
                                const isActive = activeIndex === index;
                                const badge = RANK_BADGES[index];
                                return (
                                    <li
                                        key={index}
                                        className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs transition-colors hover:bg-blue-50"
                                        style={{ opacity: activeIndex !== null && !isActive ? 0.5 : 1, transition: 'opacity 0.2s ease' }}
                                        onClick={() => setActiveIndex((prev) => (prev === index ? null : index))}
                                    >
                                        <div className="flex min-w-0 items-center gap-2">
                                            {/* Rank badge for top 3 */}
                                            {badge !== undefined ? (
                                                <span className="shrink-0 text-sm leading-none">{badge}</span>
                                            ) : (
                                                <span className="inline-block w-4 shrink-0 text-center text-[10px] font-medium text-slate-400">
                                                    {index + 1}
                                                </span>
                                            )}
                                            <span
                                                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                                                style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                            />
                                            <span className="truncate text-slate-600">{item.name}</span>
                                        </div>
                                        <div className="flex shrink-0 items-center gap-2">
                                            <span className="font-semibold text-slate-800">{item.total}</span>
                                            <span className="rounded-full bg-blue-100 px-1.5 py-0.5 text-[10px] font-medium text-blue-600">
                                                {pct}%
                                            </span>
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>

                        <p className="mt-2 text-center text-[10px] text-slate-400">Klik irisan untuk melihat detail</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

interface ServicePieChartProps {
    data: ServiceChartData[];
}

interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ name: string; value: number; payload: ServiceChartData & { percent: number } }>;
}


interface CustomLegendProps {
    payload?: Array<{ value: string; color: string; payload: ServiceChartData }>;
}

function CustomLegend({ payload }: CustomLegendProps) {
    if (!payload) return null;
    return (
        <ul className="mt-2 flex flex-col gap-1.5">
            {payload.map((entry, index) => (
                <li key={index} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2 min-w-0">
                        <span
                            className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                            style={{ backgroundColor: entry.color }}
                        />
                        <span className="truncate text-muted-foreground">{entry.value}</span>
                    </div>
                    <span className="shrink-0 font-medium text-foreground">
                        {entry.payload.total}
                    </span>
                </li>
            ))}
        </ul>
    );
}
