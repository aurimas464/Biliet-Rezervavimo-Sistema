<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use App\Enums\UserRole;

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

    public function getMyEvents(Request $request)
    {
        $user = $request->user(); // Ensure the user is authenticated
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $events = DB::table('events')
            ->where('user_id', $user->id)
            ->select(
                'id as eventID',
                'name as eventName',
                'start_date',
                'start_time',
                'end_date',
                'end_time',
                'place_id as placeID'
            )
            ->get();

        return response()->json($events, 200);
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
            'user_id' => 'required|integer',
        ]);

        $userExists = DB::table('users')->where('id', $request->user_id)->exists();
        if (!$userExists) {
            return response()->json(['message' => 'User not found.'], 404);
        }
    
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
                    'message' => 'Conflict: An event with the given ID already exists.',
                    'id' => $data['id']
                ], 409);
            }
        }
    
        DB::table('events')->insert([
            'id' => $data['id'] ?? null,
            'name' => $data['name'],
            'start_date' => $data['start_date'],
            'start_time' => $data['start_time'],
            'end_date' => $data['end_date'],
            'end_time' => $data['end_time'],
            'place_id' => $data['place_id'],
            'user_id' => $data['user_id'],
            'price' => $data['price'],
            'max_tickets' => $data['max_tickets'],
            'description' => $data['description'] ?? null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    
        return response()->json([
            'message' => 'Event created successfully',
            'data' => $data,
        ], 201);
    }

    public function update(Request $request, $vietaID, $renginysID)
    {
        $user = $request->user(); // Retrieve the authenticated user


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
    
        if ($user->role == UserRole::ORGANIZER) {
            if ($event[0]->user_id != $user->id) {
                return response()->json(['message' => 'Forbidden: Access denied.'], 403);
            }
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
            'user_id' => 'integer',
        ]);
        
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }
    
        $validatedData = $validator->validated();
    
        DB::table('events')
            ->where('place_id', $vietaID)
            ->where('id', $renginysID)
            ->update([
                'name' => $validatedData['name'] ?? $event[0]->name,
                'start_date' => $validatedData['start_date'] ?? $event[0]->start_date,
                'start_time' => $validatedData['start_time'] ?? $event[0]->start_time,
                'end_date' => $validatedData['end_date'] ?? $event[0]->end_date,
                'end_time' => $validatedData['end_time'] ?? $event[0]->end_time,
                'price' => $validatedData['price'] ?? $event[0]->price,
                'max_tickets' => $validatedData['max_tickets'] ?? $event[0]->max_tickets,
                'description' => $validatedData['description'] ?? $event[0]->description,
                'user_id' => $validatedData['user_id'] ?? $event[0]->user_id,
                'updated_at' => now(),
            ]);
    
        return response()->json(['message' => 'Event updated successfully'], 200);
    }

    public function delete($vietaID, $renginysID)
    {
        $user = request()->user(); // Retrieve the authenticated user

        $event = DB::select('SELECT * FROM events WHERE place_id = ? AND id = ?', [$vietaID, $renginysID]);
        if (empty($event)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        if ($user->role == UserRole::ORGANIZER) {
            if ($event[0]->user_id != $user->id) {
                return response()->json(['message' => 'Forbidden: Access denied.'], 403);
            }
        }

        DB::delete('DELETE FROM tickets WHERE event_id = ?', [$renginysID]);
        DB::delete('DELETE FROM events WHERE place_id = ? AND id = ?', [$vietaID, $renginysID]);

        return response()->json(null, 204);
    }
}