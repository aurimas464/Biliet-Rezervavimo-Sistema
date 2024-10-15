<?php

namespace App\Http\Controllers;

use App\Models\Event;
use Illuminate\Http\Request;

class EventController extends Controller
{
    public function getAll()
    {
        $events = Event::all();
        return response()->json($events, 200);
    }

    public function get($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        return response()->json($event, 200);
    }

    public function create(Request $request)
    {
        $validatedData = $request->validate([
            'name' => 'required|string|max:191',
            'date' => 'required|date',
            'time' => 'required|date_format:H:i',
            'place_id' => 'required|exists:places,id',
            'price' => 'required|numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'required|string|in:upcoming,ongoing,completed',
        ]);

        $event = Event::create($validatedData);

        return response()->json($event, 201);
    }

    public function update(Request $request, $id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'string|max:191',
            'date' => 'date',
            'time' => 'date_format:H:i',
            'place_id' => 'exists:places,id',
            'price' => 'numeric|min:0',
            'description' => 'nullable|string',
            'status' => 'string|in:upcoming,ongoing,completed',
        ]);

        $event->update($validatedData);

        return response()->json($event, 200);
    }

    public function delete($id)
    {
        $event = Event::find($id);

        if (!$event) {
            return response()->json(['message' => 'Event not found.'], 404);
        }

        $event->delete();

        return response()->json(null, 204);
    }

    public function getEventsByPlace($placeId)
    {
        $events = Event::where('place_id', $placeId)->get();

        if ($events->isEmpty()) {
            return response()->json(['message' => 'No events found for this place.'], 404);
        }

        return response()->json($events, 200);
    }
}