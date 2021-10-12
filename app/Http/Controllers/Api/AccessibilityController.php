<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Accessibility;
use Illuminate\Http\JsonResponse;

class AccessibilityController extends Controller
{
    // Get all
    public function index(): JsonResponse
    {
        return response()->json([
            "accessibility" => Accessibility::all()
        ], 200);
    }
}
