<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function getAll()
    {
        $events = DB::select('SELECT * FROM events');
        return response()->json($events, 200);
    }

    public function get($id)
    {
        $event = DB::select('SELECT * FROM events WHERE id = ?', [$id]);

        if (empty($event)) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        return response()->json($event[0], 200);
    }

    public function create(Request $request)
    {
        $requiredFields = [
            'name',
            'date',
            'start_time',
            'end_time',
            'place_id',
            'price',
            'max_tickets',
            'status',
        ];
    
        $missingFields = array_diff($requiredFields, array_keys($request->all()));
        if (!empty($missingFields)) {
            return response()->json([
                'message' => 'Bad Request.',
                'missing_fields' => $missingFields,
            ], 400);
        }
    
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:191',
            'date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i',
            'place_id' => 'required|exists:places,id',
            'price' => 'required|numeric|min:0',
            'max_tickets' => 'required|integer|min:1',
            'status' => 'required|string|in:upcoming,ongoing,completed',
            'description' => 'nullable|string',
        ]);
    
        if ($validator->fails()) {
            \Log::info('Validation failed', $validator->errors()->toArray());
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }
    
        $data = $validator->validated();
    
        $sql = "INSERT INTO events (name, description, date, start_time, end_time, place_id, price, max_tickets, status, created_at, updated_at) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
    
        DB::insert($sql, [
            $data['name'],
            $data['description'] ?? null,
            $data['date'],
            $data['start_time'],
            $data['end_time'],
            $data['place_id'],
            $data['price'],
            $data['max_tickets'],
            $data['status'],
        ]);
    
        return response()->json([
            'message' => 'Event created successfully',
            'data' => $data,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $event = DB::select('SELECT * FROM events WHERE id = ?', [$id]);

        if (empty($event)) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'string|max:191',
            'date' => 'date',
            'start_time' => 'date_format:H:i',
            'end_time' => 'date_format:H:i',
            'place_id' => 'exists:places,id',
            'price' => 'numeric|min:0',
            'description' => 'nullable|string',
            'max_tickets' => 'integer|min:1',
            'status' => 'string|in:upcoming,ongoing,completed',
        ]);

        $sql = "UPDATE events 
                SET name = ?, description = ?, date = ?, start_time = ?, end_time = ?, place_id = ?, price = ?, max_tickets = ?, status = ?, updated_at = NOW()
                WHERE id = ?";

        DB::update($sql, [
            $validatedData['name'] ?? $event[0]->name,
            $validatedData['description'] ?? $event[0]->description,
            $validatedData['date'] ?? $event[0]->date,
            $validatedData['start_time'] ?? $event[0]->start_time,
            $validatedData['end_time'] ?? $event[0]->end_time,
            $validatedData['place_id'] ?? $event[0]->place_id,
            $validatedData['price'] ?? $event[0]->price,
            $validatedData['max_tickets'] ?? $event[0]->max_tickets,
            $validatedData['status'] ?? $event[0]->status,
            $id
        ]);

        return response()->json(['message' => 'Event updated successfully'], 200);
    }

    public function delete($id)
    {
        $event = DB::select('SELECT * FROM events WHERE id = ?', [$id]);

        if (empty($event)) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        DB::delete('DELETE FROM events WHERE id = ?', [$id]);

        return response()->json(null, 204);
    }
}