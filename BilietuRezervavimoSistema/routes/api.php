<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TicketController;

// Routes for Places (Vietos)
Route::get('/vieta', [PlaceController::class, 'getAll']);
Route::get('/vieta/{vietaID}', [PlaceController::class, 'get']);
Route::post('/vieta', [PlaceController::class, 'create']);
Route::patch('/vieta/{vietaID}', [PlaceController::class, 'update']);
Route::delete('/vieta/{vietaID}', [PlaceController::class, 'delete']);

// Routes for Events (Renginiai)
Route::get('/vieta/{vietaID}/renginys', [EventController::class, 'getAll']);
Route::get('/vieta/{vietaID}/renginys/{renginysID}', [EventController::class, 'get']);
Route::post('/vieta/{vietaID}/renginys', [EventController::class, 'create']);
Route::patch('/vieta/{vietaID}/renginys/{renginysID}', [EventController::class, 'update']);
Route::delete('/vieta/{vietaID}/renginys/{renginysID}', [EventController::class, 'delete']);

// Routes for Tickets (Bilietai)
Route::get('/vieta/{vietaID}/renginys/{renginysID}/bilietas', [TicketController::class, 'getAll']);
Route::get('/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}', [TicketController::class, 'get']);
Route::post('/vieta/{vietaID}/renginys/{renginysID}/bilietas', [TicketController::class, 'create']);
Route::patch('/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}', [TicketController::class, 'update']);
Route::delete('/vieta/{vietaID}/renginys/{renginysID}/bilietas/{bilietasID}', [TicketController::class, 'delete']);

// Fallback route (404)
Route::fallback(function () {
    return response()->json(['message' => 'Resource not found.'], 404);
});