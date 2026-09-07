<?php

use App\Models\QrPrint;
use App\Models\PrintDocument;
use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

test('guest can access print page with token', function () {
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Test Cafe',
        'print_token' => 'test-print-token-123',
        'is_active' => true,
    ]);

    $response = $this->get(route('qr-print.print', 'test-print-token-123'));
    $response->assertOk();
});

test('guest receives 403 if qr print point is inactive', function () {
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Inactive Cafe',
        'print_token' => 'inactive-token-123',
        'is_active' => false,
    ]);

    $response = $this->postJson(route('qr-print.upload-multi', 'inactive-token-123'), [
        'documents' => [UploadedFile::fake()->create('doc.pdf', 100, 'application/pdf')],
    ]);

    $response->assertStatus(403);
});

test('guest can upload multiple documents of various formats to upload-multi', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Test Cafe Multi',
        'print_token' => 'test-upload-token-multi',
        'is_active' => true,
    ]);

    $file1 = UploadedFile::fake()->create('document1.pdf', 500, 'application/pdf');
    $file2 = UploadedFile::fake()->image('photo1.jpg');
    $file3 = UploadedFile::fake()->create('sheet1.xlsx', 200, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    $file4 = UploadedFile::fake()->create('word1.docx', 200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
    $file5 = UploadedFile::fake()->create('slides1.pptx', 200, 'application/vnd.openxmlformats-officedocument.presentationml.presentation');
    $file6 = UploadedFile::fake()->create('data1.csv', 50, 'text/csv');

    $response = $this->postJson(route('qr-print.upload-multi', 'test-upload-token-multi'), [
        'documents' => [$file1, $file2, $file3, $file4, $file5, $file6],
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    $docs = $response->json('documents');
    expect($docs)->toHaveCount(6);
    expect(PrintDocument::where('qr_print_id', $qrPrint->id)->count())->toBe(6);
});

test('guest can upload single document via document or file field', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Single Upload Cafe',
        'print_token' => 'test-upload-single',
        'is_active' => true,
    ]);

    $file = UploadedFile::fake()->create('single_doc.pdf', 300, 'application/pdf');

    $response = $this->postJson(route('qr-print.upload-multi', 'test-upload-single'), [
        'document' => $file,
    ]);

    $response->assertOk()
        ->assertJson([
            'success' => true,
        ]);

    expect($response->json('documents'))->toHaveCount(1);
    expect($response->json('documents.0.original_name'))->toBe('single_doc.pdf');
});

test('upload-multi rejects empty file request with 422', function () {
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Empty Upload Cafe',
        'print_token' => 'test-upload-empty',
        'is_active' => true,
    ]);

    $response = $this->postJson(route('qr-print.upload-multi', 'test-upload-empty'), []);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});

test('upload-multi rejects unsupported file formats gracefully', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => (string) Illuminate\Support\Str::uuid(),
        'title' => 'Invalid Format Cafe',
        'print_token' => 'test-upload-invalid-format',
        'is_active' => true,
    ]);

    $badFile = UploadedFile::fake()->create('malicious.exe', 100, 'application/x-msdownload');

    $response = $this->postJson(route('qr-print.upload-multi', 'test-upload-invalid-format'), [
        'documents' => [$badFile],
    ]);

    $response->assertStatus(422)
        ->assertJson([
            'success' => false,
        ]);
});

test('upload-multi auto heals missing qr print uuid', function () {
    Storage::fake('public');

    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'uuid' => '', // empty uuid
        'title' => 'Auto Heal Cafe',
        'print_token' => 'test-upload-auto-heal',
        'is_active' => true,
    ]);

    $file = UploadedFile::fake()->create('heal_test.pdf', 100, 'application/pdf');

    $response = $this->postJson(route('qr-print.upload-multi', 'test-upload-auto-heal'), [
        'documents' => [$file],
    ]);

    $response->assertOk();
    $qrPrint->refresh();
    expect($qrPrint->uuid)->not->toBeEmpty();
});

test('qr code generation embeds live production domain rather than local ip', function () {
    $owner = User::factory()->create();
    $qrPrint = QrPrint::create([
        'user_id' => $owner->id,
        'title' => 'Live Cafe',
        'print_token' => 'live-shop-token-999',
        'is_active' => true,
    ]);

    expect($qrPrint->public_print_url)->toBe(rtrim(config('app.url'), '/') . '/print/live-shop-token-999');

    $response = $this->actingAs($owner)->get(route('qr-print.qr', $qrPrint));
    $response->assertOk();
    $response->assertHeader('Content-Type', 'image/svg+xml');
});
