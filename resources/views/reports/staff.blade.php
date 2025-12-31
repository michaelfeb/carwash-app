<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Staff Performance Report</title>
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
        <h1>LAPORAN PERFORMA STAFF</h1>
        <p>Periode: {{ $dateFrom->format('d M Y') }} - {{ $dateTo->format('d M Y') }}</p>
    </div>

    <div class="summary">
        <div class="summary-item">
            <span class="summary-label">Total Transaksi:</span>
            <span class="summary-value">{{ $totalTransactions }}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">Total Fee Staff:</span>
            <span class="summary-value">Rp {{ number_format($totalFees, 0, ',', '.') }}</span>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Staff</th>
                <th>No. Telepon</th>
                <th class="text-center">Jumlah Transaksi</th>
                <th class="text-right">Total Fee</th>
            </tr>
        </thead>
        <tbody>
            @forelse($staffs as $index => $staff)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $staff->name }}</td>
                    <td>{{ $staff->phone ?? '-' }}</td>
                    <td class="text-center">{{ $staff->transaction_count }}</td>
                    <td class="text-right">Rp {{ number_format($staff->total_fees, 0, ',', '.') }}</td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Tidak ada data</td>
                </tr>
            @endforelse
            @if($staffs->count() > 0)
                <tr class="total-row">
                    <td colspan="3">TOTAL</td>
                    <td class="text-center">{{ $totalTransactions }}</td>
                    <td class="text-right">Rp {{ number_format($totalFees, 0, ',', '.') }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: {{ now()->format('d M Y H:i:s') }}</p>
    </div>
</body>

</html>