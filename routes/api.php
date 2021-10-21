<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Api\AccessibilityController;
use App\Http\Controllers\Api\IntersectionController;
use App\Http\Controllers\Api\OrganisationController;
use App\Http\Controllers\Api\RelationController;
use App\Http\Controllers\Api\SportController;
use App\Http\Controllers\Api\SportObjectController;
use App\Http\Controllers\Api\TypesOfSportsZonesController;
use App\Models\TypeOfSportZone;
use Illuminate\Support\Facades\Route;

//
Route::get('/intersections', [IntersectionController::class, 'index']);
Route::post('/intersections', [IntersectionController::class, 'store']);
Route::delete('/intersections/{id}', [IntersectionController::class, 'destroy']);

// Спортивные объекты
Route::get('/sport-objects', [SportObjectController::class, 'index']);

// Ведомства
Route::get('/organisations', [OrganisationController::class, 'index']);

// Доступность
Route::get('/accessibility', [AccessibilityController::class, 'index']);

// Виды спорта
Route::get('/sports', [SportController::class, 'index']);

// Виды спортивных зон
Route::get('/types-of-sports-zones', [TypesOfSportsZonesController::class, 'index']);

// Доступность
Route::get('/accessibility', [AccessibilityController::class, 'index']);
