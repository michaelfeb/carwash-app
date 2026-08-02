<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Struk {{ $transaction->invoice_number }}</title>
    <style>
        @page {
            margin: 11mm 9mm;
        }

        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            color: #1f2937;
            font-family: DejaVu Sans, sans-serif;
            font-size: 8.5px;
            line-height: 1.45;
        }

        .header {
            text-align: center;
        }

        .logo {
            width: 42px;
            height: 42px;
            margin-bottom: 5px;
        }

        .brand {
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 0.8px;
        }

        .address {
            margin: 3px auto 0;
            max-width: 230px;
            color: #6b7280;
            font-size: 6.8px;
            line-height: 1.35;
        }

        .title {
            margin-top: 9px;
            font-size: 10px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .separator {
            margin: 8px 0;
            border-top: 1px dashed #9ca3af;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }

        td {
            padding: 1.5px 0;
            vertical-align: top;
            overflow-wrap: break-word;
            word-wrap: break-word;
        }

        .label {
            width: 38%;
            color: #6b7280;
        }

        .value {
            width: 62%;
            text-align: right;
            font-weight: 600;
        }

        .price-label {
            width: 58%;
        }

        .price-value {
            width: 42%;
            text-align: right;
        }

        .discount {
            color: #047857;
        }

        .total td {
            padding-top: 5px;
            border-top: 1px solid #d1d5db;
            font-size: 11px;
            font-weight: 700;
        }

        .paid {
            margin-top: 8px;
            padding: 5px;
            border: 1px solid #86efac;
            background: #f0fdf4;
            color: #166534;
            text-align: center;
            font-size: 9px;
            font-weight: 700;
            letter-spacing: 1px;
        }

        .footer {
            margin-top: 10px;
            color: #6b7280;
            text-align: center;
            font-size: 7px;
        }
    </style>
</head>
<body>
    @php
        $rupiah = static fn (int $amount): string => 'Rp ' . number_format($amount, 0, ',', '.');
        $receiptDate = $transaction->paid_at ?? $transaction->created_at;
    @endphp

    <div class="header">
        <img class="logo" src="{{ public_path('assets/logo.jpeg') }}" alt="Logo RK Carwash">
        <div class="brand">RK CARWASH</div>
        <div class="address">
            Belakang Halte Komplek Bumi Cahaya Bintang, Jl. Mr. Cokro Kusumo Jl. Raya Taurus No.3,
            RT.43/RW.8, Kemuning, Kec. Banjarbaru Selatan, Kota Banjar Baru
        </div>
        <div class="title">STRUK PEMBAYARAN</div>
    </div>

    <div class="separator"></div>

    <table>
        <tr>
            <td class="label">Nomor Faktur</td>
            <td class="value">{{ $transaction->invoice_number }}</td>
        </tr>
        <tr>
            <td class="label">Tanggal</td>
            <td class="value">{{ $receiptDate->format('d/m/Y H:i') }}</td>
        </tr>
        <tr>
            <td class="label">Pelanggan</td>
            <td class="value">{{ $transaction->customer?->name ?? 'Pelanggan Umum' }}</td>
        </tr>
        @if ($transaction->customer?->phone)
            <tr>
                <td class="label">Telepon</td>
                <td class="value">{{ $transaction->customer->phone }}</td>
            </tr>
        @endif
        <tr>
            <td class="label">Plat Nomor</td>
            <td class="value">{{ $transaction->license_plate ?: '-' }}</td>
        </tr>
        <tr>
            <td class="label">Layanan</td>
            <td class="value">{{ $transaction->carwashType?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Kasir</td>
            <td class="value">{{ $transaction->user?->name ?? '-' }}</td>
        </tr>
        <tr>
            <td class="label">Pembayaran</td>
            <td class="value">{{ $transaction->paymentMethod?->name ?? '-' }}</td>
        </tr>
    </table>

    <div class="separator"></div>

    <table>
        @if ($transaction->loyalty_discount_applied && $transaction->original_price)
            <tr>
                <td class="price-label">Harga Awal</td>
                <td class="price-value">{{ $rupiah($transaction->original_price) }}</td>
            </tr>
            <tr class="discount">
                <td class="price-label">Diskon Loyalty</td>
                <td class="price-value">-{{ $rupiah($transaction->discount_amount) }}</td>
            </tr>
        @endif
        <tr class="total">
            <td class="price-label">TOTAL</td>
            <td class="price-value">{{ $rupiah($transaction->price) }}</td>
        </tr>
    </table>

    <div class="paid">LUNAS</div>

    <div class="footer">
        Terima kasih telah menggunakan layanan RK Carwash.<br>
        Simpan struk ini sebagai bukti pembayaran.
    </div>
</body>
</html>
