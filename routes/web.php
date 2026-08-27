<?php

use App\Http\Controllers\CategoryController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\ProductController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\QrPrintController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PrinterController;
use App\Http\Controllers\ShopSettingController;
use App\Http\Controllers\PrintJobHistoryController;
use App\Http\Controllers\Api\PrintAgentController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\PublicPageController;
use App\Http\Controllers\ShopRegistrationController;

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
    // Shop Registration & Onboarding routes
    Route::get('shop/register', [ShopRegistrationController::class, 'create'])->name('shop.register');
    Route::post('shop/register', [ShopRegistrationController::class, 'store'])->name('shop.register.store');
    Route::get('shop/dashboard', [DashboardController::class, 'index'])->name('shop.dashboard');

    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::post('dashboard/toggle-qr', [DashboardController::class, 'toggleQr'])->name('dashboard.toggle-qr');
    Route::post('dashboard/update-profile', [DashboardController::class, 'updateProfile'])->name('dashboard.update-profile');
    Route::post('dashboard/job/{job}/retry', [DashboardController::class, 'retryJob'])->name('dashboard.job.retry');
    Route::post('dashboard/session/{session}/collect-payment', [DashboardController::class, 'collectPayment'])->name('dashboard.session.collect-payment');
    Route::post('dashboard/job/{job}/cancel', [DashboardController::class, 'cancelJob'])->name('dashboard.job.cancel');
    Route::post('dashboard/job/{job}/close', [DashboardController::class, 'closeJob'])->name('dashboard.job.close');
    Route::get('dashboard/qr/print', [DashboardController::class, 'printPoster'])->name('dashboard.qr.print');

    // Print Job History & Management routes
    Route::get('shop/jobs', [PrintJobHistoryController::class, 'index'])->name('shop.jobs.index');
    Route::post('shop/jobs/{job}/retry', [PrintJobHistoryController::class, 'retry'])->name('shop.jobs.retry');
    Route::post('shop/jobs/{job}/cancel', [PrintJobHistoryController::class, 'cancel'])->name('shop.jobs.cancel');
    Route::post('shop/jobs/{job}/close', [PrintJobHistoryController::class, 'close'])->name('shop.jobs.close');
    Route::post('shop/jobs/bulk-action', [PrintJobHistoryController::class, 'bulkAction'])->name('shop.jobs.bulk-action');

    // Shop Settings hub routes
    Route::get('shop/settings', [ShopSettingController::class, 'index'])->name('shop.settings.index');
    Route::post('shop/settings/profile', [ShopSettingController::class, 'updateProfile'])->name('shop.settings.profile.update');
    Route::post('shop/settings/printer', [ShopSettingController::class, 'updatePrinter'])->name('shop.settings.printer.update');
    Route::post('shop/settings/pricing', [ShopSettingController::class, 'updatePricing'])->name('shop.settings.pricing.update');
    Route::post('shop/settings/payment', [ShopSettingController::class, 'updatePayment'])->name('shop.settings.payment.update');
    Route::get('shop/settings/auto-detect-printers', [ShopSettingController::class, 'autoDetectPrinters'])->name('shop.settings.auto-detect-printers');
    Route::get('shop/settings/printer-status', [ShopSettingController::class, 'printerStatus'])->name('shop.settings.printer-status');
    Route::post('shop/settings/print-test', [ShopSettingController::class, 'printTest'])->name('shop.settings.print-test');

    // Printers settings routes
    Route::get('shop/printers', [PrinterController::class, 'index'])
        ->name('shop.printers.index')
        ->middleware('permission:printer.view');
    Route::get('shop/printers/{printer}/settings', [PrinterController::class, 'settings'])
        ->name('shop.printers.settings')
        ->middleware('permission:printer.settings');
    Route::patch('shop/printers/{printer}/settings', [PrinterController::class, 'updateSettings'])
        ->name('shop.printers.settings.update')
        ->middleware('permission:printer.settings');
    Route::post('shop/printers/{printer}/test', [PrinterController::class, 'testPrint'])
        ->name('shop.printers.test-print')
        ->middleware('permission:printer.test');
    Route::post('shop/printers/{printer}/test-connection', [PrinterController::class, 'testConnection'])
        ->name('shop.printers.test-connection')
        ->middleware('permission:printer.test');
    Route::post('shop/printers/{printer}/set-default', [PrinterController::class, 'setDefault'])
        ->name('shop.printers.set-default')
        ->middleware('permission:printer.set_default');
    Route::post('shop/printers/{printer}/activate', [PrinterController::class, 'activate'])
        ->name('shop.printers.activate')
        ->middleware('permission:printer.delete');
    Route::post('shop/printers/{printer}/deactivate', [PrinterController::class, 'deactivate'])
        ->name('shop.printers.deactivate')
        ->middleware('permission:printer.delete');

    Route::resource('products', ProductController::class)->middleware('permission:access-products-module');
    Route::resource('categories', CategoryController::class)->middleware('permission:access-categories-module');
    Route::resource('permissions', PermissionController::class)->middleware('permission:access-permissions-module');
    Route::resource('roles', RoleController::class)->middleware('permission:access-roles-module');
    Route::resource('users', UserController::class)->middleware('permission:access-users-module');

    // CMS Pages Management
    Route::post('pages/{page}/toggle-status', [PageController::class, 'toggleStatus'])
        ->name('pages.toggle-status')
        ->middleware('permission:page.publish');
    Route::resource('pages', PageController::class)->except(['show'])->middleware('permission:access-pages-module');

    // Menus Management
    Route::get('menus', [MenuController::class, 'index'])
        ->name('menus.index')
        ->middleware('permission:access-menus-module');
    Route::post('menus/items', [MenuController::class, 'storeItem'])
        ->name('menus.items.store')
        ->middleware('permission:menu.create');
    Route::patch('menus/items/{item}', [MenuController::class, 'updateItem'])
        ->name('menus.items.update')
        ->middleware('permission:menu.edit');
    Route::delete('menus/items/{item}', [MenuController::class, 'destroyItem'])
        ->name('menus.items.destroy')
        ->middleware('permission:menu.delete');
    Route::post('menus/reorder', [MenuController::class, 'reorderItems'])
        ->name('menus.items.reorder')
        ->middleware('permission:menu.edit');

    Route::get('qr-print', [QrPrintController::class, 'index'])
        ->name('qr-print.index');

    Route::post('qr-print', [QrPrintController::class, 'store'])
        ->name('qr-print.store');

    Route::get('qr-print/{qrPrint}/qr', [QrPrintController::class, 'qr'])
        ->name('qr-print.qr');
});

// Dynamic Public CMS Pages
Route::get('/p/{slug}', [PublicPageController::class, 'show'])->name('pages.show');

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
