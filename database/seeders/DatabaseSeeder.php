<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        $adminRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'Admin']);
        $userRole = \Spatie\Permission\Models\Role::firstOrCreate(['name' => 'User']);

        // Seed standard permissions
        $permissions = ['view users', 'create users', 'edit users', 'delete users', 'manage roles'];
        foreach ($permissions as $permissionName) {
            \Spatie\Permission\Models\Permission::firstOrCreate(['name' => $permissionName]);
        }

        // Sync permissions to roles
        $adminRole->syncPermissions(\Spatie\Permission\Models\Permission::all());
        $userRole->syncPermissions(['view users']);

        $admin = User::factory()->create([
            'name' => 'Test Admin',
            'email' => 'admin@example.com',
        ]);
        $admin->assignRole($adminRole);

        $testUser = User::factory()->create([
            'name' => 'Test User',
            'email' => 'test@example.com',
        ]);
        $testUser->assignRole($userRole);

        // Generate 50 mock users and assign them the 'User' role
        User::factory(50)->create()->each(function ($user) use ($userRole) {
            $user->assignRole($userRole);
        });
    }
}
