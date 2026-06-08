<?php

use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

// Global chat room — any authenticated user can join
Broadcast::channel('chat.general', function ($user) {
    return [
        'id'   => $user->id,
        'name' => $user->name,
    ];
});

// DM channel — only the two users involved can join
Broadcast::channel('chat.dm.{id1}.{id2}', function ($user, $id1, $id2) {
    return (int) $user->id === (int) $id1 || (int) $user->id === (int) $id2;
});

