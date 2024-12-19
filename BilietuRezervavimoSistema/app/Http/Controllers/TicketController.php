<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Endroid\QrCode\Builder\Builder;
use Endroid\QrCode\Encoding\Encoding;
use Illuminate\Support\Facades\Response;
use App\Enums\UserRole;

class TicketController extends Controller
{
    public function getAll($vietaID, $renginysID)
    {
        $event = DB::select('SELECT * FROM events WHERE id = ? AND place_id = ?', [$renginysID, $vietaID]);
        if (empty($event)) {
            return response()->json(['message' => 'Event not found for the specified place.'], 404);
        }
        $tickets = DB::select('SELECT * FROM tickets WHERE event_id = ?', [$renginysID]);

        return response()->json($tickets, 200);
    }

    public function getTicketCount($vietaID, $renginysID)
    {
        $event = DB::select('SELECT * FROM events WHERE id = ? AND place_id = ?', [$renginysID, $vietaID]);
        if (empty($event)) {
            return response()->json(['message' => 'Event not found for the specified place.'], 404);
        }
    
        $ticketCount = DB::table('tickets')
            ->where('event_id', $renginysID)
            ->where('status', '!=', 'cancelled')
            ->count();
    
        return response()->json([
            'current_ticket_count' => $ticketCount,
            'max_tickets' => $event[0]->max_tickets,
        ], 200);
    }

    public function getMyTickets(Request $request)
    {
        // Get the authenticated user
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
    
        $userId = $user->id;
    
        // Fetch tickets owned by the user, including place and event details
        $tickets = DB::table('tickets')
            ->join('events', 'tickets.event_id', '=', 'events.id')
            ->join('places', 'events.place_id', '=', 'places.id')
            ->where('tickets.user_id', $userId)
            ->select(
                'tickets.id as ticketID',
                'tickets.status',
                'tickets.seat_number',
                'places.id as placeID',
                'places.name as place_name',
                'places.address',
                'places.city',
                'places.postal_code',
                'places.country',
                'events.id as eventID',
                'events.name as event_name',
                'events.start_date',
                'events.start_time',
                'events.end_date',
                'events.end_time'
            )
            ->get();
    
        // Return the structured response
        return response()->json($tickets, 200);
    }

    public function get($vietaID, $renginysID, $bilietasID)
    {
        $user = request()->user(); // Retrieve the authenticated user from the request
    
        // Check if the event exists and belongs to the specified place
        $event = DB::select('SELECT * FROM events WHERE id = ? AND place_id = ?', [$renginysID, $vietaID]);
        if (empty($event)) {
            return response()->json(['message' => 'Event not found for the specified place.'], 404);
        }
    
        // Check if the ticket exists for the specified event
        $ticket = DB::select('SELECT * FROM tickets WHERE event_id = ? AND id = ?', [$renginysID, $bilietasID]);
        if (empty($ticket)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }
    
        // Role-based logic
        if ($user->role == UserRole::USER) {
            // Check if the ticket belongs to the authenticated user
            if ($ticket[0]->user_id != $user->id) {
                return response()->json(['message' => 'Forbidden: Access denied.'], 403);
            }
        } elseif ($user->role == UserRole::ORGANIZER) {
            // Check if the event belongs to the authenticated organizer
            $organizerEvent = DB::select('SELECT * FROM events WHERE id = ? AND user_id = ?', [$renginysID, $user->id]);
            if (empty($organizerEvent)) {
                if ($ticket[0]->user_id != $user->id) {
                    return response()->json(['message' => 'Forbidden: Access denied.'], 403);
                }
                return response()->json(['message' => 'Forbidden: Access denied.'], 403);
            }
        }
    
        // Return the ticket if the user has access
        return response()->json($ticket[0], 200);
    }

    public function create(Request $request, $vietaID, $renginysID)
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE || is_null($data)) {
            return response()->json([
                'message' => 'Invalid JSON format.'
            ], 400);
        }

        $event = DB::select('SELECT * FROM events WHERE id = ? AND place_id = ?', [$renginysID, $vietaID]);
        if (empty($event)) {
            return response()->json(['message' => 'Event not found for the specified place.'], 404);
        }



        $validator = Validator::make($request->all(), [
            'id' => 'nullable|integer',
            'user_id' => 'required|integer',
            'status' => 'string|in:active,inactive,cancelled',
            'purchase_date' => 'required|date',
            'seat_number' => 'nullable|string|max:10',
            'price' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $userExists = DB::table('users')->where('id', $request->user_id)->exists();
        if (!$userExists) {
            return response()->json(['message' => 'User not found.'], 404);
        }

        $data = $validator->validated();
        $data['event_id'] = $renginysID;

        if (isset($data['id'])) {
            $existingTicket = DB::table('tickets')->where('id', $data['id'])->first();
            if ($existingTicket) {
                return response()->json([
                    'message' => 'Conflict: A ticket with the given ID already exists.',
                    'id' => $data['id']
                ], 409);
            }

            $sql = "INSERT INTO tickets (id, event_id, user_id, status, purchase_date, seat_number, price, created_at, updated_at) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())";
            DB::insert($sql, [
                $data['id'],
                $data['event_id'],
                $data['user_id'],
                $data['status'] ?? 'active',
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
                $data['status'] ?? 'active',
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

    public function update(Request $request, $vietaID, $renginysID, $bilietasID)
    {
        $data = json_decode($request->getContent(), true);
        if (json_last_error() !== JSON_ERROR_NONE || is_null($data)) {
            return response()->json([
                'message' => 'Invalid JSON format.'
            ], 400);
        }
    
        $event = DB::select('SELECT * FROM events WHERE id = ? AND place_id = ?', [$renginysID, $vietaID]);
        if (empty($event)) {
            return response()->json(['message' => 'Event not found for the specified place.'], 404);
        }
    
        $ticket = DB::select('SELECT * FROM tickets WHERE event_id = ? AND id = ?', [$renginysID, $bilietasID]);
        if (empty($ticket)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }
    
        $validator = Validator::make($request->all(), [
            'user_id' => 'integer',
            'status' => 'string|in:active,inactive,cancelled',
            'purchase_date' => 'date',
            'seat_number' => 'nullable|string|max:10',
            'price' => 'numeric|min:0',
        ]);
    
        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed.',
                'errors' => $validator->errors(),
            ], 422);
        }

        $validatedData = $validator->validated();

        if (isset($validatedData['user_id'])) {
            $userExists = DB::table('users')->where('id', operator: $validatedData['user_id'])->exists();
            if (!$userExists) {
                return response()->json(['message' => 'User not found.'], 404);
            }
        }

        $sql = "UPDATE tickets 
                SET user_id = ?, status = ?, purchase_date = ?, seat_number = ?, price = ?, updated_at = NOW()
                WHERE event_id = ? AND id = ?";
    
        DB::update($sql, [
            $validatedData['user_id'] ?? $ticket[0]->user_id,
            $validatedData['status'] ?? $ticket[0]->status,
            $validatedData['purchase_date'] ?? $ticket[0]->purchase_date,
            $validatedData['seat_number'] ?? $ticket[0]->seat_number,
            $validatedData['price'] ?? $ticket[0]->price,
            $renginysID,
            $bilietasID
        ]);
    
        return response()->json(['message' => 'Ticket updated successfully'], 200);
    }

    public function delete($vietaID, $renginysID, $bilietasID)
    {
        $event = DB::select('SELECT * FROM events WHERE id = ? AND place_id = ?', [$renginysID, $vietaID]);
        if (empty($event)) {
            return response()->json(['message' => 'Event not found for the specified place.'], 404);
        }
        $ticket = DB::select('SELECT * FROM tickets WHERE event_id = ? AND id = ?', [$renginysID, $bilietasID]);
        if (empty($ticket)) {
            return response()->json(['message' => 'Resource not found.'], 404);
        }

        DB::delete('DELETE FROM tickets WHERE event_id = ? AND id = ?', [$renginysID, $bilietasID]);

        return response()->json(null, 204);
    }
}