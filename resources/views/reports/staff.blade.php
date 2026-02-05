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

        .info-box {
            background: #e8f4fd;
            border: 1px solid #bee5ff;
            padding: 10px;
            margin-bottom: 15px;
            border-radius: 4px;
            font-size: 11px;
        }

        .info-box strong {
            color: #0066cc;
        }

        .summary {
            background: #f5f5f5;
            padding: 10px;
            margin-bottom: 20px;
            border-radius: 4px;
        }

        .summary-grid {
            display: table;
            width: 100%;
        }

        .summary-item {
            display: table-cell;
            padding: 5px 10px;
            text-align: center;
            border-right: 1px solid #ddd;
        }

        .summary-item:last-child {
            border-right: none;
        }

        .summary-label {
            font-size: 10px;
            font-weight: bold;
            color: #666;
            display: block;
            margin-bottom: 3px;
        }

        .summary-value {
            font-size: 14px;
            color: #333;
            font-weight: bold;
        }

        .summary-value.highlight {
            color: #7c3aed;
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

        .share-badge {
            background: #f3e8ff;
            color: #7c3aed;
            padding: 2px 6px;
            border-radius: 3px;
            font-weight: bold;
        }
    </style>
</head>

<body>
    <div class="header">
        <h1>LAPORAN PERFORMA STAFF</h1>
        <p>Periode: {{ $dateFrom->format('d M Y') }} - {{ $dateTo->format('d M Y') }}</p>
    </div>

    <div class="info-box">
        <strong>📊 Mekanisme Pembagian 60/40:</strong>
        Dari setiap transaksi, 60% untuk Owner dan 40% masuk Pool Staff.
        Pool Staff dibagi <strong>rata</strong> ke semua staff yang bekerja dalam periode ini.
    </div>

    <div class="summary">
        <div class="summary-grid">
            <div class="summary-item">
                <span class="summary-label">Total Transaksi</span>
                <span class="summary-value">{{ $totalTransactions }}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Total Pool Staff (40%)</span>
                <span class="summary-value highlight">Rp {{ number_format($totalStaffPool, 0, ',', '.') }}</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Staff Bekerja</span>
                <span class="summary-value">{{ $workingStaffCount }} orang</span>
            </div>
            <div class="summary-item">
                <span class="summary-label">Bagian per Staff</span>
                <span class="summary-value highlight">Rp {{ number_format($equalShare, 0, ',', '.') }}</span>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Nama Staff</th>
                <th>No. Telepon</th>
                <th class="text-center">Transaksi Dikerjakan</th>
                <th class="text-right">Bagian (Dibagi Rata)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($staffs as $index => $staff)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td>{{ $staff->name }}</td>
                    <td>{{ $staff->phone ?? '-' }}</td>
                    <td class="text-center">{{ $staff->transaction_count }}</td>
                    <td class="text-right"><span class="share-badge">Rp
                            {{ number_format($staff->share_amount, 0, ',', '.') }}</span></td>
                </tr>
            @empty
                <tr>
                    <td colspan="5" class="text-center">Tidak ada data staff yang bekerja dalam periode ini</td>
                </tr>
            @endforelse
            @if($staffs->count() > 0)
                <tr class="total-row">
                    <td colspan="3">TOTAL</td>
                    <td class="text-center">{{ $totalTransactions }}</td>
                    <td class="text-right">Rp {{ number_format($totalShareAmount, 0, ',', '.') }}</td>
                </tr>
            @endif
        </tbody>
    </table>

    <div class="footer">
        <p>Dicetak pada: {{ now()->format('d M Y H:i:s') }}</p>
        <p style="margin-top: 5px; font-style: italic;">
            * Pembagian dihitung dari total Pool Staff (40%) dibagi rata ke {{ $workingStaffCount }} staff
        </p>
    </div>
</body>

</html>