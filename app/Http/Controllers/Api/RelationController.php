<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Relation;
use Illuminate\Http\JsonResponse;

class RelationController extends Controller
{
    // Get all sport objects
    public function index(): JsonResponse
    {
        return response()->json([
            "relations" => Relation::all()
        ], 200);
    }
}
