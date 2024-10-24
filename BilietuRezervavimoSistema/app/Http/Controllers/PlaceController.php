<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PlaceController extends Controller
{
    public function getAll()
    {
        $places = DB::select('SELECT * FROM places');
        return response()->json($places, 200);
    }

    public function get($vietaID)
    {
        $place = DB::select('SELECT * FROM places WHERE id = ?', [$vietaID]);
        if (empty($place)) {
            return response()->json([
                'message' => 'Resource not found.'
            ], 404);
        }

        return response()->json($place[0], 200);
    }

    public function create(Request $request)
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
            'address' => 'required|string|max:191',
            'city' => 'required|string|max:191',
            'postal_code' => 'required|string|max:20',
            'country' => 'required|string|max:191',
            'capacity' => 'required|integer|min:1',
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
            $existingPlace = DB::table('places')->where('id', $data['id'])->first();
            if ($existingPlace) {
                return response()->json([
                    'message' => 'Conflict: A place with the given ID already exists.',
                    'id' => $data['id']
                ], 409);
            }

            $sql = "INSERT INTO places (id, name, address, city, postal_code, country, capacity, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            DB::insert($sql, [
                $data['id'],
                $data['name'],
                $data['address'],
                $data['city'],
                $data['postal_code'],
                $data['country'],
                $data['capacity']
            ]);
        } else {
            $sql = "INSERT INTO places (name, address, city, postal_code, country, capacity, created_at, updated_at) 
                    VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
            DB::insert($sql, [
                $data['name'],
                $data['address'],
                $data['city'],
                $data['postal_code'],
                $data['country'],
                $data['capacity']
            ]);
        }

        return response()->json([
            'message' => 'Place created successfully',
            'data' => $data
        ], 201);
    }

    public function update(Request $request, $vietaID)
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE || is_null($data)) {
            return response()->json([
                'message' => 'Invalid JSON format.'
            ], 400);
        }
    
        $place = DB::select('SELECT * FROM places WHERE id = ?', [$vietaID]);
        if (empty($place)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }
    
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:191',
            'address' => 'string|max:191',
            'city' => 'string|max:191',
            'postal_code' => 'string|max:20',
            'country' => 'string|max:191',
            'capacity' => 'integer|min:1',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }
    
        $validatedData = $validator->validated();
    
        $sql = "UPDATE places 
                SET name = ?, address = ?, city = ?, postal_code = ?, country = ?, capacity = ?, updated_at = NOW()
                WHERE id = ?";
    
        DB::update($sql, [
            $validatedData['name'] ?? $place[0]->name,
            $validatedData['address'] ?? $place[0]->address,
            $validatedData['city'] ?? $place[0]->city,
            $validatedData['postal_code'] ?? $place[0]->postal_code,
            $validatedData['country'] ?? $place[0]->country,
            $validatedData['capacity'] ?? $place[0]->capacity,
            $vietaID
        ]);
    
        return response()->json(['message' => 'Place updated successfully'], 200);
    }

    public function delete($vietaID)
    {
        $place = DB::select('SELECT * FROM places WHERE id = ?', [$vietaID]);
        if (empty($place)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        $events = DB::select('SELECT id FROM events WHERE place_id = ?', [$vietaID]);
        if (!empty($events)) {
            foreach ($events as $event) {
                DB::delete('DELETE FROM tickets WHERE event_id = ?', [$event->id]);
            }
            DB::delete('DELETE FROM events WHERE place_id = ?', [$vietaID]);
        }

        DB::delete('DELETE FROM places WHERE id = ?', [$vietaID]);

        return response()->json(null, 204);
    }
}
