<?php

namespace App\Policies;

use App\Models\User;
use Illuminate\Auth\Access\HandlesAuthorization;

class UserPolicy
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
            // Silence exceptions in tests where roles are not seeded
        }

        return null;
    }

    /**
     * Determine whether the user can view any models.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasPermissionSafe($user, 'view users');
    }

    /**
     * Determine whether the user can create models.
     */
    public function create(User $user): bool
    {
        return $this->hasPermissionSafe($user, 'create users');
    }

    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, User $model): bool
    {
        return $this->hasPermissionSafe($user, 'edit users');
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, User $model): bool
    {
        return $this->hasPermissionSafe($user, 'delete users') && $user->id !== $model->id;
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
