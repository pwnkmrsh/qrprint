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

Route::get(
    '/print/{token}',
    [QrPrintController::class, 'print']
)->name('qr-print.print');

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
