import { formatRupiah } from '@/components/app/stats-card';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type CarwashType, type Customer, type PaymentMethod, type Staff } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2, Plus, Trash2 } from 'lucide-react';
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

    const handleTypeChange = (value: string) => {
        setData('carwash_type_id', value);
        const type = carwashTypes.find((t) => t.id === parseInt(value));
        if (type) {
            setSelectedType(type);
            setData('price', String(type.min_price));
        }
    };

    const addStaff = () => {
        const availableStaffs = staffs.filter((s) => !selectedStaffs.find((ss) => ss.id === s.id));
        if (availableStaffs.length > 0) {
            const staff = availableStaffs[0];
            setSelectedStaffs([...selectedStaffs, { id: staff.id, name: staff.name, fee: '10000' }]);
        }
    };

    const removeStaff = (index: number) => {
        setSelectedStaffs(selectedStaffs.filter((_, i) => i !== index));
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
                { title: 'Create', href: '/transactions/create' },
            ]}
        >
            <Head title="New Transaction" />

            <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/transactions">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">New Transaction</h1>
                        <p className="text-muted-foreground">Create a new car wash transaction</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Customer & Vehicle */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Customer & Vehicle</CardTitle>
                            <CardDescription>Customer information and vehicle details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="customer_id">Customer (optional)</Label>
                                    <Select value={data.customer_id} onValueChange={(value) => setData('customer_id', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select customer" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {customers.map((customer) => (
                                                <SelectItem key={customer.id} value={String(customer.id)}>
                                                    {customer.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="license_plate">License Plate (optional)</Label>
                                    <Input
                                        id="license_plate"
                                        value={data.license_plate}
                                        onChange={(e) => setData('license_plate', e.target.value.toUpperCase())}
                                        placeholder="e.g., B 1234 ABC"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Service & Price */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Service & Price</CardTitle>
                            <CardDescription>Select car wash type and set the price</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="carwash_type_id">Carwash Type *</Label>
                                    <Select value={data.carwash_type_id} onValueChange={handleTypeChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {carwashTypes.map((type) => (
                                                <SelectItem key={type.id} value={String(type.id)}>
                                                    {type.name} ({formatRupiah(type.min_price)} - {formatRupiah(type.max_price)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.carwash_type_id && <p className="text-sm text-red-500">{errors.carwash_type_id}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="price">Price (Rp) *</Label>
                                    <Input
                                        id="price"
                                        type="number"
                                        value={data.price}
                                        onChange={(e) => setData('price', e.target.value)}
                                        placeholder="Enter price"
                                    />
                                    {selectedType && (
                                        <p className="text-xs text-muted-foreground">
                                            Range: {formatRupiah(selectedType.min_price)} - {formatRupiah(selectedType.max_price)}
                                        </p>
                                    )}
                                    {errors.price && <p className="text-sm text-red-500">{errors.price}</p>}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Staff Assignment */}
                    <Card>
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle>Staff Assignment</CardTitle>
                                    <CardDescription>Assign washmen and their fees</CardDescription>
                                </div>
                                <Button type="button" variant="outline" size="sm" onClick={addStaff}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Staff
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {selectedStaffs.length === 0 ? (
                                <p className="text-center text-muted-foreground py-4">
                                    No staff assigned. Click "Add Staff" to assign washmen.
                                </p>
                            ) : (
                                selectedStaffs.map((assignment, index) => (
                                    <div key={index} className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <Select
                                                value={String(assignment.id)}
                                                onValueChange={(value) => updateStaffId(index, parseInt(value))}
                                            >
                                                <SelectTrigger>
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
                                        <div className="w-32">
                                            <Input
                                                type="number"
                                                value={assignment.fee}
                                                onChange={(e) => updateStaffFee(index, e.target.value)}
                                                placeholder="Fee"
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" onClick={() => removeStaff(index)}>
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </div>
                                ))
                            )}
                            {errors.staffs && <p className="text-sm text-red-500">{errors.staffs}</p>}
                        </CardContent>
                    </Card>

                    {/* Payment */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Payment</CardTitle>
                            <CardDescription>Payment method and status</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="payment_status">Payment Status</Label>
                                    <Select value={data.payment_status} onValueChange={(value) => setData('payment_status', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select status" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unpaid">Unpaid (Pay Later)</SelectItem>
                                            <SelectItem value="paid">Paid</SelectItem>
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
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="notes">Notes (optional)</Label>
                                <Textarea
                                    id="notes"
                                    value={data.notes}
                                    onChange={(e) => setData('notes', e.target.value)}
                                    placeholder="Any additional notes"
                                    rows={2}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Actions */}
                    <div className="flex gap-4">
                        <Button type="submit" disabled={processing || selectedStaffs.length === 0}>
                            {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Transaction
                        </Button>
                        <Button variant="outline" asChild>
                            <Link href="/transactions">Cancel</Link>
                        </Button>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}
