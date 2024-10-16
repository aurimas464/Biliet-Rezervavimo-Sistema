<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class TicketController extends Controller
{
    public function getAll()
    {
        $tickets = DB::select('SELECT * FROM tickets');
        return response()->json($tickets, 200);
    }

    public function get($id)
    {
        $ticket = DB::select('SELECT * FROM tickets WHERE id = ?', [$id]);

        if (empty($ticket)) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        return response()->json($ticket[0], 200);
    }

    public function create(Request $request)
    {
        $requiredFields = [
            'event_id',
            'user_id',
            'purchase_date',
            'price',
        ];

        $missingFields = array_diff($requiredFields, array_keys($request->all()));
        if (!empty($missingFields)) {
            return response()->json([
                'message' => 'Bad Request.',
                'missing_fields' => $missingFields
            ], 400);
        }

        $validator = Validator::make($request->all(), [
            'id' => 'nullable|integer',
            'event_id' => 'exists:events,id',
            'user_id' => 'integer',
            'status' => 'string|in:active,inactive,cancelled',
            'purchase_date' => 'date',
            'seat_number' => 'nullable|string|max:10',
            'price' => 'numeric|min:0',
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
            $existingPlace = DB::table('tickets')->where('id', $data['id'])->first();
            if ($existingPlace) {
                return response()->json([
                    'message' => 'Conflict: A ticket with the given id already exists.',
                    'id' => $data['id']
                ], 409);
            }

            $sql = "INSERT INTO tickets (id, event_id, user_id, status, purchase_date, seat_number, price, created_at, updated_at) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";

            DB::insert($sql, [
                $data['id'], 
                $data['event_id'], 
                $data['user_id'], 
                $data['status'], 
                $data['purchase_date'], 
                $data['seat_number'] ?? null, 
                $data['price']
            ]);
        } else {
            $sql = "INSERT INTO tickets (event_id, user_id, status, purchase_date, seat_number, price, created_at, updated_at) 
                            VALUES (?, ?, ?, ?, ?, ?, NOW(), NOW())";
            DB::insert($sql, [
                $data['event_id'], 
                $data['user_id'], 
                $data['status'], 
                $data['purchase_date'], 
                $data['seat_number'] ?? null, 
                $data['price']
            ]);
        }

        return response()->json([
            'message' => 'Ticket created successfully',
            'data' => $data,
        ], 201);
    }

    public function update(Request $request, $id)
    {
        $ticket = DB::select('SELECT * FROM tickets WHERE id = ?', [$id]);

        if (empty($ticket)) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        $validatedData = $request->validate([
            'event_id' => 'exists:events,id',
            'user_id' => 'integer',
            'status' => 'nullable|string|in:active,inactive,cancelled',
            'purchase_date' => 'date',
            'seat_number' => 'nullable|string|max:10',
            'price' => 'numeric|min:0',
        ]);

        $sql = "UPDATE tickets 
                SET event_id = ?, user_id = ?, status = ?, purchase_date = ?, seat_number = ?, price = ?, updated_at = NOW()
                WHERE id = ?";

        DB::update($sql, [
            $validatedData['event_id'] ?? $ticket[0]->event_id,
            $validatedData['user_id'] ?? $ticket[0]->user_id,
            $validatedData['status'] ?? $ticket[0]->status,
            $validatedData['purchase_date'] ?? $ticket[0]->purchase_date,
            $validatedData['seat_number'] ?? $ticket[0]->seat_number,
            $validatedData['price'] ?? $ticket[0]->price,
            $id
        ]);

        return response()->json(['message' => 'Ticket updated successfully'], 200);
    }

    public function delete($id)
    {
        $ticket = DB::select('SELECT * FROM tickets WHERE id = ?', [$id]);

        if (empty($ticket)) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        DB::delete('DELETE FROM tickets WHERE id = ?', [$id]);

        return response()->json(null, 204);
    }
}