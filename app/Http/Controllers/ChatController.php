<?php

namespace App\Http\Controllers;

use App\Events\MessageSent;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;

class ChatController extends Controller
{
    /**
     * Display the global chatroom.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Message::class);

        $messages = Message::with('sender')
            ->where('room', 'general')
            ->whereNull('receiver_id')
            ->orderBy('created_at', 'asc')
            ->latest()
            ->take(80)
            ->get()
            ->sortBy('created_at')
            ->values();

        // All users for starting DMs
        $users = User::where('id', '!=', $request->user()->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('chat/index', [
            'messages'       => $messages,
            'users'          => $users,
            'currentUserId'  => $request->user()->id,
        ]);
    }

    /**
     * Send a message to the global room.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Message::class);

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'user_id'     => $request->user()->id,
            'receiver_id' => null,
            'room'        => 'general',
            'body'        => $validated['body'],
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'id'         => $message->id,
            'body'       => $message->body,
            'room'       => $message->room,
            'created_at' => $message->created_at->toISOString(),
            'sender'     => [
                'id'   => $request->user()->id,
                'name' => $request->user()->name,
            ],
        ]);
    }

    /**
     * Display a DM conversation with another user.
     */
    public function dm(Request $request, User $user)
    {
        Gate::authorize('viewAny', Message::class);

        $currentUser = $request->user();

        $messages = Message::with('sender')
            ->where('room', 'dm')
            ->where(function ($q) use ($currentUser, $user) {
                $q->where(function ($inner) use ($currentUser, $user) {
                    $inner->where('user_id', $currentUser->id)
                          ->where('receiver_id', $user->id);
                })->orWhere(function ($inner) use ($currentUser, $user) {
                    $inner->where('user_id', $user->id)
                          ->where('receiver_id', $currentUser->id);
                });
            })
            ->orderBy('created_at', 'asc')
            ->take(80)
            ->get()
            ->sortBy('created_at')
            ->values();

        // All users for sidebar list
        $users = User::where('id', '!=', $currentUser->id)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('chat/dm', [
            'messages'       => $messages,
            'recipient'      => $user->only('id', 'name'),
            'users'          => $users,
            'currentUserId'  => $currentUser->id,
        ]);
    }

    /**
     * Send a DM to a specific user.
     */
    public function storeDm(Request $request, User $user)
    {
        Gate::authorize('create', Message::class);

        $validated = $request->validate([
            'body' => 'required|string|max:2000',
        ]);

        $message = Message::create([
            'user_id'     => $request->user()->id,
            'receiver_id' => $user->id,
            'room'        => 'dm',
            'body'        => $validated['body'],
        ]);

        broadcast(new MessageSent($message))->toOthers();

        return response()->json([
            'id'          => $message->id,
            'body'        => $message->body,
            'room'        => $message->room,
            'receiver_id' => $message->receiver_id,
            'created_at'  => $message->created_at->toISOString(),
            'sender'      => [
                'id'   => $request->user()->id,
                'name' => $request->user()->name,
            ],
        ]);
    }
}
