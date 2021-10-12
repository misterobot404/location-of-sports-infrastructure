<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\AccessibilityController;
use App\Http\Controllers\Api\OrganisationController;
use App\Http\Controllers\Api\SportObjectController;
use Illuminate\Support\Facades\Route;

Route::get('/objects', [SportObjectController::class, 'index']);
Route::get('/organisations', [OrganisationController::class, 'index']);
Route::get('/accessibility', [AccessibilityController::class, 'index']);

