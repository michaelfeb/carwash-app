import { FlashMessage } from '@/components/app/flash-message';
import { PageHeader } from '@/components/app/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { BarChart, Calendar, Car, Download, TrendingUp, Users } from 'lucide-react';
import * as React from 'react';

export default function ReportsIndex() {
    const today = new Date().toISOString().split('T')[0];
    const thisMonth = today.substring(0, 7);
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [dailyDate, setDailyDate] = React.useState(today);
    const [monthlyMonth, setMonthlyMonth] = React.useState(thisMonth);
    const [carTypeDateFrom, setCarTypeDateFrom] = React.useState(thirtyDaysAgo);
    const [carTypeDateTo, setCarTypeDateTo] = React.useState(today);
    const [staffDateFrom, setStaffDateFrom] = React.useState(thirtyDaysAgo);
    const [staffDateTo, setStaffDateTo] = React.useState(today);
    const [trendDateFrom, setTrendDateFrom] = React.useState(thirtyDaysAgo);
    const [trendDateTo, setTrendDateTo] = React.useState(today);

    const handleDownload = (url: string) => {
        window.open(url, '_blank');
    };

    return (
        <AppLayout breadcrumbs={[{ title: 'Laporan', href: '/reports' }]}>
            <Head title="Laporan" />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <PageHeader
                    title="Laporan"
                    description="Buat dan ekspor laporan bisnis"
                />

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {/* Daily Report */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5 text-primary" />
                                Laporan Transaksi Harian
                            </CardTitle>
                            <CardDescription>Daftar semua transaksi untuk hari tertentu</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="daily-date">Tanggal</Label>
                                <Input
                                    id="daily-date"
                                    type="date"
                                    value={dailyDate}
                                    onChange={(e) => setDailyDate(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => handleDownload(`/reports/daily/export?date=${dailyDate}`)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Ekspor PDF
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Monthly Report */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <BarChart className="h-5 w-5 text-primary" />
                                Ringkasan Pendapatan Bulanan
                            </CardTitle>
                            <CardDescription>Ringkasan pendapatan dikelompokkan per hari untuk satu bulan</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="monthly-month">Bulan</Label>
                                <Input
                                    id="monthly-month"
                                    type="month"
                                    value={monthlyMonth}
                                    onChange={(e) => setMonthlyMonth(e.target.value)}
                                />
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => handleDownload(`/reports/monthly/export?month=${monthlyMonth}`)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Ekspor PDF
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Car Type Report */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5 text-primary" />
                                Berdasarkan Jenis Mobil
                            </CardTitle>
                            <CardDescription>Rincian pendapatan berdasarkan jenis cuci mobil</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="cartype-from">Dari</Label>
                                    <Input
                                        id="cartype-from"
                                        type="date"
                                        value={carTypeDateFrom}
                                        onChange={(e) => setCarTypeDateFrom(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="cartype-to">Sampai</Label>
                                    <Input
                                        id="cartype-to"
                                        type="date"
                                        value={carTypeDateTo}
                                        onChange={(e) => setCarTypeDateTo(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => handleDownload(`/reports/car-type/export?date_from=${carTypeDateFrom}&date_to=${carTypeDateTo}`)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Ekspor PDF
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Staff Performance Report */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5 text-primary" />
                                Kinerja Staf
                            </CardTitle>
                            <CardDescription>Metrik kinerja untuk setiap anggota staf</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="staff-from">Dari</Label>
                                    <Input
                                        id="staff-from"
                                        type="date"
                                        value={staffDateFrom}
                                        onChange={(e) => setStaffDateFrom(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="staff-to">Sampai</Label>
                                    <Input
                                        id="staff-to"
                                        type="date"
                                        value={staffDateTo}
                                        onChange={(e) => setStaffDateTo(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => handleDownload(`/reports/staff/export?date_from=${staffDateFrom}&date_to=${staffDateTo}`)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Ekspor PDF
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Income Trend Report */}
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <TrendingUp className="h-5 w-5 text-primary" />
                                Tren Pendapatan
                            </CardTitle>
                            <CardDescription>Tren pendapatan harian selama periode tertentu</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            <div className="grid grid-cols-2 gap-2">
                                <div className="space-y-2">
                                    <Label htmlFor="trend-from">Dari</Label>
                                    <Input
                                        id="trend-from"
                                        type="date"
                                        value={trendDateFrom}
                                        onChange={(e) => setTrendDateFrom(e.target.value)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="trend-to">Sampai</Label>
                                    <Input
                                        id="trend-to"
                                        type="date"
                                        value={trendDateTo}
                                        onChange={(e) => setTrendDateTo(e.target.value)}
                                    />
                                </div>
                            </div>
                            <Button
                                className="w-full"
                                onClick={() => handleDownload(`/reports/income-trend/export?date_from=${trendDateFrom}&date_to=${trendDateTo}`)}
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Ekspor PDF
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
