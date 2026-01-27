import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface CustomersCreateProps {
    redirectTo?: string;
}

export default function CustomersCreate({ redirectTo }: CustomersCreateProps) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        phone: '',
        address: '',
        notes: '',
        redirect_to: redirectTo || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/customers');
    };

    const backLink = redirectTo === 'transactions' ? '/transactions/create' : '/customers';
    const isFromTransaction = redirectTo === 'transactions';

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Pelanggan', href: '/customers' },
                { title: 'Buat', href: '/customers/create' },
            ]}
        >
            <Head title="Buat Pelanggan" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Buat Pelanggan</h1>
                        <p className="text-muted-foreground">
                            {isFromTransaction
                                ? 'Tambahkan pelanggan baru, lalu kembali ke transaksi'
                                : 'Tambahkan pelanggan baru'}
                        </p>
                    </div>
                </div>

                {isFromTransaction && (
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-800 dark:border-blue-800 dark:bg-blue-950/50 dark:text-blue-200">
                        <p className="text-sm">
                            Anda akan diarahkan kembali ke formulir transaksi setelah membuat pelanggan ini.
                        </p>
                    </div>
                )}

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Pelanggan</CardTitle>
                        <CardDescription>Isi detail pelanggan</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Nama <span className="text-red-500">*</span></Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="Masukkan nama pelanggan"
                                    />
                                    {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone">Telepon</Label>
                                    <Input
                                        id="phone"
                                        value={data.phone}
                                        onChange={(e) => setData('phone', e.target.value)}
                                        placeholder="Masukkan nomor telepon"
                                    />
                                    {errors.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address">Alamat</Label>
                                <Textarea
                                    id="address"
                                    value={data.address}
                                    onChange={(e) => setData('address', e.target.value)}
                                    placeholder="Masukkan alamat"
                                    rows={2}
                                />
                                {errors.address && <p className="text-sm text-red-500">{errors.address}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="notes">Catatan</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Catatan tambahan"
                                    rows={2}
                                />
                                {errors.notes && <p className="text-sm text-red-500">{errors.notes}</p>}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {isFromTransaction ? 'Buat & Kembali' : 'Buat Pelanggan'}
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href={backLink}>Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
