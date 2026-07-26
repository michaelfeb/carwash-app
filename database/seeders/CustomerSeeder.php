<?php

namespace Database\Seeders;

use App\Models\Customer;
use Illuminate\Database\Seeder;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            ['name' => 'Ahmad Fauzan', 'phone' => '081251830142', 'address' => 'Jl. Ahmad Yani Km 33, Loktabat Utara, Banjarbaru', 'notes' => 'Pelanggan rutin akhir pekan', 'loyalty_stamps' => 3],
            ['name' => 'Siti Rahmawati', 'phone' => '082153761904', 'address' => 'Komp. Citra Graha Blok C, Landasan Ulin, Banjarbaru', 'notes' => 'Hubungi melalui WhatsApp', 'loyalty_stamps' => 1],
            ['name' => 'Muhammad Rizky', 'phone' => '081349275816', 'address' => 'Jl. Panglima Batur, Loktabat Utara, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 4],
            ['name' => 'Nurul Hikmah', 'phone' => '085251648039', 'address' => 'Komp. Griya Pesona Bhayangkara, Banjarbaru Utara', 'notes' => 'Tidak menggunakan pewangi kabin', 'loyalty_stamps' => 2],
            ['name' => 'Arif Hidayat', 'phone' => '082255930417', 'address' => 'Jl. Trikora, Guntung Manggis, Banjarbaru', 'notes' => 'Biasanya membawa Toyota Avanza', 'loyalty_stamps' => 0],
            ['name' => 'Dewi Lestari', 'phone' => '081158243790', 'address' => 'Komp. Wengga, Loktabat Selatan, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 2],
            ['name' => 'Hendra Saputra', 'phone' => '085357160284', 'address' => 'Jl. Karang Anyar, Loktabat Utara, Banjarbaru', 'notes' => 'Pelanggan armada operasional toko', 'loyalty_stamps' => 1],
            ['name' => 'Rina Marlina', 'phone' => '087851920463', 'address' => 'Jl. RO Ulin, Loktabat Selatan, Banjarbaru', 'notes' => 'Sering datang pada pagi hari', 'loyalty_stamps' => 3],
            ['name' => 'Budi Santoso', 'phone' => '081273640591', 'address' => 'Komp. Mustika Griya Permai, Sungai Ulin, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 0],
            ['name' => 'Maya Sari', 'phone' => '082352814697', 'address' => 'Jl. Golf, Landasan Ulin Utara, Banjarbaru', 'notes' => 'Minta konfirmasi sebelum pengerjaan tambahan', 'loyalty_stamps' => 4],
            ['name' => 'Ilham Maulana', 'phone' => '085758193026', 'address' => 'Komp. Banjarbaru Asri, Guntung Manggis, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 1],
            ['name' => 'Fitri Handayani', 'phone' => '081312760945', 'address' => 'Jl. Wijaya Kusuma, Loktabat Utara, Banjarbaru', 'notes' => 'Pelanggan rutin dua mingguan', 'loyalty_stamps' => 2],
            ['name' => 'Yusuf Kurniawan', 'phone' => '088215493670', 'address' => 'Jl. A. Yani Km 36, Landasan Ulin, Banjarbaru', 'notes' => 'Kendaraan pick-up usaha', 'loyalty_stamps' => 0],
            ['name' => 'Nadia Safitri', 'phone' => '082158407236', 'address' => 'Komp. Bumi Cahaya Bintang, Kemuning, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 3],
            ['name' => 'Rudiansyah', 'phone' => '081350926174', 'address' => 'Jl. Mistar Cokrokusumo, Sungai Besar, Banjarbaru', 'notes' => 'Lebih sering membayar tunai', 'loyalty_stamps' => 1],
            ['name' => 'Aulia Putri', 'phone' => '085246731809', 'address' => 'Komp. Palm Residence, Guntung Paikat, Banjarbaru', 'notes' => 'Tidak perlu semir ban', 'loyalty_stamps' => 4],
            ['name' => 'Fajar Ramadhan', 'phone' => '087752680413', 'address' => 'Jl. Taruna Praja, Loktabat Utara, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 2],
            ['name' => 'Sri Wahyuni', 'phone' => '081221905638', 'address' => 'Komp. Seribu, Sungai Ulin, Banjarbaru', 'notes' => 'Pelanggan keluarga dengan dua kendaraan', 'loyalty_stamps' => 3],
            ['name' => 'Dimas Pratama', 'phone' => '082281473059', 'address' => 'Jl. Hercules, Landasan Ulin Timur, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 0],
            ['name' => 'Laila Khairunnisa', 'phone' => '085821640397', 'address' => 'Jl. STM, Loktabat Selatan, Banjarbaru', 'notes' => 'Hubungi saat kendaraan selesai', 'loyalty_stamps' => 1],
            ['name' => 'Agus Setiawan', 'phone' => '081154897320', 'address' => 'Komp. Pesona Cempaka, Cempaka, Banjarbaru', 'notes' => 'Sering membawa kendaraan kantor', 'loyalty_stamps' => 2],
            ['name' => 'Melati Anggraini', 'phone' => '082351709428', 'address' => 'Jl. Intan Sari, Sungai Besar, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 4],
            ['name' => 'Reza Firmansyah', 'phone' => '081398245761', 'address' => 'Komp. Pondok Sejahtera, Guntung Manggis, Banjarbaru', 'notes' => 'Biasanya memilih pembayaran QRIS', 'loyalty_stamps' => 3],
            ['name' => 'Ratna Wulandari', 'phone' => '085249630178', 'address' => 'Jl. Purnawirawan, Komet, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 0],
            ['name' => 'Andi Syahputra', 'phone' => '088151427936', 'address' => 'Jl. Peramuan, Landasan Ulin Selatan, Banjarbaru', 'notes' => 'Kendaraan sering membawa muatan kebun', 'loyalty_stamps' => 1],
            ['name' => 'Nisa Amelia', 'phone' => '081271835409', 'address' => 'Komp. Berlina Jaya, Loktabat Selatan, Banjarbaru', 'notes' => 'Tidak menggunakan pengharum yang menyengat', 'loyalty_stamps' => 2],
            ['name' => 'Rahmat Hidayatullah', 'phone' => '082152967804', 'address' => 'Jl. Gotong Royong, Mentaos, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 4],
            ['name' => 'Yuliana', 'phone' => '085712480396', 'address' => 'Jl. Sidodadi, Loktabat Selatan, Banjarbaru', 'notes' => 'Pelanggan rutin sepulang kerja', 'loyalty_stamps' => 3],
            ['name' => 'Bayu Nugroho', 'phone' => '081343670925', 'address' => 'Komp. Balitan, Loktabat Utara, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 0],
            ['name' => 'Intan Permata Sari', 'phone' => '087821594603', 'address' => 'Jl. Jeruk, Sungai Ulin, Banjarbaru', 'notes' => 'Sering datang bersama kendaraan keluarga', 'loyalty_stamps' => 1],
            ['name' => 'Zainal Abidin', 'phone' => '082256713948', 'address' => 'Jl. Sukamara, Landasan Ulin Utara, Banjarbaru', 'notes' => 'Kendaraan operasional proyek', 'loyalty_stamps' => 2],
            ['name' => 'Vina Oktaviani', 'phone' => '081258409137', 'address' => 'Komp. Grand Cempaka, Cempaka, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 3],
            ['name' => 'Eko Prasetyo', 'phone' => '085351926470', 'address' => 'Jl. Kurnia, Guntung Payung, Banjarbaru', 'notes' => 'Biasanya datang hari Minggu', 'loyalty_stamps' => 4],
            ['name' => 'Wahyu Ramadhan', 'phone' => '081320784596', 'address' => 'Jl. Sukarelawan, Loktabat Utara, Banjarbaru', 'notes' => null, 'loyalty_stamps' => 0],
            ['name' => 'Desi Natalia', 'phone' => '082367195840', 'address' => 'Komp. Graha Mega, Landasan Ulin, Banjarbaru', 'notes' => 'Minta bagian bagasi dibersihkan teliti', 'loyalty_stamps' => 2],
            ['name' => 'Hasan Basri', 'phone' => '085248630719', 'address' => 'Jl. Transad, Guntung Manggis, Banjarbaru', 'notes' => 'Pelanggan kendaraan niaga', 'loyalty_stamps' => 1],
        ];

        foreach ($customers as $customer) {
            Customer::create($customer);
        }
    }
}
