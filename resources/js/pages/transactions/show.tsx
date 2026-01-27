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
import { ArrowLeft, Calendar, Car, CreditCard, User } from 'lucide-react';
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

    const totalStaffFees = transaction.staffs?.reduce((sum, staff) => sum + (staff.pivot?.fee || 0), 0) || 0;

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
                                <span className="text-lg font-medium">Harga</span>
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

                {/* Staff Assignments */}
                <Card>
                    <CardHeader>
                        <CardTitle>Staf Ditugaskan</CardTitle>
                        <CardDescription>Pencuci yang ditugaskan untuk transaksi ini</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Nama</TableHead>
                                    <TableHead>Telepon</TableHead>
                                    <TableHead className="text-right">Upah</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transaction.staffs?.map((staff) => (
                                    <TableRow key={staff.id}>
                                        <TableCell className="font-medium">{staff.name}</TableCell>
                                        <TableCell>{staff.phone || '-'}</TableCell>
                                        <TableCell className="text-right">{formatRupiah(staff.pivot?.fee || 0)}</TableCell>
                                    </TableRow>
                                ))}
                                <TableRow className="bg-muted/50">
                                    <TableCell colSpan={2} className="font-medium">
                                        Total Upah Staf
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{formatRupiah(totalStaffFees)}</TableCell>
                                </TableRow>
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
