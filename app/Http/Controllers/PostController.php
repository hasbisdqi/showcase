<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\Category;
use App\Models\Tag;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Gate;
use Inertia\Inertia;
use Illuminate\Support\Str;

class PostController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        Gate::authorize('viewAny', Post::class);

        $query = Post::with(['author', 'categories', 'tags']);

        // Filter by Search
        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(body) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }

        // Filter by Category
        if ($request->filled('category')) {
            $categoryId = $request->input('category');
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        $posts = $query->orderBy('created_at', 'desc')
            ->paginate($request->input('per_page', 9))
            ->withQueryString();

        $categories = Category::all(['id', 'name']);
        $tags = Tag::all(['id', 'name']);

        return Inertia::render('posts/index', [
            'posts' => $posts,
            'categories' => $categories,
            'tags' => $tags,
            'filters' => [
                'search' => $request->input('search'),
                'category' => $request->input('category'),
                'per_page' => (int) $request->input('per_page', 9),
            ]
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        Gate::authorize('create', Post::class);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts,slug',
            'body' => 'required|string',
            'status' => 'required|string|in:Draft,Published',
            'cover_image' => 'nullable|string',
            'categories' => 'array|nullable',
            'categories.*' => 'integer|exists:categories,id',
            'tags' => 'array|nullable',
            'tags.*' => 'integer|exists:tags,id',
        ]);

        $post = Post::create([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['slug']),
            'body' => $validated['body'],
            'status' => $validated['status'],
            'cover_image' => $validated['cover_image'] ?? 'https://picsum.photos/seed/default/800/450',
            'user_id' => auth()->id(),
            'published_at' => $validated['status'] === 'Published' ? now() : null,
        ]);

        if (!empty($validated['categories'])) {
            $post->categories()->sync($validated['categories']);
        }

        if (!empty($validated['tags'])) {
            $post->tags()->sync($validated['tags']);
        }

        return redirect()->back()->with('success', 'Post created successfully.');
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Post $post)
    {
        Gate::authorize('update', $post);

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:posts,slug,' . $post->id,
            'body' => 'required|string',
            'status' => 'required|string|in:Draft,Published',
            'cover_image' => 'nullable|string',
            'categories' => 'array|nullable',
            'categories.*' => 'integer|exists:categories,id',
            'tags' => 'array|nullable',
            'tags.*' => 'integer|exists:tags,id',
        ]);

        $publishedAt = $post->published_at;
        if ($validated['status'] === 'Published' && $post->status !== 'Published') {
            $publishedAt = now();
        } elseif ($validated['status'] === 'Draft') {
            $publishedAt = null;
        }

        $post->update([
            'title' => $validated['title'],
            'slug' => Str::slug($validated['slug']),
            'body' => $validated['body'],
            'status' => $validated['status'],
            'cover_image' => $validated['cover_image'] ?? $post->cover_image,
            'published_at' => $publishedAt,
        ]);

        $post->categories()->sync($validated['categories'] ?? []);
        $post->tags()->sync($validated['tags'] ?? []);

        return redirect()->back()->with('success', 'Post updated successfully.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Post $post)
    {
        Gate::authorize('delete', $post);

        $post->delete();

        return redirect()->back()->with('success', 'Post deleted successfully.');
    }

    /**
     * Display the landing / welcome page.
     */
    public function welcome()
    {
        $latestPosts = Post::with(['author', 'categories'])
            ->where('status', 'Published')
            ->whereNotNull('published_at')
            ->orderBy('published_at', 'desc')
            ->take(3)
            ->get();

        return Inertia::render('welcome', [
            'latestPosts' => $latestPosts,
        ]);
    }

    /**
     * Display a public listing of published posts.
     */
    public function indexPublic(Request $request)
    {
        $query = Post::with(['author', 'categories', 'tags'])
            ->where('status', 'Published')
            ->whereNotNull('published_at');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->whereRaw('LOWER(title) LIKE ?', ['%' . strtolower($search) . '%'])
                  ->orWhereRaw('LOWER(body) LIKE ?', ['%' . strtolower($search) . '%']);
            });
        }

        if ($request->filled('category')) {
            $categoryId = $request->input('category');
            $query->whereHas('categories', function ($q) use ($categoryId) {
                $q->where('categories.id', $categoryId);
            });
        }

        $posts = $query->orderBy('published_at', 'desc')
            ->paginate($request->input('per_page', 9))
            ->withQueryString();

        $categories = Category::all(['id', 'name']);

        return Inertia::render('blog/index', [
            'posts'      => $posts,
            'categories' => $categories,
            'filters'    => [
                'search'   => $request->input('search'),
                'category' => $request->input('category'),
                'per_page' => (int) $request->input('per_page', 9),
            ],
        ]);
    }

    /**
     * Display the specified resource for the public.
     */
    public function showPublic(string $slug)
    {
        $post = Post::with(['author', 'categories', 'tags'])
            ->where('slug', $slug)
            ->firstOrFail();

        Gate::authorize('view', $post);

        return Inertia::render('blog/show', [
            'post' => $post,
        ]);
    }
}
