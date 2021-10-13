<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sport;
use Illuminate\Http\JsonResponse;

class SportController extends Controller
{
    // Get all
    public function index(): JsonResponse
    {
        return response()->json([
            "sports" => Sport::all()
        ], 200);
    }
}
