<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionController extends Controller
{
    /**
     * Display a listing of roles and permissions.
     */
    public function index()
    {
        Gate::authorize('manage-roles');

        $roles = Role::with('permissions')->get();
        $permissions = Permission::all();

        return Inertia::render('roles/index', [
            'roles' => $roles,
            'permissions' => $permissions,
        ]);
    }

    /**
     * Store a newly created role in storage.
     */
    public function storeRole(Request $request)
    {
        Gate::authorize('manage-roles');

        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:roles,name',
        ]);

        Role::create([
            'name' => $validated['name'],
        ]);

        return redirect()->back()->with('success', 'Role created successfully.');
    }

    /**
     * Update the permissions assigned to a role.
     */
    public function updatePermissions(Request $request, Role $role)
    {
        Gate::authorize('manage-roles');

        $validated = $request->validate([
            'permissions' => 'array|nullable',
            'permissions.*' => 'string|exists:permissions,name',
        ]);

        $role->syncPermissions($validated['permissions'] ?? []);

        return redirect()->back()->with('success', 'Permissions updated successfully.');
    }
}
