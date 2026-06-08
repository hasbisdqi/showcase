import { Head, router, useForm, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { createColumnHelper } from '@tanstack/react-table';
import { MoreHorizontal, ArrowUpDown, ArrowUp, ArrowDown, Plus, Trash2, Edit } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { DataTable } from '@/components/ui/data-table';

import UserModal from '@/components/user-modal';
import { useInitials } from '@/hooks/use-initials';
import usersRoute from '@/routes/users';

interface User {
    id: number;
    name: string;
    email: string;
    avatar?: string;
    roles: Array<{ id: number; name: string }>;
    created_at: string;
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

interface Role {
    id: number;
    name: string;
}

interface UsersProps {
    users: PaginationData<User>;
    roles: Role[];
    filters: {
        search: string | null;
        sort_field: string;
        sort_direction: 'asc' | 'desc';
        per_page: number;
    };
}

export default function Users({ users, roles, filters }: UsersProps) {
    const { auth } = usePage().props as unknown as { auth: { user: User } };
    const getInitials = useInitials();

    // Modal state
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Delete confirm modal state
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);

    // Search state & debounce
    const [searchValue, setSearchValue] = useState(filters.search || '');

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (searchValue !== (filters.search || '')) {
                router.get(
                    usersRoute.index().url,
                    {
                        ...filters,
                        search: searchValue,
                        page: 1, // reset page when search query changes
                    },
                    {
                        preserveState: true,
                        replace: true,
                    },
                );
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [searchValue]);

    const handleSort = (field: string) => {
        const direction = filters.sort_field === field && filters.sort_direction === 'asc' ? 'desc' : 'asc';

        router.get(
            usersRoute.index().url,
            {
                ...filters,
                sort_field: field,
                sort_direction: direction,
            },
            {
                preserveState: true,
            },
        );
    };

    const handlePerPageChange = (perPage: number) => {
        router.get(
            usersRoute.index().url,
            {
                ...filters,
                per_page: perPage,
                page: 1,
            },
            {
                preserveState: true,
            },
        );
    };

    const handleCreateClick = () => {
        setEditingUser(null);
        setIsUserModalOpen(true);
    };

    const handleEditClick = (user: User) => {
        setEditingUser(user);
        setIsUserModalOpen(true);
    };

    const handleDeleteClick = (user: User) => {
        setUserToDelete(user);
        setDeleteConfirmOpen(true);
    };

    const { delete: destroyUser, processing: deleting } = useForm();

    const handleDeleteConfirm = () => {
        if (!userToDelete) return;
        destroyUser(usersRoute.destroy(userToDelete.id).url, {
            onSuccess: () => {
                setDeleteConfirmOpen(false);
                setUserToDelete(null);
            },
        });
    };

    const renderSortHeader = (field: string, label: string) => {
        const isCurrentSort = filters.sort_field === field;
        return (
            <Button variant="ghost" onClick={() => handleSort(field)} className="-ml-4 h-8 px-2 hover:bg-transparent font-semibold">
                <span>{label}</span>
                {isCurrentSort ? (
                    filters.sort_direction === 'asc' ? (
                        <ArrowUp className="ml-2 h-4 w-4" />
                    ) : (
                        <ArrowDown className="ml-2 h-4 w-4" />
                    )
                ) : (
                    <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
                )}
            </Button>
        );
    };

    const columnHelper = createColumnHelper<User>();

    const columns = [
        columnHelper.accessor('name', {
            header: () => renderSortHeader('name', 'Name'),
            cell: (info) => {
                const user = info.row.original;
                return (
                    <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                            {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
                            <AvatarFallback className="bg-primary/10 text-primary font-bold">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                            <span className="font-semibold text-foreground leading-tight">{user.name}</span>
                            <span className="text-xs text-muted-foreground sm:hidden mt-0.5">{user.email}</span>
                        </div>
                    </div>
                );
            },
        }),
        columnHelper.accessor('email', {
            header: () => renderSortHeader('email', 'Email'),
            cell: (info) => <span className="hidden sm:inline text-muted-foreground text-sm">{info.getValue()}</span>,
        }),
        columnHelper.accessor('roles', {
            header: 'Roles',
            cell: (info) => {
                const userRoles = info.getValue() || [];
                return (
                    <div className="flex flex-wrap gap-1">
                        {userRoles.length > 0 ? (
                            userRoles.map((role) => (
                                <Badge
                                    key={role.id}
                                    variant={role.name === 'Admin' ? 'default' : 'secondary'}
                                    className="px-2.5 py-0.5 text-[11px] font-medium"
                                >
                                    {role.name}
                                </Badge>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                        )}
                    </div>
                );
            },
        }),
        columnHelper.accessor('created_at', {
            header: () => renderSortHeader('created_at', 'Created At'),
            cell: (info) => {
                const dateStr = info.getValue();
                return <span className="text-muted-foreground text-sm">{new Date(dateStr).toLocaleDateString()}</span>;
            },
        }),
        columnHelper.display({
            id: 'actions',
            cell: (info) => {
                const user = info.row.original;
                const isSelf = auth.user?.id === user.id;

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditClick(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit User
                            </DropdownMenuItem>
                            {!isSelf && (
                                <DropdownMenuItem variant="destructive" onClick={() => handleDeleteClick(user)}>
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Delete User
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                );
            },
        }),
    ];

    return (
        <>
            <Head title="Users" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">User Management</h1>
                        <p className="text-muted-foreground mt-1">
                            Manage your application's users, assign roles, and handle credentials.
                        </p>
                    </div>
                    <div>
                        <Button onClick={handleCreateClick} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add User
                        </Button>
                    </div>
                </div>

                {/* Template DataTable */}
                <DataTable
                    columns={columns}
                    data={users.data}
                    searchPlaceholder="Search by name or email..."
                    searchValue={searchValue}
                    onSearchChange={setSearchValue}
                    perPageValue={filters.per_page}
                    onPerPageChange={handlePerPageChange}
                    pagination={users}
                />
            </div>

            {/* User Edit/Create Modal */}
            <UserModal
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                user={editingUser}
                roles={roles}
            />

            {/* User Delete Confirmation Dialog */}
            <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
                <DialogContent className="sm:max-w-106.25">
                    <DialogHeader>
                        <DialogTitle>Delete User</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to permanently delete user <span className="font-semibold">{userToDelete?.name}</span>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="mt-2">
                        <Button variant="outline" onClick={() => setDeleteConfirmOpen(false)} disabled={deleting}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteConfirm} disabled={deleting}>
                            {deleting ? 'Deleting...' : 'Delete User'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}

Users.layout = {
    breadcrumbs: [
        {
            title: 'Users',
            href: usersRoute.index().url,
        },
    ],
};
