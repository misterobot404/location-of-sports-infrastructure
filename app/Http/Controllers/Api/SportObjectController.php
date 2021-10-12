<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use App\Models\SportObject;

class SportObjectController extends Controller
{
    // Get all sport objects
    public function index(): JsonResponse
    {
        return response()->json([
            "sport_objects" => SportObject::all()
        ], 200);
    }
}
