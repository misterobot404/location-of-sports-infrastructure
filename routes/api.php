<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\AccessibilityController;
use App\Http\Controllers\Api\OrganisationController;
use App\Http\Controllers\Api\RelationController;
use App\Http\Controllers\Api\SportController;
use App\Http\Controllers\Api\SportObjectController;
use Illuminate\Support\Facades\Route;

Route::get('/sport-objects', [SportObjectController::class, 'index']);
Route::get('/organisations', [OrganisationController::class, 'index']);
Route::get('/accessibility', [AccessibilityController::class, 'index']);
Route::get('/relations', [RelationController::class, 'index']);
Route::get('/sports', [SportController::class, 'index']);

