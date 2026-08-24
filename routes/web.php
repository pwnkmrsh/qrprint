<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\QrPrintController;
use App\Http\Controllers\Api\PrintAgentController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::get('/privacy-policy', function () {
    return Inertia::render('privacy-policy');
})->name('privacy-policy');

Route::get('/terms-of-service', function () {
    return Inertia::render('terms-of-service');
})->name('terms-of-service');

Route::get('/security-declaration', function () {
    return Inertia::render('security-declaration');
})->name('security-declaration');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::resource('products', ProductController::class)->middleware('permission:access-products-module');
    Route::resource('categories', CategoryController::class)->middleware('permission:access-categories-module');
    Route::resource('permissions', PermissionController::class)->middleware('permission:access-permissions-module');
    Route::resource('roles', RoleController::class)->middleware('permission:access-roles-module');
    Route::resource('users', UserController::class)->middleware('permission:access-users-module');
    Route::get('qr-print', [QrPrintController::class, 'index'])
        ->name('qr-print.index');

    Route::post('qr-print', [QrPrintController::class, 'store'])
        ->name('qr-print.store');

    Route::get('qr-print/{qrPrint}/qr', [QrPrintController::class, 'qr'])
        ->name('qr-print.qr');
});

/*
|--------------------------------------------------------------------------
| Public QR Print URL
|--------------------------------------------------------------------------
*/

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';

Route::get('/s/{token}', [QrPrintController::class, 'shop'])->name('customer.shop');
Route::get('/s/{token}/upload', [QrPrintController::class, 'customerUpload'])->name('customer.upload');
Route::post('/s/{token}/upload', [QrPrintController::class, 'customerStoreUpload'])->name('customer.upload.store');
Route::get('/s/{token}/configure', [QrPrintController::class, 'customerConfigure'])->name('customer.configure');
Route::post('/s/{token}/estimate', [QrPrintController::class, 'estimate'])->name('customer.estimate');
Route::get('/s/{token}/payment', [QrPrintController::class, 'customerPayment'])->name('customer.payment');
Route::post('/s/{token}/checkout', [QrPrintController::class, 'customerCheckout'])->name('customer.checkout');
Route::get('/s/{token}/status/{job}', [QrPrintController::class, 'customerStatus'])->name('customer.status');
Route::get('/s/{token}/job-status/{job}', [QrPrintController::class, 'customerJobStatus'])->name('customer.job-status');

Route::get('/print/{token}', [QrPrintController::class, 'print'])->name('qr-print.print');
Route::post('/print/{token}/upload-multi', [QrPrintController::class, 'uploadMulti'])->name('qr-print.upload-multi');
Route::post('/print/{token}/session/create', [QrPrintController::class, 'createSession'])->name('qr-print.session.create');
Route::get('/print/{token}/session/{session}', [QrPrintController::class, 'sessionStatus'])->name('qr-print.session.status');
Route::get('/print/{token}/session/{session}/api', [QrPrintController::class, 'sessionStatusApi'])->name('qr-print.session.api');
Route::post('/print/{token}/job/retry', [QrPrintController::class, 'retryJob'])->name('qr-print.job.retry');

Route::get(
    '/print/{token}/content',
    [QrPrintController::class, 'printContent']
)->name('qr-print.content');

Route::post(
    '/print/{token}/upload',
    [QrPrintController::class, 'upload']
)->name('qr-print.upload');

Route::post(
    '/qr-print/{qrPrint}/printed',
    [QrPrintController::class, 'printed']
)->name('qr-print.printed');

Route::get(
    '/print/{token}/document/{document}',
    [QrPrintController::class, 'document']
)->name('qr-print.document');


Route::prefix('print-agent')->group(function () {

    Route::get('/jobs/{job}/status', [PrintAgentController::class, 'status'])
        ->name('print-agent.status');
});
