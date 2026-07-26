<?php

use App\Http\Controllers\ReportController;
use App\Models\Transaction;
use Illuminate\Contracts\Console\Kernel;
use Illuminate\Http\Request;

require dirname(__DIR__, 2) . '/vendor/autoload.php';

$app = require dirname(__DIR__, 2) . '/bootstrap/app.php';
$app->make(Kernel::class)->bootstrap();

$latestTransactionAt = Transaction::max('created_at');
$sampleDate = $latestTransactionAt
    ? \Carbon\Carbon::parse($latestTransactionAt)
    : now();
$date = $sampleDate->format('Y-m-d');
$month = $sampleDate->format('Y-m');
$dateFrom = $sampleDate->copy()->subDays(30)->format('Y-m-d');
$dateTo = $sampleDate->format('Y-m-d');

$controller = app(ReportController::class);
$reports = [
    'daily' => fn () => $controller->dailyExport(new Request(['date' => $date])),
    'monthly' => fn () => $controller->monthlyExport(new Request(['month' => $month])),
    'car-type' => fn () => $controller->carTypeExport(new Request([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ])),
    'staff' => fn () => $controller->staffExport(new Request([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ])),
    'income-trend' => fn () => $controller->incomeTrendExport(new Request([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ])),
    'payment-method' => fn () => $controller->paymentMethodExport(new Request([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ])),
    'top-customer' => fn () => $controller->topCustomerExport(new Request([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ])),
    'transaction-distribution' => fn () => $controller->transactionDistributionExport(new Request([
        'date_from' => $dateFrom,
        'date_to' => $dateTo,
    ])),
];

foreach ($reports as $name => $render) {
    $response = $render();
    file_put_contents(__DIR__ . "/{$name}.pdf", $response->getContent());
    echo "{$name}.pdf\n";
}
