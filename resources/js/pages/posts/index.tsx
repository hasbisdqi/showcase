import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { FileText, Plus, Search, MoreVertical, Edit2, Trash2, Calendar, User as UserIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

import PostModal from '@/components/post-modal';
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

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationData<T> {
    data: T[];
    links: PaginationLink[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number;
    to: number;
}

interface PostsProps {
    posts: PaginationData<Post>;
    categories: Category[];
    tags: Tag[];
    filters: {
        search: string | null;
        category: string | null;
        per_page: number;
    };
}

export default function PostsIndex({ posts, categories = [], tags = [], filters }: PostsProps) {
    const { auth } = usePage().props as unknown as { auth: { user: { id: number; roles?: Array<{ name: string }> } } };
    const getInitials = useInitials();

    // Modals state
    const [isPostModalOpen, setIsPostModalOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [postToDelete, setPostToDelete] = useState<Post | null>(null);

    // Search & Category filter state
    const [searchValue, setSearchValue] = useState(filters.search || '');
    const [selectedCategory, setSelectedCategory] = useState(filters.category || 'all');

    const isAdmin = auth.user.roles?.some((r) => r.name === 'Admin') ?? false;

    // Debounced search trigger
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchValue !== (filters.search || '')) {
                triggerFilter(searchValue, selectedCategory);
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue]);

    const handleCategoryChange = (value: string) => {
        setSelectedCategory(value);
        triggerFilter(searchValue, value);
    };

    const triggerFilter = (searchVal: string, catVal: string) => {
        router.get(
            '/posts',
            {
                ...filters,
                search: searchVal || null,
                category: catVal === 'all' ? null : catVal,
                page: 1, // Reset page
            },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const handleCreateClick = () => {
        setEditingPost(null);
        setIsPostModalOpen(true);
    };

    const handleEditClick = (post: Post) => {
        setEditingPost(post);
        setIsPostModalOpen(true);
    };

    const handleDeleteClick = (post: Post) => {
        setPostToDelete(post);
        setIsDeleteOpen(true);
    };

    const { delete: destroyPost, processing: deleting } = useForm();

    const handleDeleteConfirm = () => {
        if (!postToDelete) return;
        destroyPost(`/posts/${postToDelete.id}`, {
            onSuccess: () => {
                toast.success('Post deleted successfully!');
                setIsDeleteOpen(false);
                setPostToDelete(null);
            },
        });
    };

    return (
        <>
            <Head title="Posts Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-4 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <FileText className="h-8 w-8 text-primary" /> Posts Dashboard
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Publish articles, manage tags and categories, and organize content.
                        </p>
                    </div>
                    <div>
                        <Button onClick={handleCreateClick} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add Post
                        </Button>
                    </div>
                </div>

                {/* Filters Section */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder="Search articles by title or content..."
                            value={searchValue}
                            onChange={(e) => setSearchValue(e.target.value)}
                            className="pl-9"
                        />
                    </div>
                    <div className="flex items-center gap-2 self-start sm:self-auto">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">Category:</span>
                        <Select value={selectedCategory} onValueChange={handleCategoryChange}>
                            <SelectTrigger className="w-[160px]">
                                <SelectValue placeholder="All Categories" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Categories</SelectItem>
                                {categories.map((cat) => (
                                    <SelectItem key={cat.id} value={String(cat.id)}>
                                        {cat.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Card Grid View */}
                {posts.data.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {posts.data.map((post) => {
                            const isAuthor = auth.user.id === post.user_id;
                            const canManage = isAuthor || isAdmin;

                            return (
                                <div
                                    key={post.id}
                                    className="group relative flex flex-col overflow-hidden rounded-xl border bg-card text-card-foreground shadow-xs transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                                >
                                    {/* Cover Image */}
                                    <div className="relative aspect-video w-full overflow-hidden bg-muted">
                                        <img
                                            src={post.cover_image}
                                            alt={post.title}
                                            className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                                        />
                                        {/* Status Badge */}
                                        <div className="absolute top-3 left-3">
                                            <Badge
                                                variant={post.status === 'Published' ? 'default' : 'secondary'}
                                                className="backdrop-blur-md bg-opacity-95"
                                            >
                                                {post.status}
                                            </Badge>
                                        </div>

                                        {/* Manage Actions Dots */}
                                        {canManage && (
                                            <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="secondary"
                                                            size="icon"
                                                            className="h-8 w-8 rounded-full shadow-xs bg-background/90 hover:bg-background"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-[140px]">
                                                        <DropdownMenuItem onClick={() => handleEditClick(post)}>
                                                            <Edit2 className="mr-2 h-3.5 w-3.5" /> Edit Post
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator />
                                                        <DropdownMenuItem
                                                            variant="destructive"
                                                            onClick={() => handleDeleteClick(post)}
                                                        >
                                                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Delete Post
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        )}
                                    </div>

                                    {/* Content Card Body */}
                                    <div className="flex flex-1 flex-col p-5 gap-4">
                                        <div className="flex flex-col gap-2 flex-1">
                                            {/* Categories Loop */}
                                            <div className="flex flex-wrap gap-1">
                                                {post.categories.map((cat) => (
                                                    <span
                                                        key={cat.id}
                                                        className="text-[10px] font-bold tracking-wider uppercase text-primary"
                                                    >
                                                        {cat.name}
                                                    </span>
                                                ))}
                                            </div>

                                            {/* Title */}
                                            <h3 className="text-lg font-semibold text-foreground leading-snug group-hover:text-primary transition-colors duration-200 line-clamp-2">
                                                {post.title}
                                            </h3>

                                            {/* Body snippet */}
                                            <p className="text-sm text-muted-foreground line-clamp-3 mt-1 leading-relaxed">
                                                {post.body}
                                            </p>
                                        </div>

                                        {/* Tags loop */}
                                        {post.tags.length > 0 && (
                                            <div className="flex flex-wrap gap-1 border-t pt-3">
                                                {post.tags.map((tag) => (
                                                    <Badge key={tag.id} variant="outline" className="text-[10px] px-2 py-0">
                                                        #{tag.name}
                                                    </Badge>
                                                ))}
                                            </div>
                                        )}

                                        {/* Author & Date Footer */}
                                        <div className="flex items-center justify-between border-t pt-3.5 text-xs text-muted-foreground mt-auto">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="h-6 w-6">
                                                    {post.author.avatar && (
                                                        <AvatarImage src={post.author.avatar} alt={post.author.name} />
                                                    )}
                                                    <AvatarFallback className="bg-primary/5 text-primary text-[9px] font-bold">
                                                        {getInitials(post.author.name)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <span className="font-medium text-foreground">{post.author.name}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-3 w-3" />
                                                <span>{new Date(post.created_at).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="rounded-xl border border-dashed p-16 text-center text-muted-foreground">
                        <FileText className="mx-auto h-12 w-12 opacity-50" />
                        <h3 className="mt-4 text-lg font-semibold text-foreground">No posts found</h3>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Try adjusting your search criteria or write a new post article.
                        </p>
                        <Button onClick={handleCreateClick} className="mt-4">
                            Write First Post
                        </Button>
                    </div>
                )}

                {/* Pagination Controls */}
                {posts.total > 0 && (
                    <div className="flex flex-col gap-4 items-center justify-between border-t pt-6 text-sm text-muted-foreground sm:flex-row">
                        <div>
                            Showing <span className="font-semibold text-foreground">{posts.from}</span> to{' '}
                            <span className="font-semibold text-foreground">{posts.to}</span> of{' '}
                            <span className="font-semibold text-foreground">{posts.total}</span> posts
                        </div>
                        <div className="flex items-center gap-1.5">
                            {posts.links.map((link, idx) => {
                                const isNumeric = !isNaN(Number(link.label));
                                const isNav = !isNumeric;

                                const cleanPaginationLabel = (label: string) => {
                                    if (label.includes('Previous')) return 'Prev';
                                    if (label.includes('Next')) return 'Next';
                                    return label;
                                };

                                if (!link.url) {
                                    return (
                                        <Button key={idx} variant="outline" size="sm" disabled className="h-8 opacity-50">
                                            {cleanPaginationLabel(link.label)}
                                        </Button>
                                    );
                                }

                                return (
                                    <Button
                                        key={idx}
                                        variant={link.active ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => router.get(link.url!)}
                                        className={`h-8 ${isNav ? 'px-3' : 'w-8'}`}
                                    >
                                        {cleanPaginationLabel(link.label)}
                                    </Button>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Create/Edit Post Modal */}
            <PostModal
                isOpen={isPostModalOpen}
                onClose={() => setIsPostModalOpen(false)}
                post={editingPost}
                categories={categories}
                tags={tags}
            />

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <DialogContent className="sm:max-w-[400px]">
                    <DialogHeader>
                        <DialogTitle>Delete Post</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete post article <span className="font-semibold">{postToDelete?.title}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setIsDeleteOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete Post'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

PostsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Posts Dashboard',
            href: '/posts',
        },
    ],
};
