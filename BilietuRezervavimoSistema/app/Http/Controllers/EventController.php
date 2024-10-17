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
            'start_date',
            'start_time',
            'end_date',
            'end_time',
            'place_id',
            'price',
            'max_tickets',
        ];
    
        $missingFields = array_diff($requiredFields, array_keys($request->all()));
        if (!empty($missingFields)) {
            return response()->json([
                'message' => 'Bad Request.',
                'missing_fields' => $missingFields,
            ], 400);
        }
    
        $validator = Validator::make($request->all(), [
            'id' => 'nullable|integer',
            'name' => 'string|max:191',
            'start_date' => 'date',
            'start_time' => 'date_format:H:i',
            'end_date' => 'date',
            'end_time' => 'date_format:H:i',
            'place_id' => 'exists:places,id',
            'price' => 'numeric|min:0',
            'max_tickets' => 'integer|min:1',
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
        }
        else{
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


    public function update(Request $request, $id)
    {
        $event = DB::select('SELECT * FROM events WHERE id = ?', [$id]);

        if (empty($event)) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'string|max:191',
            'start_date' => 'date',
            'start_time' => 'date_format:H:i',
            'end_date' => 'date',
            'end_time' => 'date_format:H:i',
            'place_id' => 'exists:places,id',
            'price' => 'numeric|min:0',
            'max_tickets' => 'integer|min:1',
            'description' => 'nullable|string',
        ]);

        $sql = "UPDATE events 
                SET name = ?, start_date = ?, start_time = ?, end_date = ?, end_time = ?, place_id = ?, price = ?, max_tickets = ?, description = ?, updated_at = NOW()
                WHERE id = ?";

        DB::update($sql, [
            $validatedData['name'] ?? $event[0]->name,
            $validatedData['start_date'] ?? $event[0]->start_date,
            $validatedData['start_time'] ?? $event[0]->start_time,
            $validatedData['end_date'] ?? $event[0]->end_date,
            $validatedData['end_time'] ?? $event[0]->end_time,
            $validatedData['place_id'] ?? $event[0]->place_id,
            $validatedData['price'] ?? $event[0]->price,
            $validatedData['max_tickets'] ?? $event[0]->max_tickets,
            $validatedData['description'] ?? $event[0]->description,
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

    public function getEventsByPlace($placeId)
    {
        $events = DB::select('SELECT * FROM events WHERE place_id = ?', [$placeId]);

        if (empty($events)) {
            return response()->json(['message' => 'No events found for this place.'], 404);
        }

        return response()->json($events, 200);
    }
}