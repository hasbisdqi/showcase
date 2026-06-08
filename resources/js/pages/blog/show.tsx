import { Head, Link, usePage } from '@inertiajs/react';
import { FileText, Calendar, ArrowLeft, LogIn, LayoutGrid } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useInitials } from '@/hooks/use-initials';

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

export default function PostShow({ post }: PostShowProps) {
    const { auth } = usePage().props as unknown as { auth: { user?: { id: number } } };
    const getInitials = useInitials();

    const isDraft = post.status === 'Draft';

    return (
        <>
            <Head title={post.title} />
            <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20">
                {/* Public Navbar Header */}
                <header className="sticky top-0 z-40 w-full border-b bg-background/80 backdrop-blur-md">
                    <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight group">
                            <span className="bg-primary text-primary-foreground p-1.5 rounded-lg transition-transform duration-200 group-hover:scale-105">
                                <FileText className="h-4 w-4" />
                            </span>
                            <span className="text-foreground group-hover:text-primary transition-colors duration-200">Showcase</span>
                        </Link>
                        
                        <nav className="flex items-center gap-4">
                            {auth.user ? (
                                <Button variant="outline" size="sm" asChild>
                                    <Link href="/posts">
                                        <LayoutGrid className="mr-2 h-4 w-4" /> Dashboard
                                    </Link>
                                </Button>
                            ) : (
                                <>
                                    <Button variant="ghost" size="sm" asChild>
                                        <Link href="/login">Log in</Link>
                                    </Button>
                                    <Button size="sm" asChild>
                                        <Link href="/register">
                                            <LogIn className="mr-2 h-4 w-4" /> Sign up
                                        </Link>
                                    </Button>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* Main Article Section */}
                <main className="flex-1 mx-auto w-full max-w-3xl px-6 py-10 lg:py-16 flex flex-col gap-8">
                    {/* Back Button */}
                    <div>
                        <Button variant="ghost" size="sm" asChild className="hover:translate-x-[-4px] transition-transform duration-200">
                            <Link href={auth.user ? '/posts' : '/'}>
                                <ArrowLeft className="mr-2 h-4 w-4" /> Back to {auth.user ? 'dashboard' : 'home'}
                            </Link>
                        </Button>
                    </div>

                    {/* Article Header */}
                    <article className="flex flex-col gap-6">
                        <header className="flex flex-col gap-4">
                            {/* Categories */}
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
                            <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl leading-tight">
                                {post.title}
                            </h1>

                            {/* Author & Date Card */}
                            <div className="flex items-center gap-3 border-y py-4 my-2 text-muted-foreground">
                                <Avatar className="h-10 w-10 border">
                                    {post.author.avatar && <AvatarImage src={post.author.avatar} alt={post.author.name} />}
                                    <AvatarFallback className="bg-primary/5 text-primary text-xs font-bold">
                                        {getInitials(post.author.name)}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="flex flex-col text-sm">
                                    <span className="font-semibold text-foreground">{post.author.name}</span>
                                    <div className="flex items-center gap-1.5 mt-0.5 text-xs">
                                        <Calendar className="h-3.5 w-3.5" />
                                        <span>
                                            {post.published_at
                                                ? new Date(post.published_at).toLocaleDateString(undefined, {
                                                      dateStyle: 'long',
                                                  })
                                                : `Draft (Created ${new Date(post.created_at).toLocaleDateString()})`}
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

                        {/* Content Body */}
                        <div className="prose dark:prose-invert max-w-none text-foreground leading-relaxed text-lg mt-4 font-serif space-y-6">
                            {post.body.split('\n\n').map((paragraph, index) => {
                                if (!paragraph.trim()) return null;
                                return <p key={index}>{paragraph}</p>;
                            })}
                        </div>

                        {/* Tags list */}
                        {post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 border-t pt-6 mt-8">
                                {post.tags.map((tag) => (
                                    <Badge key={tag.id} variant="outline" className="text-xs px-3 py-0.5 font-medium">
                                        #{tag.name}
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </article>
                </main>

                {/* Footer Section */}
                <footer className="border-t py-8 mt-12 bg-muted/20">
                    <div className="mx-auto max-w-5xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
                        <div>&copy; {new Date().getFullYear()} Showcase. All rights reserved.</div>
                        <div className="flex items-center gap-4">
                            <Link href="/" className="hover:text-foreground">Home</Link>
                            <Link href="/login" className="hover:text-foreground">Log in</Link>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
