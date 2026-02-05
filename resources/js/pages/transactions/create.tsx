import { formatRupiah } from '@/components/app/stats-card';
import { Button } from '@/components/ui/button';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type CarwashType, type Customer, type PaymentMethod, type Staff } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { Car, Coins, CreditCard, Info, Loader2, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import * as React from 'react';

interface TransactionsCreateProps {
    customers: Customer[];
    carwashTypes: CarwashType[];
    paymentMethods: PaymentMethod[];
    staffs: Staff[];
}

// Share percentages
const OWNER_SHARE_PERCENT = 0.6;
const STAFF_POOL_PERCENT = 0.4;

export default function TransactionsCreate({ customers, carwashTypes, paymentMethods, staffs }: TransactionsCreateProps) {
    const [selectedStaffs, setSelectedStaffs] = React.useState<number[]>([]);
    const [selectedType, setSelectedType] = React.useState<CarwashType | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        carwash_type_id: '',
        payment_method_id: '',
        license_plate: '',
        price: '',
        payment_status: 'unpaid',
        notes: '',
        staffs: [] as number[],
    });

    const price = parseInt(data.price) || 0;
    const ownerShare = Math.floor(price * OWNER_SHARE_PERCENT);
    const staffPool = Math.floor(price * STAFF_POOL_PERCENT);

    // Customer options for combobox
    const customerOptions = customers.map((customer) => ({
        value: String(customer.id),
        label: customer.name,
        description: customer.phone || undefined,
    }));

    const handleTypeChange = (value: string) => {
        setData('carwash_type_id', value);
        const type = carwashTypes.find((t) => t.id === parseInt(value));
        if (type) {
            setSelectedType(type);
            setData('price', String(type.min_price));
        }
    };

    const addStaff = () => {
        const availableStaffs = staffs.filter((s) => !selectedStaffs.includes(s.id));
        if (availableStaffs.length > 0) {
            const staff = availableStaffs[0];
            setSelectedStaffs([...selectedStaffs, staff.id]);
        }
    };

    const removeStaff = (index: number) => {
        setSelectedStaffs(selectedStaffs.filter((_, i) => i !== index));
    };

    const updateStaffId = (index: number, staffId: number) => {
        const updated = [...selectedStaffs];
        updated[index] = staffId;
        setSelectedStaffs(updated);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transactions');
    };

    React.useEffect(() => {
        setData('staffs', selectedStaffs);
    }, [selectedStaffs]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transaksi', href: '/transactions' },
                { title: 'Transaksi Baru', href: '/transactions/create' },
            ]}
        >
            <Head title="Transaksi Baru" />

            <div className=" p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">Transaksi Baru</h1>
                    <p className="text-sm text-muted-foreground">Buat transaksi cuci mobil baru</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Section Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer & Vehicle - Left Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Car className="h-5 w-5" />
                                <h2 className="font-semibold">Pelanggan & Kendaraan</h2>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Pelanggan</Label>
                                    <div className="flex gap-2">
                                        <Combobox
                                            options={customerOptions}
                                            value={data.customer_id}
                                            onValueChange={(value) => setData('customer_id', value)}
                                            placeholder="Pilih pelanggan..."
                                            searchPlaceholder="Cari pelanggan..."
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="outline" size="icon" asChild title="Tambah Pelanggan">
                                            <Link href="/customers/create?redirect=transactions">
                                                <UserPlus className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>Plat Nomor</Label>
                                    <Input
                                        value={data.license_plate}
                                        onChange={(e) => setData('license_plate', e.target.value.toUpperCase())}
                                        placeholder="B 1234 ABC"
                                        className="uppercase font-medium"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Service & Price - Right Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-emerald-600">
                                <Coins className="h-5 w-5" />
                                <h2 className="font-semibold">Layanan & Harga</h2>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Jenis Cuci <span className="text-red-500">*</span></Label>
                                    <Select value={data.carwash_type_id} onValueChange={handleTypeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih jenis" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carwashTypes.map((type) => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    {type.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.carwash_type_id && <p className="text-sm text-red-500">{errors.carwash_type_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label>Harga <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                        <Input
                                            type="number"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="0"
                                            className="pl-9 font-medium"
                                        />
                                    </div>
                                    {selectedType && (
                                        <p className="text-xs text-muted-foreground">
                                            Rentang: {formatRupiah(selectedType.min_price)} - {formatRupiah(selectedType.max_price)}
                                        </p>
                                    )}
                                    {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Share Distribution Info */}
                    {price > 0 && (
                        <div className="rounded-lg border bg-muted/30 p-4">
                            <div className="flex items-center gap-2 mb-3">
                                <Info className="h-4 w-4 text-blue-500" />
                                <span className="text-sm font-medium">Pembagian Hasil (Otomatis)</span>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-md bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground mb-1">Owner (60%)</p>
                                    <p className="text-lg font-bold text-emerald-600">{formatRupiah(ownerShare)}</p>
                                </div>
                                <div className="rounded-md bg-background p-3 border">
                                    <p className="text-xs text-muted-foreground mb-1">Pool Staff (40%)</p>
                                    <p className="text-lg font-bold text-purple-600">{formatRupiah(staffPool)}</p>
                                    <p className="text-xs text-muted-foreground mt-1">Dibagi rata mingguan</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Staff Assignment */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-600">
                                <Users className="h-5 w-5" />
                                <h2 className="font-semibold">Penugasan Staf</h2>
                            </div>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addStaff}
                                disabled={staffs.filter(s => !selectedStaffs.includes(s.id)).length === 0}
                                className="h-8"
                            >
                                <Plus className="mr-2 h-3.5 w-3.5" />
                                Tambah Staf
                            </Button>
                        </div>

                        <p className="text-sm text-muted-foreground">
                            Pilih staf yang mengerjakan transaksi ini. Pembagian pool 40% akan dihitung otomatis setiap akhir minggu.
                        </p>

                        <div className="space-y-3">
                            {selectedStaffs.map((staffId, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <Select
                                            value={String(staffId)}
                                            onValueChange={(value) => updateStaffId(index, parseInt(value))}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Pilih staf..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staffs.map((staff) => (
                                                    <SelectItem
                                                        key={staff.id}
                                                        value={String(staff.id)}
                                                        disabled={selectedStaffs.some((id, i) => id === staff.id && i !== index)}
                                                    >
                                                        {staff.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => removeStaff(index)}
                                        className="h-8 w-8 text-muted-foreground hover:text-red-500"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}

                            {selectedStaffs.length === 0 && (
                                <div className="text-center py-6 text-muted-foreground border border-dashed rounded-lg">
                                    <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">Belum ada staf yang ditugaskan</p>
                                    <p className="text-xs">Klik "Tambah Staf" untuk menugaskan</p>
                                </div>
                            )}
                        </div>
                        {errors.staffs && <p className="text-sm text-red-500">{errors.staffs}</p>}
                    </div>

                    <Separator />

                    {/* Payment & Notes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                            <CreditCard className="h-5 w-5" />
                            <h2 className="font-semibold">Pembayaran & Catatan</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Status Pembayaran</Label>
                                        <Select
                                            value={data.payment_status}
                                            onValueChange={(value) => {
                                                setData('payment_status', value);
                                                if (value !== 'paid') setData('payment_method_id', '');
                                            }}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="unpaid">Belum Bayar</SelectItem>
                                                <SelectItem value="paid">Lunas</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Metode Pembayaran</Label>
                                        <Select
                                            value={data.payment_method_id}
                                            onValueChange={(value) => setData('payment_method_id', value)}
                                            disabled={data.payment_status !== 'paid'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Metode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {paymentMethods.map((method) => (
                                                    <SelectItem key={method.id} value={String(method.id)}>
                                                        {method.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Catatan</Label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Catatan opsional..."
                                    className="min-h-[80px] resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/transactions">Batal</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || selectedStaffs.length === 0 || !data.carwash_type_id || !data.price}
                            className="min-w-[140px]"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Membuat...
                                </>
                            ) : (
                                <>Buat Transaksi</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
