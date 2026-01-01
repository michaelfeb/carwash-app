import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type CarwashType } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Loader2 } from 'lucide-react';

interface CarwashTypesEditProps {
    carwashType: CarwashType;
}

export default function CarwashTypesEdit({ carwashType }: CarwashTypesEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: carwashType.name,
        size_category: carwashType.size_category,
        min_price: String(carwashType.min_price),
        max_price: String(carwashType.max_price),
        description: carwashType.description || '',
        is_active: carwashType.is_active,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/carwash-types/${carwashType.id}`);
    };

    return (
        <AppLayout
            breadcrumbs={[
                { title: 'Carwash Types', href: '/carwash-types' },
                { title: 'Edit', href: `/carwash-types/${carwashType.id}/edit` },
            ]}
        >
            <Head title="Edit Carwash Type" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Edit Carwash Type</h1>
                        <p className="text-muted-foreground">Update car wash type information</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Type Information</CardTitle>
                        <CardDescription>Update the car wash type details</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="e.g., Small Car"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="size_category">Size Category</Label>
                                <Select value={data.size_category} onValueChange={(value) => setData('size_category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">Small</SelectItem>
                                        <SelectItem value="medium">Medium</SelectItem>
                                        <SelectItem value="big">Big</SelectItem>
                                        <SelectItem value="special">Special</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.size_category && <p className="text-sm text-red-500">{errors.size_category}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="min_price">Min Price (Rp)</Label>
                                    <Input
                                        id="min_price"
                                        type="number"
                                        value={data.min_price}
                                        onChange={(e) => setData('min_price', e.target.value)}
                                        placeholder="35000"
                                    />
                                    {errors.min_price && <p className="text-sm text-red-500">{errors.min_price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_price">Max Price (Rp)</Label>
                                    <Input
                                        id="max_price"
                                        type="number"
                                        value={data.max_price}
                                        onChange={(e) => setData('max_price', e.target.value)}
                                        placeholder="40000"
                                    />
                                    {errors.max_price && <p className="text-sm text-red-500">{errors.max_price}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description (optional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Description of this car wash type"
                                    rows={3}
                                />
                                {errors.description && <p className="text-sm text-red-500">{errors.description}</p>}
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
                                    Update Type
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/carwash-types">Cancel</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
