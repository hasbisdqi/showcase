import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BookOpen,
    Calendar,
    CheckCircle2,
    FileText,
    Shield,
    Users,
    Zap,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import PublicLayout from '@/layouts/public-layout';

/* ─── Types ─────────────────────────────────────────────── */
interface Author {
    id: number;
    name: string;
}
interface Category {
    id: number;
    name: string;
}
interface Post {
    id: number;
    title: string;
    slug: string;
    body: string;
    cover_image?: string;
    published_at: string;
    author: Author;
    categories: Category[];
}
interface WelcomeProps {
    latestPosts: Post[];
}

/* ─── Helpers ────────────────────────────────────────────── */
function excerpt(body: string, limit = 120) {
    const plain = body.replace(/<[^>]*>/g, '');
    return plain.length > limit ? plain.slice(0, limit).trimEnd() + '…' : plain;
}

/* ─── Feature items ──────────────────────────────────────── */
const features = [
    {
        icon: FileText,
        title: 'Rich Content',
        description: 'Write and publish posts with categories and tags. Full WYSIWYG editing experience.',
    },
    {
        icon: Shield,
        title: 'Role-Based Access',
        description: 'Fine-grained permissions ensure the right people have the right access — always.',
    },
    {
        icon: Users,
        title: 'User Management',
        description: 'Invite, manage and organise your team with a clean, intuitive admin panel.',
    },
    {
        icon: Zap,
        title: 'Blazing Fast',
        description: 'Powered by Laravel + Inertia.js + React for a seamless, SPA-like experience.',
    },
    {
        icon: BookOpen,
        title: 'Public Blog',
        description: 'Share your thinking with the world. A beautiful reader view, no account required.',
    },
    {
        icon: CheckCircle2,
        title: 'Open Source',
        description: 'Built on the official Laravel React starter kit — solid foundation, great DX.',
    },
];

/* ─── Component ──────────────────────────────────────────── */
export default function Welcome({ latestPosts = [] }: WelcomeProps) {
    const { auth } = usePage().props as unknown as { auth: { user?: { name: string } } };

    return (
        <PublicLayout>
            <Head title="Welcome — Showcase" />

            {/* ── Hero ─────────────────────────────────────────── */}
            <section className="relative overflow-hidden">
                {/* subtle gradient blob */}
                <div
                    aria-hidden
                    className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[900px] h-[600px] rounded-full opacity-[0.06] dark:opacity-[0.04]"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary)) 0%, transparent 70%)' }}
                />

                <div className="mx-auto max-w-6xl px-4 sm:px-6 pt-20 pb-24 text-center relative">
                    {/* Eyebrow badge */}
                    <div className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground mb-6 shadow-sm">
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                        Built with Laravel + Inertia.js + React
                    </div>

                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1] mb-6">
                        A modern platform for{' '}
                        <span className="text-primary">ideas that matter</span>
                    </h1>

                    <p className="mx-auto max-w-2xl text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10">
                        Showcase is an open, role-aware content platform. Publish posts, manage your team and share
                        your thinking — all from one elegant dashboard.
                    </p>

                    <div className="flex flex-wrap items-center justify-center gap-4">
                        {auth.user ? (
                            <Button size="lg" asChild>
                                <Link href="/dashboard">
                                    Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button size="lg" asChild>
                                    <Link href="/register">
                                        Get started free <ArrowRight className="ml-2 h-4 w-4" />
                                    </Link>
                                </Button>
                                <Button size="lg" variant="outline" asChild>
                                    <Link href="/blog">Read the blog</Link>
                                </Button>
                            </>
                        )}
                    </div>

                    {/* Social proof strip */}
                    <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
                        {['No credit card required', 'Open source', 'MIT licensed'].map((item) => (
                            <span key={item} className="flex items-center gap-1.5">
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                                {item}
                            </span>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Features grid ────────────────────────────────── */}
            <section className="border-t bg-muted/30 py-20">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <div className="text-center mb-12">
                        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-3">
                            Everything you need, nothing you don't
                        </h2>
                        <p className="text-muted-foreground max-w-xl mx-auto">
                            Simple by design. Powerful when you need it.
                        </p>
                    </div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map(({ icon: Icon, title, description }) => (
                            <div
                                key={title}
                                className="group relative flex flex-col gap-3 rounded-xl border bg-background p-6 shadow-sm transition-shadow duration-200 hover:shadow-md"
                            >
                                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="h-5 w-5" />
                                </span>
                                <h3 className="font-semibold text-foreground">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Latest posts preview ─────────────────────────── */}
            {latestPosts.length > 0 && (
                <section className="py-20">
                    <div className="mx-auto max-w-6xl px-4 sm:px-6">
                        <div className="flex items-end justify-between mb-10">
                            <div>
                                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-2">
                                    From the blog
                                </h2>
                                <p className="text-muted-foreground">Latest thinking from our team.</p>
                            </div>
                            <Button variant="ghost" asChild className="hidden sm:inline-flex">
                                <Link href="/blog">
                                    All posts <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>

                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {latestPosts.map((post) => (
                                <Link
                                    key={post.id}
                                    href={`/blog/${post.slug}`}
                                    className="group flex flex-col rounded-xl border bg-background overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200"
                                >
                                    {/* Cover image */}
                                    <div className="aspect-video w-full overflow-hidden bg-muted">
                                        {post.cover_image ? (
                                            <img
                                                src={post.cover_image}
                                                alt={post.title}
                                                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center bg-primary/5">
                                                <FileText className="h-8 w-8 text-primary/30" />
                                            </div>
                                        )}
                                    </div>

                                    {/* Card body */}
                                    <div className="flex flex-col gap-3 p-5 flex-1">
                                        {/* Categories */}
                                        {post.categories.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {post.categories.slice(0, 2).map((cat) => (
                                                    <Badge key={cat.id} variant="secondary" className="text-xs">
                                                        {cat.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        <h3 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                                            {post.title}
                                        </h3>

                                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                                            {excerpt(post.body)}
                                        </p>

                                        {/* Meta */}
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-auto pt-3 border-t">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>
                                                {new Date(post.published_at).toLocaleDateString(undefined, {
                                                    dateStyle: 'medium',
                                                })}
                                            </span>
                                            <span className="ml-auto font-medium text-foreground">{post.author.name}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* Mobile "see all" */}
                        <div className="mt-8 text-center sm:hidden">
                            <Button variant="outline" asChild>
                                <Link href="/blog">
                                    All posts <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </div>
                    </div>
                </section>
            )}

            {/* ── CTA Banner ───────────────────────────────────── */}
            <section className="border-t py-20">
                <div className="mx-auto max-w-3xl px-4 sm:px-6 text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground mb-4">
                        Ready to get started?
                    </h2>
                    <p className="text-muted-foreground mb-8 leading-relaxed">
                        Create your account and start publishing in minutes. It's completely free.
                    </p>
                    {auth.user ? (
                        <Button size="lg" asChild>
                            <Link href="/dashboard">
                                Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    ) : (
                        <div className="flex flex-wrap justify-center gap-4">
                            <Button size="lg" asChild>
                                <Link href="/register">
                                    Create free account <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                            <Button size="lg" variant="outline" asChild>
                                <Link href="/login">Sign in</Link>
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
