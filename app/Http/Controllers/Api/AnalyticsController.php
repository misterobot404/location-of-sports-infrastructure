<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Analytics;
use Illuminate\Http\JsonResponse;

class AnalyticsController extends Controller
{
    // Get all
    public function index(): JsonResponse
    {
        return response()->json([Analytics::all()], 200);
    }
}
