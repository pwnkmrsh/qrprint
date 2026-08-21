<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\PrintAgentController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

Route::prefix('print-agent')->group(function () {

    Route::get('/jobs', [
        PrintAgentController::class,
        'jobs'
    ]);

    Route::post('/jobs/{job}/complete', [
        PrintAgentController::class,
        'complete'
    ]);

    Route::post('/jobs/{job}/failed', [
        PrintAgentController::class,
        'failed'
    ]);

    Route::get('/jobs/{uuid}/file', [
        PrintAgentController::class,
        'file'
    ])->name('print-agent.file');

    Route::get('/jobs/{job}/status', [
        PrintAgentController::class,
        'status'
    ])->name('print-agent.job.status');

    Route::post('/capabilities', [
        PrintAgentController::class,
        'capabilities'
    ])->name('print-agent.capabilities');
});
