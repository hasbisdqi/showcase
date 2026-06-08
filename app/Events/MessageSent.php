<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Message $message;

    /**
     * Create a new event instance.
     */
    public function __construct(Message $message)
    {
        $this->message = $message->load('sender');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        if ($this->message->room === 'general') {
            return [new PresenceChannel('chat.general')];
        }

        // DM channel — sorted user IDs for consistent channel name
        $ids = [(int) $this->message->user_id, (int) $this->message->receiver_id];
        sort($ids);

        return [new PrivateChannel("chat.dm.{$ids[0]}.{$ids[1]}")];
    }

    /**
     * The data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'id'          => $this->message->id,
            'body'        => $this->message->body,
            'room'        => $this->message->room,
            'receiver_id' => $this->message->receiver_id,
            'created_at'  => $this->message->created_at->toISOString(),
            'sender'      => [
                'id'   => $this->message->sender->id,
                'name' => $this->message->sender->name,
            ],
        ];
    }

    /**
     * Event name on the client.
     */
    public function broadcastAs(): string
    {
        return 'message.sent';
    }
}
