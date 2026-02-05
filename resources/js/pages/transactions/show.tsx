import { FlashMessage } from '@/components/app/flash-message';
import { formatRupiah } from '@/components/app/stats-card';
import { PaymentStatusBadge, WashStatusBadge } from '@/components/app/status-badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import AppLayout from '@/layouts/app-layout';
import { type PaymentMethod, type Transaction } from '@/types';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, Calendar, Car, PieChart, User, Users } from 'lucide-react';
import * as React from 'react';

interface TransactionsShowProps {
    transaction: Transaction;
}

export default function TransactionsShow({ transaction }: TransactionsShowProps) {
    const { paymentMethods } = usePage<{ paymentMethods?: PaymentMethod[] }>().props;
    const [washStatus, setWashStatus] = React.useState(transaction.wash_status);
    const [paymentStatus, setPaymentStatus] = React.useState(transaction.payment_status);
    const [paymentMethodId, setPaymentMethodId] = React.useState(String(transaction.payment_method_id || ''));

    const handleStatusUpdate = () => {
        router.put(`/transactions/${transaction.id}/status`, {
            wash_status: washStatus,
            payment_status: paymentStatus,
            payment_method_id: paymentMethodId || undefined,
        });
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transaksi', href: '/transactions' },
                { title: transaction.invoice_number, href: `/transactions/${transaction.id}` },
            ]}
        >
            <Head title={`Transaksi ${transaction.invoice_number}`} />

            <div className="space-y-6 p-4 md:p-6">
                <FlashMessage />

                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold tracking-tight">{transaction.invoice_number}</h1>
                        <p className="text-muted-foreground">Detail transaksi</p>
                    </div>
                    <div className="flex gap-2">
                        <WashStatusBadge status={transaction.wash_status} />
                        <PaymentStatusBadge status={transaction.payment_status} />
                    </div>
                </div>

                <div className="grid gap-6 lg:grid-cols-2">
                    {/* Transaction Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Car className="h-5 w-5" />
                                Info Transaksi
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-muted-foreground">Nomor Faktur</p>
                                    <p className="font-medium">{transaction.invoice_number}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Dibuat Pada</p>
                                    <p className="font-medium">{new Date(transaction.created_at).toLocaleString('id-ID')}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Jenis Cuci</p>
                                    <p className="font-medium">{transaction.carwash_type?.name}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Plat Nomor</p>
                                    <p className="font-medium">{transaction.license_plate || '-'}</p>
                                </div>
                            </div>
                            <Separator />
                            <div className="flex items-center justify-between">
                                <span className="text-lg font-medium">Harga Total</span>
                                <span className="text-2xl font-bold text-primary">{formatRupiah(transaction.price)}</span>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Customer Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Info Pelanggan
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {transaction.customer ? (
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <p className="text-muted-foreground">Nama</p>
                                        <p className="font-medium">{transaction.customer.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-muted-foreground">Telepon</p>
                                        <p className="font-medium">{transaction.customer.phone || '-'}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-muted-foreground">Alamat</p>
                                        <p className="font-medium">{transaction.customer.address || '-'}</p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-muted-foreground">Tidak ada informasi pelanggan</p>
                            )}
                            <Separator />
                            <div className="text-sm">
                                <p className="text-muted-foreground">Kasir</p>
                                <p className="font-medium">{transaction.user?.name}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Share Distribution */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <PieChart className="h-5 w-5" />
                            Pembagian Hasil
                        </CardTitle>
                        <CardDescription>Pembagian otomatis 60% Owner - 40% Pool Staff</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <div className="rounded-lg border p-4 bg-muted/30">
                                <p className="text-sm text-muted-foreground mb-1">Harga Transaksi</p>
                                <p className="text-xl font-bold">{formatRupiah(transaction.price)}</p>
                            </div>
                            <div className="rounded-lg border p-4 bg-emerald-50 dark:bg-emerald-950/30">
                                <p className="text-sm text-emerald-600 dark:text-emerald-400 mb-1">Bagian Owner (60%)</p>
                                <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                                    {formatRupiah(transaction.owner_share || 0)}
                                </p>
                            </div>
                            <div className="rounded-lg border p-4 bg-purple-50 dark:bg-purple-950/30">
                                <p className="text-sm text-purple-600 dark:text-purple-400 mb-1">Pool Staff (40%)</p>
                                <p className="text-xl font-bold text-purple-700 dark:text-purple-300">
                                    {formatRupiah(transaction.staff_pool || 0)}
                                </p>
                                <p className="text-xs text-muted-foreground mt-1">Dibagi rata mingguan</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Staff Assignments */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            Staf Ditugaskan
                        </CardTitle>
                        <CardDescription>
                            Staf yang mengerjakan transaksi ini akan mendapat bagian dari pool 40% di akhir minggu
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>No</TableHead>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Telepon</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transaction.staffs?.map((staff, index) => (
                                    <TableRow key={staff.id}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>{staff.phone || '-'}</TableCell>
                                    </TableRow>
                                ))}
                                {(!transaction.staffs || transaction.staffs.length === 0) && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="text-center text-muted-foreground">
                                            Tidak ada staf yang ditugaskan
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Update Status */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="h-5 w-5" />
                            Perbarui Status
                        </CardTitle>
                        <CardDescription>Ubah status cuci atau pembayaran</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status Cuci</label>
                                <Select value={washStatus} onValueChange={(v: 'waiting' | 'washing' | 'done') => setWashStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="waiting">Menunggu</SelectItem>
                                        <SelectItem value="washing">Dicuci</SelectItem>
                                        <SelectItem value="done">Selesai</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status Pembayaran</label>
                                <Select value={paymentStatus} onValueChange={(v: 'unpaid' | 'paid') => setPaymentStatus(v)}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="unpaid">Belum Bayar</SelectItem>
                                        <SelectItem value="paid">Lunas</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {paymentStatus === 'paid' && (
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Metode Pembayaran</label>
                                    <Select value={paymentMethodId} onValueChange={setPaymentMethodId}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih metode" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {paymentMethods?.map((method) => (
                                                <SelectItem key={method.id} value={String(method.id)}>
                                                    {method.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}
                        </div>
                        <Button onClick={handleStatusUpdate}>Perbarui Status</Button>
                    </CardContent>
                </Card>

                {/* Notes */}
                {transaction.notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Catatan</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap">{transaction.notes}</p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
