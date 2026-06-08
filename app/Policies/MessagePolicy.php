<?php

namespace App\Policies;

use App\Models\Message;
use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class MessagePolicy
{
    use HandlesAuthorization;

    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        try {
            if ($user->hasRole('Admin')) {
                return true;
            }
        } catch (\Spatie\Permission\Exceptions\RoleDoesNotExist $e) {
            // Silence in testing
        }

        return null;
    }

    /**
     * Determine whether the user can view any messages (access chat).
     */
    public function viewAny(User $user): bool
    {
        return $this->hasPermissionSafe($user, 'send_messages');
    }

    /**
     * Determine whether the user can view a specific message.
     */
    public function view(User $user, Message $message): bool
    {
        // Can view if sender, receiver, or general room participant
        return $message->room === 'general'
            || $user->id === $message->user_id
            || $user->id === $message->receiver_id;
    }

    /**
     * Determine whether the user can create messages.
     */
    public function create(User $user): bool
    {
        return $this->hasPermissionSafe($user, 'send_messages');
    }

    /**
     * Determine whether the user can delete the message.
     */
    public function delete(User $user, Message $message): bool
    {
        return $user->id === $message->user_id;
    }

    /**
     * Safely check if a user has a permission.
     */
    protected function hasPermissionSafe(User $user, string $permission): bool
    {
        try {
            return $user->hasPermissionTo($permission);
        } catch (\Spatie\Permission\Exceptions\PermissionDoesNotExist $e) {
            return false;
        }
    }
}
