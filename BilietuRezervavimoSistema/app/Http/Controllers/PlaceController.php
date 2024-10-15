<?php

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;

namespace App\Http\Controllers;

use App\Models\Place;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PlaceController extends Controller
{
    public function getAll()
    {
        $places = Place::all();
        return response()->json($places, 200);
    }

    public function get($id)
    {
        $place = Place::find($id);

        if (!$place) {
            return response()->json(['message' => 'Place not found.'], 404);
        }

        return response()->json($place, 200);
    }

    public function create(Request $request)
    {
        $requiredFields = ['name',
            'address',
            'city',
            'postal_code',
            'country',
            'capacity',
        ];

        $missingFields = array_diff($requiredFields, array_keys($request->all()));
        if (!empty($extraFields) || !empty($missingFields)) {
            return response()->json([
                'message' => 'Bad Request.',
                'missing_fields' => $missingFields
            ], 400);
        }

        $validator = Validator::make($request->all(), [
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
    
        $place = Place::create($validator->validated());
    
        return response()->json($place, 201);
    }


    public function update(Request $request, $id)
    {
        $place = Place::find($id);

        if (!$place) {
            return response()->json(['message' => 'Place not found.'], 404);
        }

        $validatedData = $request->validate([
            'name' => 'string|max:191',
            'address' => 'string|max:191',
            'city' => 'string|max:191',
            'postal_code' => 'string|max:20',
            'country' => 'string|max:191',
            'capacity' => 'integer|min:1',
        ]);

        $place->update($validatedData);

        return response()->json($place, 200);
    }

    public function delete($id)
    {
        $place = Place::find($id);

        if (!$place) {
            return response()->json(['message' => 'Place not found.'], 404);
        }

        $place->delete();

        return response()->json(null, 204);
    }
}