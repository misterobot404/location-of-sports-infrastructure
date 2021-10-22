<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Organisation;
use Illuminate\Http\JsonResponse;

class OrganisationController extends Controller
{
    // Get all
    public function index(): JsonResponse
    {
        return response()->json([
            "organisations" => Organisation::all()
        ], 200);
    }
}
