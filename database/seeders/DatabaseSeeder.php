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

        // Seed Categories
        $categories = [
            ['name' => 'Technology', 'slug' => 'technology'],
            ['name' => 'Design', 'slug' => 'design'],
            ['name' => 'Business', 'slug' => 'business'],
            ['name' => 'Marketing', 'slug' => 'marketing'],
        ];
        $categoryModels = collect($categories)->map(fn ($cat) => \App\Models\Category::create($cat));

        // Seed Tags
        $tags = [
            ['name' => 'laravel', 'slug' => 'laravel'],
            ['name' => 'react', 'slug' => 'react'],
            ['name' => 'tailwind', 'slug' => 'tailwind'],
            ['name' => 'typescript', 'slug' => 'typescript'],
            ['name' => 'tutorial', 'slug' => 'tutorial'],
        ];
        $tagModels = collect($tags)->map(fn ($tag) => \App\Models\Tag::create($tag));

        // Seed Mock Posts
        $authors = collect([$admin, $testUser]);
        for ($i = 1; $i <= 25; $i++) {
            $title = "Learning " . fake()->sentence(3);
            $slug = \Illuminate\Support\Str::slug($title) . '-' . $i;
            $status = fake()->randomElement(['Published', 'Draft']);
            
            $post = \App\Models\Post::create([
                'title' => $title,
                'slug' => $slug,
                'body' => fake()->paragraphs(3, true),
                'status' => $status,
                'cover_image' => "https://picsum.photos/seed/post-" . $i . "/800/450",
                'user_id' => $authors->random()->id,
                'published_at' => $status === 'Published' ? now()->subDays(rand(1, 30)) : null,
            ]);

            // Attach 1-2 random categories
            $post->categories()->attach($categoryModels->random(rand(1, 2))->pluck('id'));

            // Attach 2-3 random tags
            $post->tags()->attach($tagModels->random(rand(2, 3))->pluck('id'));
        }
    }
}
