<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class EventController extends Controller
{
    public function getAll($vietaID)
    {
        $events = DB::select('SELECT * FROM events WHERE place_id = ?', [$vietaID]);
        return response()->json($events, 200);
    }

    public function get($vietaID, $renginysID)
    {
        $event = DB::select('SELECT * FROM events WHERE place_id = ? AND id = ?', [$vietaID, $renginysID]);
        if (empty($event)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        return response()->json($event[0], 200);
    }

    public function create(Request $request, $vietaID)
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE || is_null($data)) {
            return response()->json([
                'message' => 'Invalid JSON format.'
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'id' => 'nullable|integer',
            'name' => 'required|string|max:191',
            'start_date' => 'required|date',
            'start_time' => 'required|date_format:H:i',
            'end_date' => 'required|date',
            'end_time' => 'required|date_format:H:i',
            'price' => 'required|numeric|min:0',
            'max_tickets' => 'required|integer|min:1',
            'description' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $data['place_id'] = $vietaID;

        if (isset($data['id'])) {
            $existingEvent = DB::table('events')->where('id', $data['id'])->first();
            if ($existingEvent) {
                return response()->json([
                    'message' => 'Conflict: An event with the given id already exists.',
                    'id' => $data['id']
                ], 409);
            }

            $sql = "INSERT INTO events (id, name, start_date, start_time, end_date, end_time, place_id, price, max_tickets, description, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            DB::insert($sql, [
                $data['id'],
                $data['name'],
                $data['start_date'],
                $data['start_time'],
                $data['end_date'],
                $data['end_time'],
                $data['place_id'],
                $data['price'],
                $data['max_tickets'],
                $data['description'] ?? null,
            ]);
        } else {
            $sql = "INSERT INTO events (name, start_date, start_time, end_date, end_time, place_id, price, max_tickets, description, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            DB::insert($sql, [
                $data['name'],
                $data['start_date'],
                $data['start_time'],
                $data['end_date'],
                $data['end_time'],
                $data['place_id'],
                $data['price'],
                $data['max_tickets'],
                $data['description'] ?? null,
            ]);
        }

        return response()->json([
            'message' => 'Event created successfully',
            'data' => $data,
        ], 201);
    }

    public function update(Request $request, $vietaID, $renginysID)
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE || is_null($data)) {
            return response()->json([
                'message' => 'Invalid JSON format.'
            ], 400);
        }
    
        $event = DB::select('SELECT * FROM events WHERE place_id = ? AND id = ?', [$vietaID, $renginysID]);
        if (empty($event)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }
    
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:191',
            'start_date' => 'date',
            'start_time' => 'date_format:H:i',
            'end_date' => 'date',
            'end_time' => 'date_format:H:i',
            'price' => 'numeric|min:0',
            'max_tickets' => 'integer|min:1',
            'description' => 'nullable|string',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }
    
        $validatedData = $validator->validated();
    
        $sql = "UPDATE events 
                SET name = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, price = ?, max_tickets = ?, description = ?, updated_at = NOW()
                WHERE place_id = ? AND id = ?";
    
        DB::update($sql, [
            $validatedData['name'] ?? $event[0]->name,
            $validatedData['start_date'] ?? $event[0]->start_date,
            $validatedData['start_time'] ?? $event[0]->start_time,
            $validatedData['end_date'] ?? $event[0]->end_date,
            $validatedData['end_time'] ?? $event[0]->end_time,
            $validatedData['price'] ?? $event[0]->price,
            $validatedData['max_tickets'] ?? $event[0]->max_tickets,
            $validatedData['description'] ?? $event[0]->description,
            $vietaID,
            $renginysID
        ]);
    
        return response()->json(['message' => 'Event updated successfully'], 200);
    }

    public function delete($vietaID, $renginysID)
    {
        $event = DB::select('SELECT * FROM events WHERE place_id = ? AND id = ?', [$vietaID, $renginysID]);
        if (empty($event)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        DB::delete('DELETE FROM tickets WHERE event_id = ?', [$renginysID]);
        DB::delete('DELETE FROM events WHERE place_id = ? AND id = ?', [$vietaID, $renginysID]);

        return response()->json(null, 204);
    }
}