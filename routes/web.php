<?php

use App\Http\Controllers\UserController;
use App\Http\Controllers\RolePermissionController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\ChatController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;

Route::get('/', [PostController::class, 'welcome'])->name('home');

Route::get('blog', [PostController::class, 'indexPublic'])->name('blog.index');
Route::get('blog/{slug}', [PostController::class, 'showPublic'])->name('posts.show-public');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    Route::resource('users', UserController::class);
    Route::resource('posts', PostController::class);

    Route::get('roles-permissions', [RolePermissionController::class, 'index'])->name('roles-permissions.index');
    Route::post('roles-permissions/roles', [RolePermissionController::class, 'storeRole'])->name('roles-permissions.store-role');
    Route::put('roles-permissions/roles/{role}/permissions', [RolePermissionController::class, 'updatePermissions'])->name('roles-permissions.update-permissions');

    // Chat — global room
    Route::get('chat', [ChatController::class, 'index'])->name('chat.index');
    Route::post('chat', [ChatController::class, 'store'])->name('chat.store');

    // Chat — direct messages
    Route::get('chat/dm/{user}', [ChatController::class, 'dm'])->name('chat.dm');
    Route::post('chat/dm/{user}', [ChatController::class, 'storeDm'])->name('chat.dm.store');
});

require __DIR__.'/settings.php';
