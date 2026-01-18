import { formatMoneyInput, formatRupiah, parseMoneyInput } from '@/components/app/stats-card';
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
import { AlertCircle, Car, Coins, CreditCard, Loader2, Plus, Trash2, UserPlus, Users } from 'lucide-react';
import * as React from 'react';

interface TransactionsCreateProps {
    customers: Customer[];
    carwashTypes: CarwashType[];
    paymentMethods: PaymentMethod[];
    staffs: Staff[];
}

interface StaffAssignment {
    id: number;
    name: string;
    fee: string;
}

export default function TransactionsCreate({ customers, carwashTypes, paymentMethods, staffs }: TransactionsCreateProps) {
    const [selectedStaffs, setSelectedStaffs] = React.useState<StaffAssignment[]>([]);
    const [selectedType, setSelectedType] = React.useState<CarwashType | null>(null);

    const { data, setData, post, processing, errors } = useForm({
        customer_id: '',
        carwash_type_id: '',
        payment_method_id: '',
        license_plate: '',
        price: '',
        payment_status: 'unpaid',
        notes: '',
        staffs: [] as { id: number; fee: number }[],
    });

    const price = parseInt(data.price) || 0;
    const canAddStaff = price > 0;

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

    // Recalculate equal fees
    const recalculateEqualFees = (staffCount: number, totalPrice: number) => {
        if (staffCount === 0 || totalPrice <= 0) return '0';
        return String(Math.floor(totalPrice / staffCount));
    };

    const addStaff = () => {
        if (!canAddStaff) return;

        const availableStaffs = staffs.filter((s) => !selectedStaffs.find((ss) => ss.id === s.id));
        if (availableStaffs.length > 0) {
            const staff = availableStaffs[0];
            const newStaffCount = selectedStaffs.length + 1;
            const equalFee = recalculateEqualFees(newStaffCount, price);

            const updatedStaffs = selectedStaffs.map((s) => ({ ...s, fee: equalFee }));
            setSelectedStaffs([...updatedStaffs, { id: staff.id, name: staff.name, fee: equalFee }]);
        }
    };

    const removeStaff = (index: number) => {
        const remaining = selectedStaffs.filter((_, i) => i !== index);
        if (remaining.length > 0) {
            const equalFee = recalculateEqualFees(remaining.length, price);
            setSelectedStaffs(remaining.map((s) => ({ ...s, fee: equalFee })));
        } else {
            setSelectedStaffs([]);
        }
    };

    const updateStaffId = (index: number, staffId: number) => {
        const staff = staffs.find((s) => s.id === staffId);
        if (staff) {
            const updated = [...selectedStaffs];
            updated[index] = { ...updated[index], id: staffId, name: staff.name };
            setSelectedStaffs(updated);
        }
    };

    const updateStaffFee = (index: number, fee: string) => {
        const updated = [...selectedStaffs];
        updated[index] = { ...updated[index], fee };
        setSelectedStaffs(updated);
    };

    const redistributeFees = () => {
        if (selectedStaffs.length === 0 || price <= 0) return;
        const equalFee = recalculateEqualFees(selectedStaffs.length, price);
        setSelectedStaffs(selectedStaffs.map((s) => ({ ...s, fee: equalFee })));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/transactions');
    };

    React.useEffect(() => {
        const staffsData = selectedStaffs.map((s) => ({ id: s.id, fee: parseInt(s.fee) || 0 }));
        setData('staffs', staffsData);
    }, [selectedStaffs]);

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transactions', href: '/transactions' },
                { title: 'New Transaction', href: '/transactions/create' },
            ]}
        >
            <Head title="New Transaction" />

            <div className=" p-4 md:p-6">
                <div className="mb-6">
                    <h1 className="text-2xl font-bold tracking-tight">New Transaction</h1>
                    <p className="text-sm text-muted-foreground">Create a new car wash transaction</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Top Section Grid */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Customer & Vehicle - Left Column */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 text-primary">
                                <Car className="h-5 w-5" />
                                <h2 className="font-semibold">Customer & Vehicle</h2>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Customer</Label>
                                    <div className="flex gap-2">
                                        <Combobox
                                            options={customerOptions}
                                            value={data.customer_id}
                                            onValueChange={(value) => setData('customer_id', value)}
                                            placeholder="Select customer..."
                                            searchPlaceholder="Search customer..."
                                            className="flex-1"
                                        />
                                        <Button type="button" variant="outline" size="icon" asChild title="Add Customer">
                                            <Link href="/customers/create?redirect=transactions">
                                                <UserPlus className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label>License Plate</Label>
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
                                <h2 className="font-semibold">Service & Price</h2>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label>Wash Type <span className="text-red-500">*</span></Label>
                                    <Select value={data.carwash_type_id} onValueChange={handleTypeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
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
                                    <Label>Price <span className="text-red-500">*</span></Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">Rp</span>
                                        <Input
                                            type="text"
                                            value={formatMoneyInput(data.price)}
                                            onChange={(e) => {
                                                const numericValue = parseMoneyInput(e.target.value);
                                                setData('price', String(numericValue));
                                            }}
                                            placeholder="0"
                                            className="pl-9 font-medium"
                                        />
                                    </div>
                                    {selectedType && (
                                        <p className="text-xs text-muted-foreground">
                                            Range: {formatRupiah(selectedType.min_price)} - {formatRupiah(selectedType.max_price)}
                                        </p>
                                    )}
                                    {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                </div>
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Staff Assignment */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-purple-600">
                                <Users className="h-5 w-5" />
                                <h2 className="font-semibold">Staff Assignment</h2>
                            </div>
                            <div className="flex gap-2">
                                {selectedStaffs.length > 1 && (
                                    <Button type="button" variant="ghost" size="sm" onClick={redistributeFees} className="h-8">
                                        Split Equally
                                    </Button>
                                )}
                                <Button type="button" variant="outline" size="sm" onClick={addStaff} disabled={!canAddStaff} className="h-8">
                                    <Plus className="mr-2 h-3.5 w-3.5" />
                                    Add Staff
                                </Button>
                            </div>
                        </div>

                        {!canAddStaff && (
                            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50">
                                <AlertCircle className="h-4 w-4" />
                                Please set the price first.
                            </div>
                        )}

                        <div className="space-y-3">
                            {selectedStaffs.map((assignment, index) => (
                                <div key={index} className="flex items-center gap-3">
                                    <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-medium">
                                        {index + 1}
                                    </div>
                                    <div className="flex-1">
                                        <Select
                                            value={String(assignment.id)}
                                            onValueChange={(value) => updateStaffId(index, parseInt(value))}
                                        >
                                            <SelectTrigger className="h-9">
                                                <SelectValue placeholder="Select staff..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {staffs.map((staff) => (
                                                    <SelectItem
                                                        key={staff.id}
                                                        value={String(staff.id)}
                                                        disabled={selectedStaffs.some((s, i) => s.id === staff.id && i !== index)}
                                                    >
                                                        {staff.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="w-32">
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                                            <Input
                                                type="text"
                                                value={formatMoneyInput(assignment.fee)}
                                                onChange={(e) => {
                                                    const numericValue = parseMoneyInput(e.target.value);
                                                    updateStaffFee(index, String(numericValue));
                                                }}
                                                className="h-9 pl-8 text-right font-mono"
                                            />
                                        </div>
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

                            {selectedStaffs.length > 0 && (
                                <div className="flex justify-end pt-2 border-t mt-4 border-dashed">
                                    <div className="text-right">
                                        <span className="text-sm text-muted-foreground mr-3">Total Transaction Price:</span>
                                        <span className="text-lg font-bold">{formatRupiah(price)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <Separator />

                    {/* Payment & Notes */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-600">
                            <CreditCard className="h-5 w-5" />
                            <h2 className="font-semibold">Payment & Notes</h2>
                        </div>

                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Payment Status</Label>
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
                                                <SelectItem value="unpaid">Unpaid</SelectItem>
                                                <SelectItem value="paid">Paid</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Payment Method</Label>
                                        <Select
                                            value={data.payment_method_id}
                                            onValueChange={(value) => setData('payment_method_id', value)}
                                            disabled={data.payment_status !== 'paid'}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Method" />
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
                                <Label>Notes</Label>
                                <Textarea
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Optional notes..."
                                    className="min-h-[80px] resize-none"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end gap-3 pt-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/transactions">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || selectedStaffs.length === 0 || !data.carwash_type_id || !data.price}
                            className="min-w-[140px]"
                        >
                            {processing ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                <>Create Transaction</>
                            )}
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
