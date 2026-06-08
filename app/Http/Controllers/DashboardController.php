<?php

namespace App\Http\Controllers;

use App\Models\Post;
use App\Models\User;
use App\Models\Category;
use Spatie\Permission\Models\Role;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // 1. Stats
        $stats = [
            'totalUsers' => User::count(),
            'totalPosts' => Post::count(),
            'totalRoles' => Role::count(),
            'totalCategories' => Category::count(),
        ];

        // 2. Recent Activity
        $recentUsers = User::latest()->take(5)->get(['id', 'name', 'email', 'created_at']);
        
        $recentPosts = Post::with('author:id,name,email')
            ->latest()
            ->take(5)
            ->get(['id', 'title', 'slug', 'status', 'user_id', 'created_at']);

        // 3. Chart Data: Posts created per month for the last 6 months
        $sixMonthsAgo = Carbon::now()->subMonths(5)->startOfMonth();
        
        $postsPerMonthRaw = Post::select(
            DB::raw("to_char(created_at, 'YYYY-MM') as month"),
            DB::raw("count(*) as total")
        )
        ->where('created_at', '>=', $sixMonthsAgo)
        ->groupBy('month')
        ->orderBy('month')
        ->get();

        // Fill in missing months with 0
        $chartData = [];
        for ($i = 0; $i <= 5; $i++) {
            $month = Carbon::now()->subMonths(5 - $i);
            $monthKey = $month->format('Y-m');
            $monthLabel = $month->format('M Y');
            
            $found = $postsPerMonthRaw->firstWhere('month', $monthKey);
            $chartData[] = [
                'name' => $monthLabel,
                'total' => $found ? (int) $found->total : 0,
            ];
        }

        return Inertia::render('dashboard', [
            'stats' => $stats,
            'recentUsers' => $recentUsers,
            'recentPosts' => $recentPosts,
            'chartData' => $chartData,
        ]);
    }
}
