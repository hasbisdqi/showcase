import { Head, Link } from '@inertiajs/react';
import { 
    Users, 
    FileText, 
    Shield, 
    Tags, 
    MessageCircle, 
    PlusCircle,
    ArrowRight
} from 'lucide-react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid 
} from 'recharts';
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';

import { dashboard } from '@/routes';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { useInitials } from '@/hooks/use-initials';

interface Stats {
    totalUsers: number;
    totalPosts: number;
    totalRoles: number;
    totalCategories: number;
}

interface RecentUser {
    id: number;
    name: string;
    email: string;
    created_at: string;
}

interface RecentPost {
    id: number;
    title: string;
    slug: string;
    status: string;
    user_id: number;
    created_at: string;
    author: {
        id: number;
        name: string;
        email: string;
    };
}

interface ChartData {
    name: string;
    total: number;
}

interface DashboardProps {
    stats: Stats;
    recentUsers: RecentUser[];
    recentPosts: RecentPost[];
    chartData: ChartData[];
}

const chartConfig = {
    total: {
        label: "Posts",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export default function Dashboard({ stats, recentUsers, recentPosts, chartData }: DashboardProps) {
    const getInitials = useInitials();

    return (
        <>
            <Head title="Dashboard" />
            
            <div className="flex flex-col gap-6 p-4 lg:p-8">
                {/* Header & Quick Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
                        <p className="text-muted-foreground mt-1">Here's what's happening in your application.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Button asChild>
                            <Link href="/posts">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                New Post
                            </Link>
                        </Button>
                        <Button variant="secondary" asChild>
                            <Link href="/chat">
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Chat
                            </Link>
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    {/* Users Stat */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Total Users</h3>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
                    </div>

                    {/* Posts Stat */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Total Posts</h3>
                            <FileText className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats.totalPosts.toLocaleString()}</div>
                    </div>

                    {/* Roles Stat */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Total Roles</h3>
                            <Shield className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats.totalRoles.toLocaleString()}</div>
                    </div>

                    {/* Categories Stat */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6 flex flex-col justify-between hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between space-y-0 pb-2">
                            <h3 className="tracking-tight text-sm font-medium">Categories</h3>
                            <Tags className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">{stats.totalCategories.toLocaleString()}</div>
                    </div>
                </div>

                {/* Chart & Recent Activity Grid */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    
                    {/* Chart Section */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-4 flex flex-col">
                        <div className="p-6 pb-2">
                            <h3 className="font-semibold leading-none tracking-tight">Post Activity</h3>
                            <p className="text-sm text-muted-foreground mt-2">Number of posts created over the last 6 months.</p>
                        </div>
                        <div className="p-6 pt-4 flex-1 min-h-[300px]">
                            <ChartContainer config={chartConfig} className="w-full h-full min-h-[300px]">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis 
                                        dataKey="name" 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickMargin={10}
                                    />
                                    <YAxis 
                                        tickLine={false} 
                                        axisLine={false} 
                                        tickFormatter={(value) => `${value}`}
                                        tickMargin={10}
                                    />
                                    <ChartTooltip 
                                        cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                                        content={<ChartTooltipContent />}
                                    />
                                    <Bar dataKey="total" fill="var(--color-chart-1)" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ChartContainer>
                        </div>
                    </div>

                    {/* Recent Users Section */}
                    <div className="rounded-xl border bg-card text-card-foreground shadow-sm col-span-3 flex flex-col">
                        <div className="p-6 pb-4 border-b">
                            <h3 className="font-semibold leading-none tracking-tight">Recent Users</h3>
                            <p className="text-sm text-muted-foreground mt-2">Latest registrations</p>
                        </div>
                        <div className="p-6 flex-1 flex flex-col gap-6">
                            {recentUsers.map((user) => (
                                <div key={user.id} className="flex items-center gap-4">
                                    <Avatar className="h-9 w-9">
                                        <AvatarFallback className="text-xs bg-primary/10 text-primary font-bold">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col gap-1 min-w-0 flex-1">
                                        <p className="text-sm font-medium leading-none truncate">{user.name}</p>
                                        <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                                    </div>
                                    <div className="text-xs text-muted-foreground ml-auto whitespace-nowrap">
                                        {new Date(user.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </div>
                                </div>
                            ))}
                            {recentUsers.length === 0 && (
                                <div className="text-sm text-muted-foreground text-center py-4">No recent users.</div>
                            )}
                        </div>
                        <div className="p-4 border-t mt-auto text-center">
                            <Link href="/users" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
                                View all users <ArrowRight className="h-3 w-3" />
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Recent Posts Section */}
                <div className="rounded-xl border bg-card text-card-foreground shadow-sm">
                    <div className="p-6 pb-4 border-b">
                        <h3 className="font-semibold leading-none tracking-tight">Recent Posts</h3>
                        <p className="text-sm text-muted-foreground mt-2">Latest content added to the platform</p>
                    </div>
                    <div className="p-0">
                        <div className="divide-y">
                            {recentPosts.map((post) => (
                                <div key={post.id} className="flex items-center justify-between p-4 sm:p-6 hover:bg-muted/50 transition-colors">
                                    <div className="flex flex-col gap-2 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${
                                                post.status === 'Published' 
                                                    ? 'bg-primary/10 text-primary' 
                                                    : 'bg-secondary text-secondary-foreground'
                                            }`}>
                                                {post.status}
                                            </span>
                                            <span className="text-xs text-muted-foreground">
                                                {new Date(post.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <h4 className="font-medium text-foreground truncate">{post.title}</h4>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <Avatar className="h-5 w-5">
                                                <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                                    {getInitials(post.author.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <span>{post.author.name}</span>
                                        </div>
                                    </div>
                                    <div className="ml-4 shrink-0">
                                        <Button variant="ghost" size="sm" asChild>
                                            <Link href={`/posts`}>
                                                View
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {recentPosts.length === 0 && (
                                <div className="p-6 text-sm text-muted-foreground text-center">No recent posts.</div>
                            )}
                        </div>
                    </div>
                    <div className="p-4 border-t text-center bg-muted/20">
                        <Link href="/posts" className="text-sm font-medium text-primary hover:underline flex items-center justify-center gap-1">
                            View all posts <ArrowRight className="h-3 w-3" />
                        </Link>
                    </div>
                </div>

            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
