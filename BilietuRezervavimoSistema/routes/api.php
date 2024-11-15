<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TicketController;
use App\Http\Controllers\AuthController;

// Authentication Routes
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/refresh', [AuthController::class, 'refresh']);
Route::post('/logout', [AuthController::class, 'logout']);

// Guest Routes
Route::middleware(['checkToken', 'role:0'])->group(function () {
    Route::get('/vieta/{vietaID}/renginys', [EventController::class, 'getAll']);
    Route::get('/vieta/{vietaID}/renginys/{renginysID}', [EventController::class, 'get']);
});

// User Routes
Route::middleware(['checkToken', 'role:1'])->group(callback: function () {
    Route::get('/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}', [TicketController::class, 'get']);
    Route::patch('/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}', [TicketController::class, 'update']);
    Route::post('/vieta/{vietaID}/renginys/{renginysID}/bilietas', [TicketController::class, 'create']);
});

// Organizer Routes
Route::middleware(['checkToken', 'role:2'])->group(function () {
    Route::get('/vieta', [PlaceController::class, 'getAll']);
    Route::get('/vieta/{vietaID}', [PlaceController::class, 'get']);
    Route::post('/vieta/{vietaID}/renginys', [EventController::class, 'create']);
    Route::patch('/vieta/{vietaID}/renginys/{renginysID}', [EventController::class, 'update']);
    Route::delete('/vieta/{vietaID}/renginys/{renginysID}', [EventController::class, 'delete']);
});

// Administrator Routes
Route::middleware(['checkToken', 'role:3'])->group(function () {
    Route::get('/vieta/{vietaID}/renginys/{renginysID}/bilietas', [TicketController::class, 'getAll']);
    Route::post('/vieta', [PlaceController::class, 'create']);
    Route::patch('/vieta/{vietaID}', [PlaceController::class, 'update']);
    Route::delete('/vieta/{vietaID}', [PlaceController::class, 'delete']);
    Route::delete('/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}', [TicketController::class, 'delete']);
});

// Fallback route (404)
Route::fallback(function () {
    return response()->json(['message' => 'Resource not found.'], 404);
});