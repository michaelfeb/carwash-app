import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { type RevenueChartData } from '@/types';
import { TrendingUp } from 'lucide-react';
import { useMemo, useState } from 'react';
import {
    Area,
    AreaChart,
    CartesianGrid,
    Line,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

// Warm blue-indigo palette
const CHART_STROKE = '#2563eb';   // blue-600
const CHART_GRADIENT_TOP = '#4f46e5'; // indigo-600
const CHART_GRADIENT_MID = '#2563eb'; // blue-600
const TRENDLINE_COLOR = '#f97316'; // orange-500 for trendline contrast

type ViewMode = 'daily' | 'monthly';

interface RevenueAreaChartProps {
    data: RevenueChartData[];
}

// ── Linear Regression ──────────────────────────────────────────────
interface TrendPoint {
    date: string;
    trend: number;
}

function computeTrendline(data: RevenueChartData[]): TrendPoint[] {
    if (data.length < 2) return [];
    const n = data.length;
    const xs = data.map((_, i) => i); // 0, 1, 2, ..., n-1
    const ys = data.map((d) => d.revenue);

    const sumX = xs.reduce((a, b) => a + b, 0);
    const sumY = ys.reduce((a, b) => a + b, 0);
    const sumXY = xs.reduce((sum, x, i) => sum + x * ys[i], 0);
    const sumX2 = xs.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map((d, i) => ({
        date: d.date,
        trend: Math.round(Math.max(0, slope * i + intercept)), // clamp to >= 0
    }));
}

// ── Monthly Aggregation ───────────────────────────────────────────
interface MonthlyPoint {
    date: string;
    revenue: number;
    count: number;
}

function aggregateMonthly(data: RevenueChartData[]): MonthlyPoint[] {
    const map = new Map<string, { revenue: number; count: number }>();
    for (const d of data) {
        const monthKey = d.date.substring(0, 7); // "2026-05"
        const existing = map.get(monthKey) || { revenue: 0, count: 0 };
        existing.revenue += d.revenue;
        existing.count += d.count;
        map.set(monthKey, existing);
    }
    return Array.from(map.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, val]) => ({ date, ...val }));
}

// ── Formatters ────────────────────────────────────────────────────
function formatRupiahShort(value: number): string {
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
    return `${value}`;
}

function formatRupiahFull(value: number): string {
    return 'Rp ' + new Intl.NumberFormat('id-ID').format(value);
}

function formatDateLabel(dateStr: string, mode: ViewMode): string {
    const [year, month, day] = dateStr.split('-');
    if (mode === 'monthly') {
        // "2026-05" → "Mei 2026"
        const date = new Date(Number(year), Number(month) - 1, 1);
        return date.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' });
    }
    const date = new Date(dateStr + 'T00:00:00');
    return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

// ── Trendline Tooltip ─────────────────────────────────────────────
interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number; payload: RevenueChartData & { trend?: number } }>;
    label?: string;
    viewMode: ViewMode;
}

function CustomTooltip({ active, payload, label, viewMode }: CustomTooltipProps) {
    if (!active || !payload || payload.length === 0) return null;
    const data = payload[0].payload;
    const revenueValue = data.revenue !== undefined ? data.revenue : data.trend ?? 0;

    // Determine if this tooltip is for the trendline
    const isTrend = payload.length === 1 && payload[0].dataKey === 'trend';

    return (
        <div className="rounded-xl border border-blue-100 bg-white/95 p-3.5 shadow-lg backdrop-blur-sm">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-blue-500">
                {label ? formatDateLabel(label, viewMode) : ''}
            </p>
            {isTrend ? (
                <>
                    <p className="text-sm font-bold text-orange-600">{formatRupiahFull(revenueValue)}</p>
                    <p className="mt-0.5 text-xs text-orange-400">Estimasi tren</p>
                </>
            ) : (
                <>
                    <p className="text-sm font-bold text-slate-800">{formatRupiahFull(data.revenue)}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{data.count} transaksi</p>
                </>
            )}
        </div>
    );
}

// ── Main Component ────────────────────────────────────────────────
export function RevenueAreaChart({ data }: RevenueAreaChartProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('daily');

    // Compute display data based on view mode
    const displayData = useMemo(() => {
        if (viewMode === 'monthly') return aggregateMonthly(data);
        return data;
    }, [data, viewMode]);

    // Trendline computed from display data
    const trendlineData = useMemo(() => computeTrendline(displayData), [displayData]);

    const totalRevenue = useMemo(
        () => displayData.reduce((sum, d) => sum + d.revenue, 0),
        [displayData],
    );
    const totalTransactions = useMemo(
        () => displayData.reduce((sum, d) => sum + d.count, 0),
        [displayData],
    );

    // Trend direction label
    const trendDirection = useMemo(() => {
        if (trendlineData.length < 2) return null;
        const first = trendlineData[0].trend;
        const last = trendlineData[trendlineData.length - 1].trend;
        if (last > first * 1.05) return { label: 'Naik', color: 'text-emerald-600', bg: 'bg-emerald-50' };
        if (last < first * 0.95) return { label: 'Turun', color: 'text-red-500', bg: 'bg-red-50' };
        return { label: 'Stabil', color: 'text-amber-600', bg: 'bg-amber-50' };
    }, [trendlineData]);

    return (
        <Card className="flex h-full flex-col border-0 shadow-md">
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                            <TrendingUp className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                            <CardTitle className="text-base font-semibold text-slate-800">Tren Pendapatan</CardTitle>
                            <CardDescription className="text-xs">
                                {viewMode === 'daily' ? '30 hari terakhir' : 'Ringkasan bulanan'}
                            </CardDescription>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* View Mode Toggle */}
                        <div className="flex overflow-hidden rounded-lg border border-slate-200 bg-slate-50 p-0.5">
                            <button
                                type="button"
                                onClick={() => setViewMode('daily')}
                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                    viewMode === 'daily'
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Harian
                            </button>
                            <button
                                type="button"
                                onClick={() => setViewMode('monthly')}
                                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-all ${
                                    viewMode === 'monthly'
                                        ? 'bg-white text-blue-700 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                Bulanan
                            </button>
                        </div>
                    </div>
                </div>
                {/* Summary stats row */}
                <div className="mt-3 flex flex-wrap items-center gap-3">
                    <div className="rounded-xl bg-blue-50 px-3 py-2 text-right">
                        <p className="text-xs text-blue-500">Total Pendapatan</p>
                        <p className="text-sm font-bold text-blue-700">{formatRupiahFull(totalRevenue)}</p>
                    </div>
                    <div className="rounded-xl bg-indigo-50 px-3 py-2 text-right">
                        <p className="text-xs text-indigo-500">Transaksi</p>
                        <p className="text-sm font-bold text-indigo-700">{totalTransactions}</p>
                    </div>
                    {trendDirection && (
                        <div className={`rounded-xl ${trendDirection.bg} px-3 py-2 text-right`}>
                            <p className="text-xs text-slate-500">Arah Tren</p>
                            <p className={`text-sm font-bold ${trendDirection.color}`}>
                                <TrendingUp className={`mr-0.5 inline-block h-3.5 w-3.5`} />
                                {trendDirection.label}
                            </p>
                        </div>
                    )}
                </div>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col pb-4">
                {displayData.length === 0 ? (
                    <div className="flex h-48 items-center justify-center text-sm text-muted-foreground">
                        Belum ada data pendapatan
                    </div>
                ) : (
                    <div className="min-h-[280px] flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={displayData} margin={{ top: 8, right: 4, left: -8, bottom: 0 }}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="0%" stopColor={CHART_GRADIENT_TOP} stopOpacity={0.35} />
                                        <stop offset="50%" stopColor={CHART_GRADIENT_MID} stopOpacity={0.15} />
                                        <stop offset="100%" stopColor={CHART_GRADIENT_MID} stopOpacity={0.02} />
                                    </linearGradient>
                                    <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                                        <stop offset="0%" stopColor={CHART_GRADIENT_TOP} />
                                        <stop offset="100%" stopColor={CHART_STROKE} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="date"
                                    tickFormatter={(d: string) => formatDateLabel(d, viewMode)}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    tickLine={false}
                                    axisLine={false}
                                    interval="preserveStartEnd"
                                />
                                <YAxis
                                    tickFormatter={formatRupiahShort}
                                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    content={<CustomTooltip viewMode={viewMode} />}
                                    cursor={{ stroke: CHART_STROKE, strokeWidth: 1.5, strokeDasharray: '4 3' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="url(#strokeGradient)"
                                    strokeWidth={2.5}
                                    fill="url(#revenueGradient)"
                                    dot={false}
                                    activeDot={{
                                        r: 6,
                                        fill: CHART_STROKE,
                                        stroke: '#ffffff',
                                        strokeWidth: 2,
                                    }}
                                />
                                {/* Linear Regression Trendline */}
                                {trendlineData.length >= 2 && (
                                    <Line
                                        type="linear"
                                        data={trendlineData}
                                        dataKey="trend"
                                        stroke={TRENDLINE_COLOR}
                                        strokeWidth={2}
                                        strokeDasharray="6 3"
                                        dot={false}
                                        activeDot={{
                                            r: 5,
                                            fill: TRENDLINE_COLOR,
                                            stroke: '#ffffff',
                                            strokeWidth: 2,
                                        }}
                                        name="Tren"
                                        legendType="none"
                                    />
                                )}
                            </AreaChart>
                        </ResponsiveContainer>
                        {/* Trendline Legend */}
                        {trendlineData.length >= 2 && (
                            <div className="mt-1 flex items-center justify-center gap-3 text-[11px] text-slate-400">
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-0.5 w-4 rounded" style={{ background: `url(#strokeGradient)` }} />
                                    Aktual
                                </span>
                                <span className="flex items-center gap-1">
                                    <span className="inline-block h-0.5 w-4 rounded border-0" style={{ borderTop: `2px dashed ${TRENDLINE_COLOR}` }} />
                                    Tren (regresi linear)
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
