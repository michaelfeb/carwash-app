import { formatRupiah } from '@/components/app/stats-card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type CarwashType, type Customer, type PaymentMethod, type Staff } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { AlertCircle, Car, CreditCard, Loader2, Plus, Trash2, UserPlus, Users } from 'lucide-react';
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

    const handleTypeChange = (value: string) => {
        setData('carwash_type_id', value);
        const type = carwashTypes.find((t) => t.id === parseInt(value));
        if (type) {
            setSelectedType(type);
            setData('price', String(type.min_price));
        }
    };

    // Recalculate equal fees when price changes or staff is added/removed
    const recalculateEqualFees = (staffCount: number, totalPrice: number) => {
        if (staffCount === 0 || totalPrice <= 0) return '0';
        // Equal split, rounded down
        return String(Math.floor(totalPrice / staffCount));
    };

    const addStaff = () => {
        if (!canAddStaff) return;

        const availableStaffs = staffs.filter((s) => !selectedStaffs.find((ss) => ss.id === s.id));
        if (availableStaffs.length > 0) {
            const staff = availableStaffs[0];
            const newStaffCount = selectedStaffs.length + 1;
            const equalFee = recalculateEqualFees(newStaffCount, price);

            // Update all existing staff fees to equal amount
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

    // Redistribute fees equally
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

    // Total staff fees for summary
    const totalStaffFees = selectedStaffs.reduce((sum, s) => sum + (parseInt(s.fee) || 0), 0);
    const profit = price - totalStaffFees;

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Transactions', href: '/transactions' },
                { title: 'New Transaction', href: '/transactions/create' },
            ]}
        >
            <Head title="New Transaction" />

            <div className="p-4 md:p-6">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight">New Transaction</h1>
                    <p className="mt-1 text-muted-foreground">Fill in the details to create a new car wash transaction</p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="rounded-xl border bg-card">
                        {/* Section 1: Customer & Vehicle */}
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500/10">
                                    <Car className="h-5 w-5 text-blue-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Customer & Vehicle</h2>
                                    <p className="text-sm text-muted-foreground">Select customer or add new one</p>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer</Label>
                                    <div className="flex gap-2">
                                        <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                            <SelectTrigger className="flex-1">
                                                <SelectValue placeholder="Select customer (optional)" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {customers.map((customer) => (
                                                    <SelectItem key={customer.id} value={String(customer.id)}>
                                                        {customer.name} {customer.phone && `(${customer.phone})`}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <Button type="button" variant="outline" size="icon" asChild title="Add New Customer">
                                            <Link href="/customers/create?redirect=transactions">
                                                <UserPlus className="h-4 w-4" />
                                            </Link>
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">Leave empty for walk-in customer</p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="license_plate">License Plate</Label>
                                    <Input
                                        id="license_plate"
                                        value={data.license_plate}
                                        onChange={(e) => setData('license_plate', e.target.value.toUpperCase())}
                                        placeholder="e.g., B 1234 ABC"
                                        className="uppercase"
                                    />
                                    <p className="text-xs text-muted-foreground">Vehicle registration number</p>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Section 2: Service & Price */}
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-500/10">
                                    <CreditCard className="h-5 w-5 text-emerald-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Service & Price</h2>
                                    <p className="text-sm text-muted-foreground">Choose car wash type and set the price</p>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="carwash_type_id">
                                        Wash Type <span className="text-red-500">*</span>
                                    </Label>
                                    <Select value={data.carwash_type_id} onValueChange={handleTypeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select wash type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carwashTypes.map((type) => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    <div className="flex flex-col">
                                                        <span>{type.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {formatRupiah(type.min_price)} - {formatRupiah(type.max_price)}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.carwash_type_id && <p className="text-sm text-red-500">{errors.carwash_type_id}</p>}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="price">
                                        Price <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">Rp</span>
                                        <Input
                                            id="price"
                                            type="number"
                                            value={data.price}
                                            onChange={(e) => setData('price', e.target.value)}
                                            placeholder="0"
                                            className="pl-10"
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

                        <Separator />

                        {/* Section 3: Staff Assignment */}
                        <div className="p-6">
                            <div className="mb-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-500/10">
                                        <Users className="h-5 w-5 text-purple-500" />
                                    </div>
                                    <div>
                                        <h2 className="text-lg font-semibold">Staff Assignment</h2>
                                        <p className="text-sm text-muted-foreground">Assign washmen and their fees</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {selectedStaffs.length > 1 && (
                                        <Button type="button" variant="ghost" size="sm" onClick={redistributeFees}>
                                            Split Equally
                                        </Button>
                                    )}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        onClick={addStaff}
                                        disabled={!canAddStaff}
                                    >
                                        <Plus className="mr-2 h-4 w-4" />
                                        Add Staff
                                    </Button>
                                </div>
                            </div>

                            {!canAddStaff && (
                                <div className="mb-4 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-200">
                                    <AlertCircle className="h-4 w-4 flex-shrink-0" />
                                    <p className="text-sm">Please select a wash type and set the price first before adding staff.</p>
                                </div>
                            )}

                            {selectedStaffs.length === 0 ? (
                                <div className="rounded-lg border-2 border-dashed py-8 text-center">
                                    <Users className="mx-auto h-10 w-10 text-muted-foreground/50" />
                                    <p className="mt-2 text-sm text-muted-foreground">No staff assigned yet</p>
                                    <p className="text-xs text-muted-foreground">Click "Add Staff" to assign washmen to this job</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {selectedStaffs.map((assignment, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3"
                                        >
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                                                {index + 1}
                                            </div>
                                            <div className="flex-1">
                                                <Select
                                                    value={String(assignment.id)}
                                                    onValueChange={(value) => updateStaffId(index, parseInt(value))}
                                                >
                                                    <SelectTrigger className="bg-background">
                                                        <SelectValue placeholder="Select staff" />
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
                                            <div className="w-36">
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Rp</span>
                                                    <Input
                                                        type="number"
                                                        value={assignment.fee}
                                                        onChange={(e) => updateStaffFee(index, e.target.value)}
                                                        className="bg-background pl-8"
                                                    />
                                                </div>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => removeStaff(index)}
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    ))}

                                    {/* Staff Fee Summary */}
                                    <div className="mt-4 rounded-lg bg-muted/50 p-4">
                                        <div className="grid grid-cols-3 gap-4 text-sm">
                                            <div>
                                                <p className="text-muted-foreground">Total Price</p>
                                                <p className="text-lg font-semibold">{formatRupiah(price)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Staff Fees</p>
                                                <p className="text-lg font-semibold text-purple-600">{formatRupiah(totalStaffFees)}</p>
                                            </div>
                                            <div>
                                                <p className="text-muted-foreground">Net Profit</p>
                                                <p className={`text-lg font-semibold ${profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {formatRupiah(profit)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            {errors.staffs && <p className="mt-2 text-sm text-red-500">{errors.staffs}</p>}
                        </div>

                        <Separator />

                        {/* Section 4: Payment & Notes */}
                        <div className="p-6">
                            <div className="mb-6 flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/10">
                                    <CreditCard className="h-5 w-5 text-amber-500" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold">Payment</h2>
                                    <p className="text-sm text-muted-foreground">Payment status and additional notes</p>
                                </div>
                            </div>

                            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_status">Payment Status</Label>
                                    <Select value={data.payment_status} onValueChange={(value) => setData('payment_status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unpaid">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-amber-500" />
                                                    Unpaid (Pay Later)
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="paid">
                                                <div className="flex items-center gap-2">
                                                    <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                                    Paid
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {data.payment_status === 'paid' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="payment_method_id">Payment Method</Label>
                                        <Select value={data.payment_method_id} onValueChange={(value) => setData('payment_method_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select method" />
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
                                )}

                                <div className="space-y-2 sm:col-span-2 lg:col-span-1">
                                    <Label htmlFor="notes">Notes</Label>
                                    <Textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e) => setData('notes', e.target.value)}
                                        placeholder="Any special instructions or notes..."
                                        rows={2}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-6 flex items-center justify-between rounded-xl border bg-card p-4">
                        <Button variant="outline" type="button" asChild>
                            <Link href="/transactions">Cancel</Link>
                        </Button>
                        <Button
                            type="submit"
                            disabled={processing || selectedStaffs.length === 0 || !data.carwash_type_id || !data.price}
                            className="min-w-[180px]"
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
