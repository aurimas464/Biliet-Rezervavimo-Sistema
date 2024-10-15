<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\PlaceController;
use App\Http\Controllers\EventController;
use App\Http\Controllers\TicketController;

// Routes for Places (Vietos)
Route::get('/vieta/{id}', [PlaceController::class, 'get']);
Route::post('/vieta', [PlaceController::class, 'create']);
Route::put('/vieta/{id}', [PlaceController::class, 'update']);
Route::delete('/vieta/{id}', [PlaceController::class, 'delete']);
Route::get('/vietos', [PlaceController::class, 'getAll']);

// Routes for Events (Renginiai)
Route::get('/renginys/{id}', [EventController::class, 'get']);
Route::post('/renginys', [EventController::class, 'create']);
Route::put('/renginys/{id}', [EventController::class, 'update']);
Route::delete('/renginys/{id}', [EventController::class, 'delete']);
Route::get('/renginiai', [EventController::class, 'getAll']);
Route::get('/vieta/{id}/renginiai', [EventController::class, 'getEventsByPlace']);

// Routes for Tickets (Bilietai)
Route::get('/bilietas/{id}', [TicketController::class, 'get']);
Route::post('/bilietas', [TicketController::class, 'create']);
Route::put('/bilietas/{id}', [TicketController::class, 'update']);
Route::delete('/bilietas/{id}', [TicketController::class, 'delete']);
Route::get('/bilietai', [TicketController::class, 'getAll']);

// Fallback route (404)
Route::fallback(function () {
    return response()->json(['message' => 'Resource not found.'], 404);
});