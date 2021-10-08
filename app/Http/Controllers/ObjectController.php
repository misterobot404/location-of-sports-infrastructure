<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ObjectController extends Controller
{
    public function sayHello (Request $request) {
        return response()->json([
            'result' => 200, 'message' => 'Server says: Hello there, ' . $request -> input ('id')
        ]);
    }
}
