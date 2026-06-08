import { Head, Link, router, usePage } from '@inertiajs/react';
import { ArrowLeft, ArrowRight, Calendar, FileText, Search, SlidersHorizontal, X } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useInitials } from '@/hooks/use-initials';
import PublicLayout from '@/layouts/public-layout';

/* ─── Types ─────────────────────────────────────────────── */
interface Author {
    id: number;
    name: string;
    avatar?: string;
}
interface Category {
    id: number;
    name: string;
}
interface Tag {
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
    tags: Tag[];
}
interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}
interface PaginatedPosts {
    data: Post[];
    from: number;
    to: number;
    total: number;
    current_page: number;
    last_page: number;
    links: PaginationLink[];
}
interface Filters {
    search?: string;
    category?: string;
    per_page?: number;
}
interface BlogIndexProps {
    posts: PaginatedPosts;
    categories: Category[];
    filters: Filters;
}

/* ─── Helpers ────────────────────────────────────────────── */
function excerpt(body: string, limit = 130) {
    const plain = body.replace(/<[^>]*>/g, '');
    return plain.length > limit ? plain.slice(0, limit).trimEnd() + '…' : plain;
}

function PostCard({ post }: { post: Post }) {
    const getInitials = useInitials();
    return (
        <Link
            href={`/blog/${post.slug}`}
            className="group flex flex-col rounded-xl border bg-background overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
        >
            {/* Cover */}
            <div className="aspect-video w-full overflow-hidden bg-muted">
                {post.cover_image ? (
                    <img
                        src={post.cover_image}
                        alt={post.title}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-primary/5">
                        <FileText className="h-10 w-10 text-primary/25" />
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="flex flex-col gap-3 p-5 flex-1">
                {post.categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {post.categories.slice(0, 2).map((cat) => (
                            <Badge key={cat.id} variant="secondary" className="text-xs">
                                {cat.name}
                            </Badge>
                        ))}
                    </div>
                )}

                <h2 className="font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                    {post.title}
                </h2>

                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-3 flex-1">
                    {excerpt(post.body)}
                </p>

                {/* Author + date */}
                <div className="flex items-center gap-2.5 mt-auto pt-3 border-t">
                    <Avatar className="h-7 w-7 border">
                        {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.name} />}
                        <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                            {getInitials(post.author.name)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground">{post.author.name}</span>
                    <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                    </span>
                </div>
            </div>
        </Link>
    );
}

/* ─── Page ───────────────────────────────────────────────── */
export default function BlogIndex({ posts, categories, filters }: BlogIndexProps) {
    const [search, setSearch] = useState(filters.search ?? '');
    const [showFilters, setShowFilters] = useState(!!(filters.category));

    const applyFilters = useCallback(
        (overrides: Partial<Filters> = {}) => {
            const merged = { search, ...filters, ...overrides };
            router.get(
                '/blog',
                Object.fromEntries(Object.entries(merged).filter(([, v]) => v !== '' && v != null)) as Record<string, string>,
                { preserveState: true, replace: true },
            );
        },
        [search, filters],
    );

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        applyFilters({ search });
    };

    const handleCategory = (value: string) => {
        applyFilters({ category: value === 'all' ? '' : value });
    };

    const clearSearch = () => {
        setSearch('');
        applyFilters({ search: '' });
    };

    const hasActiveFilters = !!(filters.search || filters.category);

    return (
        <PublicLayout>
            <Head title="Blog — Showcase" />

            {/* ── Page header ──────────────────────────────────── */}
            <section className="border-b bg-muted/30 py-14">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3">Blog</h1>
                    <p className="text-muted-foreground text-lg max-w-xl">
                        Articles, ideas, and insights — published by the Showcase community.
                    </p>
                </div>
            </section>

            {/* ── Filters bar ──────────────────────────────────── */}
            <section className="sticky top-16 z-30 border-b bg-background/90 backdrop-blur-md py-3">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 flex flex-wrap items-center gap-3">
                    {/* Search */}
                    <form onSubmit={handleSearch} className="flex flex-1 min-w-[180px] items-center gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                            <Input
                                id="blog-search"
                                placeholder="Search posts…"
                                className="pl-9 pr-8 h-9"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            {search && (
                                <button
                                    type="button"
                                    onClick={clearSearch}
                                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            )}
                        </div>
                        <Button type="submit" size="sm" variant="secondary">
                            Search
                        </Button>
                    </form>

                    {/* Filter toggle */}
                    <Button
                        size="sm"
                        variant={showFilters ? 'secondary' : 'ghost'}
                        onClick={() => setShowFilters((v) => !v)}
                        className="gap-2"
                    >
                        <SlidersHorizontal className="h-4 w-4" />
                        <span className="hidden sm:inline">Filters</span>
                        {hasActiveFilters && (
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground font-bold">
                                {[filters.search, filters.category].filter(Boolean).length}
                            </span>
                        )}
                    </Button>

                    {/* Category filter (expanded) */}
                    {showFilters && (
                        <Select
                            value={filters.category ?? 'all'}
                            onValueChange={handleCategory}
                        >
                            <SelectTrigger id="blog-category-filter" className="h-9 w-[160px]">
                                <SelectValue placeholder="All categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    )}

                    {/* Clear all */}
                    {hasActiveFilters && (
                        <Button
                            size="sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-foreground gap-1.5"
                            onClick={() => {
                                setSearch('');
                                applyFilters({ search: '', category: '' });
                            }}
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear
                        </Button>
                    )}
                </div>
            </section>

            {/* ── Post grid ────────────────────────────────────── */}
            <section className="py-12">
                <div className="mx-auto max-w-6xl px-4 sm:px-6">
                    {/* Result count */}
                    <p className="text-sm text-muted-foreground mb-6">
                        {posts.total === 0
                            ? 'No posts found.'
                            : `Showing ${posts.from ?? 1}–${posts.to ?? posts.data.length} of ${posts.total} post${posts.total !== 1 ? 's' : ''}`}
                    </p>

                    {posts.data.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">No posts found</h3>
                            <p className="text-muted-foreground max-w-sm">
                                Try adjusting your search or filter to find what you're looking for.
                            </p>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setSearch('');
                                    applyFilters({ search: '', category: '' });
                                }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))}
                        </div>
                    )}

                    {/* ── Pagination ───────────────────────────── */}
                    {posts.last_page > 1 && (
                        <div className="mt-10 flex items-center justify-center gap-2 flex-wrap">
                            {/* Prev */}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={posts.current_page === 1}
                                onClick={() =>
                                    router.get('/blog', { ...filters, page: posts.current_page - 1 } as Record<string, unknown>, {
                                        preserveState: true,
                                    })
                                }
                            >
                                <ArrowLeft className="h-4 w-4 mr-1" /> Prev
                            </Button>

                            {/* Page numbers */}
                            {posts.links
                                .filter((l) => !l.label.includes('Previous') && !l.label.includes('Next'))
                                .map((link, i) => (
                                    <Button
                                        key={i}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        disabled={!link.url || link.active}
                                        onClick={() =>
                                            link.url &&
                                            router.get(link.url, {}, { preserveState: true })
                                        }
                                        dangerouslySetInnerHTML={{ __html: link.label }}
                                    />
                                ))}

                            {/* Next */}
                            <Button
                                variant="outline"
                                size="sm"
                                disabled={posts.current_page === posts.last_page}
                                onClick={() =>
                                    router.get('/blog', { ...filters, page: posts.current_page + 1 } as Record<string, unknown>, {
                                        preserveState: true,
                                    })
                                }
                            >
                                Next <ArrowRight className="h-4 w-4 ml-1" />
                            </Button>
                        </div>
                    )}
                </div>
            </section>
        </PublicLayout>
    );
}
