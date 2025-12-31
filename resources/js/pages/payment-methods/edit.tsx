import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { type PaymentMethod } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface PaymentMethodsEditProps {
    paymentMethod: PaymentMethod;
}

export default function PaymentMethodsEdit({ paymentMethod }: PaymentMethodsEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: paymentMethod.name,
        is_active: paymentMethod.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/payment-methods/${paymentMethod.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Payment Methods', href: '/payment-methods' },
                { title: 'Edit', href: `/payment-methods/${paymentMethod.id}/edit` },
            ]}
        >
            <Head title="Edit Payment Method" />

            <div className="mx-auto max-w-2xl space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/payment-methods">
                            <ArrowLeft className="h-4 w-4" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Payment Method</h1>
                        <p className="text-muted-foreground">Update payment method</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Payment Method</CardTitle>
                        <CardDescription>Update the payment method details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Credit Card"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="flex items-center space-x-2">
                                <Checkbox
                                    id="is_active"
                                    checked={data.is_active}
                                    onCheckedChange={(checked) => setData('is_active', checked as boolean)}
                                />
                                <Label htmlFor="is_active">Active</Label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Update Method
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/payment-methods">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
