<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daily Report - {{ $date->format('d M Y') }}</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 12px;
            line-height: 1.4;
            color: #333;
        }

        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }

        .header h1 {
            margin: 0;
            font-size: 18px;
        }

        .header p {
            margin: 5px 0 0;
            color: #666;
        }

        .summary {
            background: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        .summary-item {
            display: inline-block;
            margin-right: 30px;
        }

        .summary-label {
            font-weight: bold;
            color: #666;
        }

        .summary-value {
            font-size: 16px;
            color: #333;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        th,
        td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
        }

        th {
            background-color: #4a5568;
            color: white;
            font-weight: bold;
        }

        tr:nth-child(even) {
            background-color: #f9f9f9;
        }

        .text-right {
            text-align: right;
        }

        .text-center {
            text-align: center;
        }

        .status-paid {
            color: #22c55e;
            font-weight: bold;
        }

        .status-unpaid {
            color: #ef4444;
            font-weight: bold;
        }

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>LAPORAN TRANSAKSI HARIAN</h1>
        <p>Tanggal: {{ $date->format('d F Y') }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Transaksi:</span>
            <span class="summary-value">{{ $totalTransactions }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Pendapatan:</span>
            <span class="summary-value">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Invoice</th>
                <th>Customer</th>
                <th>Tipe Cuci</th>
                <th>Plat Nomor</th>
                <th class="text-right">Harga</th>
                <th class="text-center">Status</th>
                <th>Kasir</th>
            </tr>
        </thead>
        <tbody>
            @forelse($transactions as $index => $transaction)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $transaction->invoice_number }}</td>
                    <td>{{ $transaction->customer?->name ?? '-' }}</td>
                    <td>{{ $transaction->carwashType->name }}</td>
                    <td>{{ $transaction->license_plate ?? '-' }}</td>
                    <td class="text-right">Rp {{ number_format($transaction->price, 0, ',', '.') }}</td>
                    <td class="text-center {{ $transaction->payment_status === 'paid' ? 'status-paid' : 'status-unpaid' }}">
                        {{ $transaction->payment_status === 'paid' ? 'Lunas' : 'Belum Bayar' }}
                    </td>
                    <td>{{ $transaction->user->name }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="8" class="text-center">Tidak ada transaksi pada tanggal ini</td>
                </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: {{ now()->format('d M Y H:i:s') }}</p>
    </div>
</body>

</html>