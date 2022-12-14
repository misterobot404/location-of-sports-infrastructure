<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Intersection;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class IntersectionController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            "intersections" => Intersection::all()
        ], 200);
    }

    public function store(Request $request)
    {
        $intersection = new Intersection();
        $intersection->polygon_json = request('polygon_json');
        //$intersection->polygon = request('polygon'); TODO беда с этим типом
        $intersection->area = request('area');
        $intersection->type_sportzones = request('type_sportzones');
        $intersection->type_sports = request('type_sports');
        $intersection->sportzones_count = request('sportzones_count');
        $intersection->population = request('population');
        $intersection->population_json = request('population_json');
        $intersection->save();

        // 204 No Content - operation successful
        return response()->noContent();
    }

    public function destroy($id)
    {
        try {
            Intersection::findOrFail($id);
        } catch (ModelNotFoundException $e) {
            return response([
                'error' => 'Ресурс не найден.'
            ], 404);
        }

        if (Intersection::destroy($id)) {
            // 204 No Content - operation successful
            return response()->noContent();
        } else return response([
            'error' => 'Ошибка сервера.'
        ], 500);
    }
}
