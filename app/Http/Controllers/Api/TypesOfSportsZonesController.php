<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TypeOfSportZone;
use Illuminate\Http\JsonResponse;

class TypesOfSportsZonesController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            "types_of_sports_zones" => TypeOfSportZone::all()
        ], 200);
    }
}
