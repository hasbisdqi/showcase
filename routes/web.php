<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\PostController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('blog/{slug}', [PostController::class, 'showPublic'])->name('posts.show-public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');

    Route::resource('users', UserController::class);
    Route::resource('posts', PostController::class);

    Route::get('roles-permissions', [RolePermissionController::class, 'index'])->name('roles-permissions.index');
    Route::post('roles-permissions/roles', [RolePermissionController::class, 'storeRole'])->name('roles-permissions.store-role');
    Route::put('roles-permissions/roles/{role}/permissions', [RolePermissionController::class, 'updatePermissions'])->name('roles-permissions.update-permissions');
});

require __DIR__.'/settings.php';
