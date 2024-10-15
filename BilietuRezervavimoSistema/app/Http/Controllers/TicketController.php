<?php

namespace App\Http\Controllers;

use App\Models\Ticket;
use Illuminate\Http\Request;

class TicketController extends Controller
{
    public function getAll()
    {
        $tickets = Ticket::all();
        return response()->json($tickets, 200);
    }

    public function get($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        return response()->json($ticket, 200);
    }

    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'event_id' => 'required|exists:events,id',
            'user_id' => 'required|exists:users,id',
            'status' => 'required|string|max:50',
            'seat_number' => 'nullable|string|max:10',
            'purchase_date' => 'required|date',
            'price' => 'required|numeric|min:0',
        ]);

        $ticket = Ticket::create($validatedData);

        return response()->json($ticket, 201);
    }

    public function update(Request $request, $id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        $validatedData = $request->validate([
            'status' => 'string|max:50',
            'seat_number' => 'nullable|string|max:10',
            'price' => 'numeric|min:0',
        ]);

        $ticket->update($validatedData);

        return response()->json($ticket, 200);
    }

    public function delete($id)
    {
        $ticket = Ticket::find($id);

        if (!$ticket) {
            return response()->json(['message' => 'Ticket not found.'], 404);
        }

        $ticket->delete();

        return response()->json(null, 204);
    }
}