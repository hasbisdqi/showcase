import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import InputError from '@/components/input-error';

interface Category {
    id: number;
    name: string;
}

interface Tag {
    id: number;
    name: string;
}

interface PostModalProps {
    isOpen: boolean;
    onClose: () => void;
    post: any | null; // Post model to edit, or null to create
    categories: Category[];
    tags: Tag[];
}

export default function PostModal({ isOpen, onClose, post, categories = [], tags = [] }: PostModalProps) {
    const isEdit = !!post;

    const { data, setData, post: postForm, put, processing, errors, reset, clearErrors } = useForm({
        title: '',
        slug: '',
        body: '',
        status: 'Draft',
        cover_image: '',
        categories: [] as number[],
        tags: [] as number[],
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (post) {
                setData({
                    title: post.title || '',
                    slug: post.slug || '',
                    body: post.body || '',
                    status: post.status || 'Draft',
                    cover_image: post.cover_image || '',
                    categories: post.categories ? post.categories.map((c: any) => c.id) : [],
                    tags: post.tags ? post.tags.map((t: any) => t.id) : [],
                });
            } else {
                reset();
            }
        }
    }, [isOpen, post]);

    const handleTitleChange = (val: string) => {
        setData((prev) => {
            const next = { ...prev, title: val };
            if (!isEdit) {
                next.slug = val
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '');
            }
            return next;
        });
    };

    const handleCategoryToggle = (catId: number, checked: boolean) => {
        if (checked) {
            setData('categories', [...data.categories, catId]);
        } else {
            setData('categories', data.categories.filter((id) => id !== catId));
        }
    };

    const handleTagToggle = (tagId: number, checked: boolean) => {
        if (checked) {
            setData('tags', [...data.tags, tagId]);
        } else {
            setData('tags', data.tags.filter((id) => id !== tagId));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(`/posts/${post.id}`, {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            postForm('/posts', {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px] max-h-[85vh] overflow-y-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit Post' : 'Create Post'}</DialogTitle>
                        <DialogDescription>
                            {isEdit ? 'Update details, tags, and categories for this post.' : 'Write a new post and choose tags and categories.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Title Field */}
                        <div className="space-y-1">
                            <Label htmlFor="title">Title</Label>
                            <Input
                                id="title"
                                value={data.title}
                                onChange={(e) => handleTitleChange(e.target.value)}
                                placeholder="Enter post title"
                                required
                            />
                            <InputError message={errors.title} />
                        </div>

                        {/* Slug Field */}
                        <div className="space-y-1">
                            <Label htmlFor="slug">Slug</Label>
                            <Input
                                id="slug"
                                value={data.slug}
                                onChange={(e) => setData('slug', e.target.value)}
                                placeholder="post-slug-url"
                                required
                            />
                            <InputError message={errors.slug} />
                        </div>

                        {/* Cover Image Field */}
                        <div className="space-y-1">
                            <Label htmlFor="cover_image">Cover Image URL</Label>
                            <Input
                                id="cover_image"
                                value={data.cover_image}
                                onChange={(e) => setData('cover_image', e.target.value)}
                                placeholder="https://picsum.photos/800/450"
                            />
                            <InputError message={errors.cover_image} />
                        </div>

                        {/* Status Selection */}
                        <div className="space-y-1">
                            <Label htmlFor="status">Status</Label>
                            <Select value={data.status} onValueChange={(val) => setData('status', val)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Draft">Draft</SelectItem>
                                    <SelectItem value="Published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                            <InputError message={errors.status} />
                        </div>

                        {/* Body content */}
                        <div className="space-y-1">
                            <Label htmlFor="body">Content Body</Label>
                            <textarea
                                id="body"
                                value={data.body}
                                onChange={(e) => setData('body', e.target.value)}
                                className="border-input flex min-h-[140px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="Write post content here..."
                                required
                            />
                            <InputError message={errors.body} />
                        </div>

                        {/* Categories select checklist */}
                        <div className="space-y-2">
                            <Label>Categories</Label>
                            <div className="flex flex-wrap gap-3 rounded-md border p-3">
                                {categories.map((cat) => (
                                    <div key={cat.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`cat-${cat.id}`}
                                            checked={data.categories.includes(cat.id)}
                                            onCheckedChange={(checked) => handleCategoryToggle(cat.id, !!checked)}
                                        />
                                        <label htmlFor={`cat-${cat.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                            {cat.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.categories as string} />
                        </div>

                        {/* Tags select checklist */}
                        <div className="space-y-2">
                            <Label>Tags</Label>
                            <div className="flex flex-wrap gap-3 rounded-md border p-3">
                                {tags.map((tag) => (
                                    <div key={tag.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`tag-${tag.id}`}
                                            checked={data.tags.includes(tag.id)}
                                            onCheckedChange={(checked) => handleTagToggle(tag.id, !!checked)}
                                        />
                                        <label htmlFor={`tag-${tag.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                            #{tag.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.tags as string} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Save Changes' : 'Create Post'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
