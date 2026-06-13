import { formatRupiah } from '@/components/app/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Combobox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type CarwashType, type Customer, type PaymentMethod, type Staff } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Banknote,
    Car,
    ClipboardList,
    Coins,
    CreditCard,
    Info,
    Loader2,
    Plus,
    ReceiptText,
    Sparkles,
    Trash2,
    UserPlus,
    Users,
    Wallet,
} from 'lucide-react';
import * as React from 'react';

interface TransactionsCreateProps {
    customers: Customer[];
    carwashTypes: CarwashType[];
    paymentMethods: PaymentMethod[];
    staffs: Staff[];
    loyaltyConfig: {
        stamp_threshold: number;
        discount_percent: number;
    };
}

// Share percentages
const OWNER_SHARE_PERCENT = 0.6;
const STAFF_POOL_PERCENT = 0.4;

export default function TransactionsCreate({ customers, carwashTypes, paymentMethods, staffs, loyaltyConfig }: TransactionsCreateProps) {
    const [selectedStaffs, setSelectedStaffs] = React.useState<number[]>([]);
    const [selectedType, setSelectedType] = React.useState<CarwashType | null>(null);
    const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null);

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

    // Loyalty discount calculation
    const loyaltyEligible = selectedCustomer?.loyalty_progress?.next_visit_discount ?? false;
    const loyaltyDiscountPercent = loyaltyConfig.discount_percent;
    const originalPrice = loyaltyEligible ? price : null;
    const discountedPrice = loyaltyEligible ? Math.floor(price * (1 - loyaltyDiscountPercent / 100)) : price;
    const discountAmount = loyaltyEligible ? price - discountedPrice : 0;
    const finalPrice = loyaltyEligible ? discountedPrice : price;
    const ownerShare = Math.floor(finalPrice * OWNER_SHARE_PERCENT);
    const staffPool = Math.floor(finalPrice * STAFF_POOL_PERCENT);

    // Customer options for combobox
    const customerOptions = customers.map((customer) => ({
        value: String(customer.id),
        label: customer.name,
        description: customer.phone || undefined,
    }));

    const handleCustomerChange = (value: string) => {
        setData('customer_id', value);
        const customer = value ? customers.find((c) => c.id === parseInt(value)) : null;
        setSelectedCustomer(customer ?? null);
    };

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

    const canSubmit = selectedStaffs.length > 0 && !!data.carwash_type_id && !!data.price && !processing;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transaksi', href: '/transactions' },
                { title: 'Transaksi Baru', href: '/transactions/create' },
            ]}
        >
            <Head title="Transaksi Baru" />

            <div className="p-4 md:p-6">
                {/* ── Page Header ── */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <Link
                                href="/transactions"
                                className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Link>
                            <h1 className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600 bg-clip-text text-2xl font-bold tracking-tight text-transparent">
                                Transaksi Baru
                            </h1>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">Buat transaksi cuci mobil baru dengan cepat dan mudah</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-5">
                        {/* ── Left Column: Form Sections ── */}
                        <div className="space-y-5 lg:col-span-3">
                            {/* Customer & Vehicle */}
                            <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-blue-50 to-indigo-50 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-100">
                                            <Car className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-semibold text-slate-800">Pelanggan & Kendaraan</CardTitle>
                                            <p className="text-xs text-muted-foreground">Data pelanggan dan informasi kendaraan</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 px-5 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">Pelanggan</Label>
                                        <div className="flex gap-2">
                                            <Combobox
                                                options={customerOptions}
                                                value={data.customer_id}
                                                onValueChange={handleCustomerChange}
                                                placeholder="Pilih pelanggan..."
                                                searchPlaceholder="Cari pelanggan..."
                                                className="flex-1"
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="icon"
                                                asChild
                                                className="shrink-0 border-dashed hover:border-blue-400 hover:text-blue-600"
                                                title="Tambah Pelanggan Baru"
                                            >
                                                <Link href="/customers/create?redirect=transactions">
                                                    <UserPlus className="h-4 w-4" />
                                                </Link>
                                            </Button>
                                        </div>
                                        {/* Loyalty Info Banner */}
                                        {selectedCustomer && (
                                            <div
                                                className={`mt-2 rounded-lg border px-3 py-2.5 ${
                                                    loyaltyEligible
                                                        ? 'border-emerald-200 bg-emerald-50'
                                                        : 'border-amber-200 bg-amber-50'
                                                }`}
                                            >
                                                <div className="flex items-center gap-2">
                                                    <Sparkles
                                                        className={`h-4 w-4 ${
                                                            loyaltyEligible ? 'text-emerald-600' : 'text-amber-600'
                                                        }`}
                                                    />
                                                    <div className="flex-1">
                                                        {loyaltyEligible ? (
                                                            <p className="text-sm font-medium text-emerald-700">
                                                                🎉 Kunjungan ini mendapat diskon {loyaltyConfig.discount_percent}%!
                                                            </p>
                                                        ) : (
                                                            <p className="text-sm font-medium text-amber-700">
                                                                Stempel:{' '}
                                                                {selectedCustomer.loyalty_progress?.current ?? 0}/
                                                                {loyaltyConfig.stamp_threshold} —{' '}
                                                                {loyaltyConfig.stamp_threshold -
                                                                    (selectedCustomer.loyalty_progress?.current ?? 0)}{' '}
                                                                kunjungan lagi untuk diskon {loyaltyConfig.discount_percent}%
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                                {/* Stamp Progress Dots */}
                                                <div className="mt-2 flex gap-1.5">
                                                    {Array.from({ length: loyaltyConfig.stamp_threshold }).map((_, i) => (
                                                        <div
                                                            key={i}
                                                            className={`h-3 w-3 rounded-full transition-colors ${
                                                                i < (selectedCustomer.loyalty_progress?.current ?? 0)
                                                                    ? 'bg-amber-500'
                                                                    : 'bg-gray-200'
                                                            }`}
                                                        />
                                                    ))}
                                                    <div
                                                        className={`h-3 w-3 rounded-full ${
                                                            loyaltyEligible ? 'bg-emerald-500' : 'bg-gray-200'
                                                        }`}
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">Plat Nomor</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 rounded-md bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-blue-600">
                                                ID
                                            </span>
                                            <Input
                                                value={data.license_plate}
                                                onChange={(e) => setData('license_plate', e.target.value.toUpperCase())}
                                                placeholder="B 1234 ABC"
                                                className="pl-12 font-mono text-sm font-semibold uppercase tracking-wider"
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Service & Price */}
                            <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-teal-50 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100">
                                            <Sparkles className="h-5 w-5 text-emerald-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-semibold text-slate-800">Layanan & Harga</CardTitle>
                                            <p className="text-xs text-muted-foreground">Pilih jenis cuci dan tentukan harga</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 px-5 py-4">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">
                                            Jenis Cuci <span className="text-red-400">*</span>
                                        </Label>
                                        <Select value={data.carwash_type_id} onValueChange={handleTypeChange}>
                                            <SelectTrigger className="h-10">
                                                <SelectValue placeholder="Pilih jenis layanan cuci..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {carwashTypes.map((type) => (
                                                    <SelectItem key={type.id} value={String(type.id)}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{type.name}</span>
                                                            <span className="text-xs text-muted-foreground">
                                                                {formatRupiah(type.min_price)} – {formatRupiah(type.max_price)}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.carwash_type_id && (
                                            <p className="text-xs text-red-500">{errors.carwash_type_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">
                                            Harga <span className="text-red-400">*</span>
                                        </Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400">
                                                Rp
                                            </span>
                                            <Input
                                                type="number"
                                                value={data.price}
                                                onChange={(e) => setData('price', e.target.value)}
                                                placeholder="0"
                                                className="pl-10 text-lg font-bold"
                                            />
                                        </div>
                                        {selectedType && (
                                            <p className="flex items-center gap-1 text-xs text-muted-foreground">
                                                <Info className="h-3 w-3" />
                                                Rentang harga: {formatRupiah(selectedType.min_price)} –{' '}
                                                {formatRupiah(selectedType.max_price)}
                                            </p>
                                        )}
                                        {errors.price && <p className="text-xs text-red-500">{errors.price}</p>}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Staff Assignment */}
                            <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-purple-50 to-violet-50 px-5 py-4">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-100">
                                                <Users className="h-5 w-5 text-purple-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-slate-800">Penugasan Staf</CardTitle>
                                                <p className="text-xs text-muted-foreground">Staf yang mengerjakan transaksi ini</p>
                                            </div>
                                        </div>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={addStaff}
                                            disabled={staffs.filter((s) => !selectedStaffs.includes(s.id)).length === 0}
                                            className="h-8 gap-1.5 border-dashed text-xs hover:border-purple-400 hover:text-purple-600"
                                        >
                                            <Plus className="h-3.5 w-3.5" />
                                            Tambah
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="px-5 py-4">
                                    {selectedStaffs.length > 0 ? (
                                        <div className="space-y-2.5">
                                            {selectedStaffs.map((staffId, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 transition-colors hover:border-purple-200 hover:bg-purple-50/30"
                                                >
                                                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-purple-100 text-xs font-bold text-purple-600">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1">
                                                        <Select
                                                            value={String(staffId)}
                                                            onValueChange={(value) => updateStaffId(index, parseInt(value))}
                                                        >
                                                            <SelectTrigger className="h-9 border-0 bg-transparent shadow-none hover:bg-white">
                                                                <SelectValue placeholder="Pilih staf..." />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {staffs.map((staff) => (
                                                                    <SelectItem
                                                                        key={staff.id}
                                                                        value={String(staff.id)}
                                                                        disabled={selectedStaffs.some(
                                                                            (id, i) => id === staff.id && i !== index,
                                                                        )}
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
                                                        className="h-7 w-7 rounded-lg text-slate-400 hover:bg-red-50 hover:text-red-500"
                                                    >
                                                        <Trash2 className="h-3.5 w-3.5" />
                                                    </Button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-200 py-9">
                                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-50">
                                                <Users className="h-6 w-6 text-purple-300" />
                                            </div>
                                            <p className="mt-3 text-sm font-medium text-slate-500">Belum ada staf ditugaskan</p>
                                            <p className="mt-0.5 text-xs text-slate-400">
                                                Klik &ldquo;Tambah&rdquo; untuk menugaskan staf pencuci
                                            </p>
                                        </div>
                                    )}
                                    {errors.staffs && <p className="mt-2 text-xs text-red-500">{errors.staffs}</p>}
                                </CardContent>
                            </Card>

                            {/* Payment & Notes */}
                            <Card className="overflow-hidden border-0 shadow-md transition-shadow hover:shadow-lg">
                                <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50 px-5 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100">
                                            <CreditCard className="h-5 w-5 text-amber-600" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-sm font-semibold text-slate-800">Pembayaran & Catatan</CardTitle>
                                            <p className="text-xs text-muted-foreground">Status pembayaran dan catatan tambahan</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4 px-5 py-4">
                                    <div className="grid gap-4 sm:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-slate-600">Status Pembayaran</Label>
                                            <Select
                                                value={data.payment_status}
                                                onValueChange={(value) => {
                                                    setData('payment_status', value);
                                                    if (value !== 'paid') setData('payment_method_id', '');
                                                }}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="unpaid">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                                                            Belum Bayar
                                                        </div>
                                                    </SelectItem>
                                                    <SelectItem value="paid">
                                                        <div className="flex items-center gap-2">
                                                            <div className="h-2 w-2 rounded-full bg-emerald-400" />
                                                            Lunas
                                                        </div>
                                                    </SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-slate-600">Metode Pembayaran</Label>
                                            <Select
                                                value={data.payment_method_id}
                                                onValueChange={(value) => setData('payment_method_id', value)}
                                                disabled={data.payment_status !== 'paid'}
                                            >
                                                <SelectTrigger className="h-10">
                                                    <SelectValue placeholder="Pilih metode" />
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

                                    <div className="space-y-2">
                                        <Label className="text-xs font-medium text-slate-600">Catatan</Label>
                                        <Textarea
                                            value={data.notes}
                                            onChange={(e) => setData('notes', e.target.value)}
                                            placeholder="Catatan opsional (nomor antrian, permintaan khusus, dll)..."
                                            className="min-h-[80px] resize-none"
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ── Right Column: Order Summary ── */}
                        <div className="lg:col-span-2">
                            <div className="sticky top-6 space-y-5">
                                {/* Price Summary Card */}
                                <Card className="overflow-hidden border-0 shadow-md">
                                    <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-slate-100 px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-200">
                                                <ReceiptText className="h-5 w-5 text-slate-600" />
                                            </div>
                                            <div>
                                                <CardTitle className="text-sm font-semibold text-slate-800">Ringkasan Pesanan</CardTitle>
                                                <p className="text-xs text-muted-foreground">Rincian biaya otomatis</p>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="px-5 py-4">
                                        {price > 0 ? (
                                            <div className="space-y-4">
                                                {/* Original Price Row (shown when discount applies) */}
                                                {loyaltyEligible && (
                                                    <div className="flex items-center justify-between rounded-xl bg-amber-50/70 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="h-4 w-4 text-amber-500" />
                                                            <span className="text-sm text-slate-600">Harga Asli</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-slate-400 line-through">{formatRupiah(price)}</span>
                                                    </div>
                                                )}

                                                {loyaltyEligible && (
                                                    <div className="flex items-center justify-between rounded-xl bg-emerald-50/70 px-4 py-3">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="h-4 w-4 text-emerald-500" />
                                                            <span className="text-sm font-medium text-emerald-700">Diskon Loyalty {loyaltyConfig.discount_percent}%</span>
                                                        </div>
                                                        <span className="text-lg font-bold text-emerald-600">-{formatRupiah(discountAmount)}</span>
                                                    </div>
                                                )}

                                                {/* Price Row */}
                                                <div className="flex items-center justify-between rounded-xl bg-blue-50/70 px-4 py-3">
                                                    <div className="flex items-center gap-2">
                                                        <Banknote className="h-4 w-4 text-blue-500" />
                                                        <span className="text-sm text-slate-600">
                                                            {loyaltyEligible ? 'Harga Setelah Diskon' : 'Total Harga'}
                                                        </span>
                                                    </div>
                                                    <span className="text-lg font-bold text-blue-700">{formatRupiah(finalPrice)}</span>
                                                </div>

                                                <Separator />

                                                {/* Share Breakdown */}
                                                <div className="space-y-3">
                                                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                                        Pembagian Hasil
                                                    </p>

                                                    <div className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-3.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Wallet className="h-4 w-4 text-emerald-600" />
                                                                <span className="text-sm text-slate-700">Owner (60%)</span>
                                                            </div>
                                                            <span className="text-base font-bold text-emerald-700">
                                                                {formatRupiah(ownerShare)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="rounded-xl border border-purple-200 bg-purple-50/50 p-3.5">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <Coins className="h-4 w-4 text-purple-600" />
                                                                <span className="text-sm text-slate-700">Pool Staf (40%)</span>
                                                            </div>
                                                            <span className="text-base font-bold text-purple-700">
                                                                {formatRupiah(staffPool)}
                                                            </span>
                                                        </div>
                                                        {selectedStaffs.length > 0 && (
                                                            <p className="mt-1.5 text-[11px] text-purple-500">
                                                                Dibagi ke {selectedStaffs.length} staf ≈{' '}
                                                                {formatRupiah(
                                                                    Math.floor(staffPool / selectedStaffs.length),
                                                                )}{' '}
                                                                / orang (perhitungan mingguan)
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-10">
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                                                    <ClipboardList className="h-8 w-8 text-slate-300" />
                                                </div>
                                                <p className="mt-4 text-sm font-medium text-slate-500">Belum ada layanan dipilih</p>
                                                <p className="mt-0.5 text-xs text-slate-400">
                                                    Pilih jenis cuci dan isi harga untuk melihat ringkasan
                                                </p>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Quick Info Card */}
                                <Card className="overflow-hidden border-0 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-md">
                                    <CardContent className="flex items-start gap-3 px-5 py-4">
                                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-100">
                                            <Info className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-xs font-semibold text-slate-700">Pembagian Otomatis</p>
                                            <p className="text-xs leading-relaxed text-slate-500">
                                                Sistem akan menghitung pembagian 60% owner dan 40% pool staf secara otomatis.
                                                Pool staf dibagi rata setiap akhir minggu.
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="outline"
                                        type="button"
                                        asChild
                                        className="flex-1"
                                    >
                                        <Link href="/transactions">Batal</Link>
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={!canSubmit}
                                        className="flex-[2] gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 font-semibold shadow-md transition-all hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg disabled:opacity-50"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Menyimpan...
                                            </>
                                        ) : (
                                            <>
                                                <Plus className="h-4 w-4" />
                                                Buat Transaksi
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
