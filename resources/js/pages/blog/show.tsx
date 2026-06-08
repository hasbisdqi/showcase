import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Calendar } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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
    status: 'Draft' | 'Published';
    cover_image?: string;
    user_id: number;
    published_at: string | null;
    created_at: string;
    author: Author;
    categories: Category[];
    tags: Tag[];
}
interface PostShowProps {
    post: Post;
}

/* ─── Component ──────────────────────────────────────────── */
export default function PostShow({ post }: PostShowProps) {
    const getInitials = useInitials();
    const isDraft = post.status === 'Draft';

    return (
        <PublicLayout>
            <Head title={post.title} />

            <div className="mx-auto w-full max-w-3xl px-4 sm:px-6 py-10 lg:py-16 flex flex-col gap-8">
                {/* Back Button */}
                <div>
                    <Button variant="ghost" size="sm" asChild className="hover:-translate-x-1 transition-transform duration-200">
                        <Link href="/blog">
                            <ArrowLeft className="mr-2 h-4 w-4" /> Back to blog
                        </Link>
                    </Button>
                </div>

                {/* Article */}
                <article className="flex flex-col gap-6">
                    <header className="flex flex-col gap-4">
                        {/* Categories + Draft badge */}
                        <div className="flex flex-wrap gap-2">
                            {post.categories.map((cat) => (
                                <Badge key={cat.id} variant="secondary" className="px-2.5 py-0.5 text-xs font-semibold">
                                    {cat.name}
                                </Badge>
                            ))}
                            {isDraft && (
                                <Badge variant="destructive" className="px-2.5 py-0.5 text-xs font-semibold animate-pulse">
                                    Preview Draft
                                </Badge>
                            )}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                            {post.title}
                        </h1>

                        {/* Author + date */}
                        <div className="flex items-center gap-3 border-y py-4 text-muted-foreground">
                            <Avatar className="h-10 w-10 border">
                                {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.name} />}
                                <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                                    {getInitials(post.author.name)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col text-sm">
                                <span className="font-semibold text-foreground">{post.author.name}</span>
                                <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                                    <Calendar className="h-3.5 w-3.5" />
                                    <span>
                                        {post.published_at
                                            ? new Date(post.published_at).toLocaleDateString(undefined, { dateStyle: 'long' })
                                            : `Draft · Created ${new Date(post.created_at).toLocaleDateString()}`}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </header>

                    {/* Cover Image */}
                    {post.cover_image && (
                        <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted border">
                            <img
                                src={post.cover_image}
                                alt={post.title}
                                className="h-full w-full object-cover object-center"
                            />
                        </div>
                    )}

                    {/* Content */}
                    <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-lg font-serif space-y-6">
                        {post.body.split('\n\n').map((paragraph, index) => {
                            if (!paragraph.trim()) return null;
                            return <p key={index}>{paragraph}</p>;
                        })}
                    </div>

                    {/* Tags */}
                    {post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 border-t pt-6 mt-4">
                            {post.tags.map((tag) => (
                                <Badge key={tag.id} variant="outline" className="text-xs px-3 py-0.5 font-medium">
                                    #{tag.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </article>
            </div>
        </PublicLayout>
    );
}
