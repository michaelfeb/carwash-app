<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Monthly Report - {{ $month->format('F Y') }}</title>
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

        .footer {
            margin-top: 30px;
            text-align: center;
            font-size: 10px;
            color: #666;
        }

        .total-row {
            font-weight: bold;
            background-color: #e5e7eb !important;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>LAPORAN PENDAPATAN BULANAN</h1>
        <p>Periode: {{ $month->format('F Y') }}</p>
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
                <th>Tanggal</th>
                <th class="text-center">Jumlah Transaksi</th>
                <th class="text-right">Pendapatan</th>
            </tr>
        </thead>
        <tbody>
            @forelse($dailyData as $index => $data)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ \Carbon\Carbon::parse($data['date'])->format('d F Y') }}</td>
                    <td class="text-center">{{ $data['count'] }}</td>
                    <td class="text-right">Rp {{ number_format($data['revenue'], 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="4" class="text-center">Tidak ada transaksi pada bulan ini</td>
                </tr>
            @endforelse
            @if($dailyData->count() > 0)
                <tr class="total-row">
                    <td colspan="2">TOTAL</td>
                    <td class="text-center">{{ $totalTransactions }}</td>
                    <td class="text-right">Rp {{ number_format($totalRevenue, 0, ',', '.') }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: {{ now()->format('d M Y H:i:s') }}</p>
    </div>
</body>

</html>