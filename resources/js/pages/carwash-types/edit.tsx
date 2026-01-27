import { formatMoneyInput, parseMoneyInput } from '@/components/app/stats-card';
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
                { title: 'Jenis Cuci', href: '/carwash-types' },
                { title: 'Ubah', href: `/carwash-types/${carwashType.id}/edit` },
            ]}
        >
            <Head title="Ubah Jenis Cuci" />

            <div className="space-y-6 p-4 md:p-6">
                <div className="flex items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Ubah Jenis Cuci</h1>
                        <p className="text-muted-foreground">Perbarui informasi jenis cuci mobil</p>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Informasi Jenis</CardTitle>
                        <CardDescription>Perbarui detail jenis cuci mobil</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nama</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => setData('name', e.target.value)}
                                    placeholder="contoh: Mobil Kecil"
                                />
                                {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="size_category">Kategori Ukuran</Label>
                                <Select value={data.size_category} onValueChange={(value) => setData('size_category', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Pilih kategori" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="small">Kecil</SelectItem>
                                        <SelectItem value="medium">Sedang</SelectItem>
                                        <SelectItem value="big">Besar</SelectItem>
                                        <SelectItem value="special">Khusus</SelectItem>
                                    </SelectContent>
                                </Select>
                                {errors.size_category && <p className="text-sm text-red-500">{errors.size_category}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="min_price">Harga Minimum (Rp)</Label>
                                    <Input
                                        id="min_price"
                                        type="text"
                                        value={formatMoneyInput(data.min_price)}
                                        onChange={(e) => {
                                            const numericValue = parseMoneyInput(e.target.value);
                                            setData('min_price', String(numericValue));
                                        }}
                                        placeholder="35.000"
                                    />
                                    {errors.min_price && <p className="text-sm text-red-500">{errors.min_price}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="max_price">Harga Maksimum (Rp)</Label>
                                    <Input
                                        id="max_price"
                                        type="text"
                                        value={formatMoneyInput(data.max_price)}
                                        onChange={(e) => {
                                            const numericValue = parseMoneyInput(e.target.value);
                                            setData('max_price', String(numericValue));
                                        }}
                                        placeholder="40.000"
                                    />
                                    {errors.max_price && <p className="text-sm text-red-500">{errors.max_price}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi (opsional)</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Deskripsi jenis cuci mobil ini"
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
                                <Label htmlFor="is_active">Aktif</Label>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Perbarui Jenis
                                </Button>
                                <Button variant="outline" asChild>
                                    <Link href="/carwash-types">Batal</Link>
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
