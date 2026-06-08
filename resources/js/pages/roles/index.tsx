import { Head, router, useForm } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import { Shield, Key, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import InputError from '@/components/input-error';

interface Permission {
    id: number;
    name: string;
}

interface Role {
    id: number;
    name: string;
    permissions: Permission[];
}

interface RolePermissionProps {
    roles: Role[];
    permissions: Permission[];
}

export default function RolesIndex({ roles = [], permissions = [] }: RolePermissionProps) {
    const [activeRoleId, setActiveRoleId] = useState<number | null>(null);
    const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);

    // Pick active role, default to first role if not set or not found
    const activeRole = roles.find((r) => r.id === activeRoleId) || roles[0];

    // Permissions sync form
    const { data, setData, put, processing, reset: resetPermissions } = useForm({
        permissions: [] as string[],
    });

    // New role form
    const roleForm = useForm({
        name: '',
    });

    useEffect(() => {
        if (activeRole) {
            setData('permissions', activeRole.permissions.map((p) => p.name));
            if (activeRoleId === null) {
                setActiveRoleId(activeRole.id);
            }
        }
    }, [activeRole?.id]);

    const handlePermissionToggle = (permName: string, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permName]);
        } else {
            setData('permissions', data.permissions.filter((name) => name !== permName));
        }
    };

    const handleSavePermissions = (e: React.FormEvent) => {
        e.preventDefault();
        if (!activeRole) return;

        put(`/roles-permissions/roles/${activeRole.id}/permissions`, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success(`Updated permissions for "${activeRole.name}" successfully!`);
            },
        });
    };

    const handleCreateRoleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        roleForm.post('/roles-permissions/roles', {
            onSuccess: () => {
                toast.success(`Created role "${roleForm.data.name}" successfully!`);
                setIsAddRoleOpen(false);
                roleForm.reset();
            },
        });
    };

    return (
        <>
            <Head title="Roles & Permissions" />
            <div className="flex flex-1 flex-col gap-4 p-4 lg:p-8">
                {/* Header Section */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b pb-6">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Shield className="h-8 w-8 text-primary" /> Roles & Permissions
                        </h1>
                        <p className="text-muted-foreground mt-1">
                            Create custom user roles and configure specific security permissions mapping.
                        </p>
                    </div>
                    <div>
                        <Button onClick={() => setIsAddRoleOpen(true)} className="w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add Role
                        </Button>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    {/* Roles Selection Panel */}
                    <div className="flex flex-col gap-4">
                        <div className="rounded-xl border bg-card p-4 shadow-xs">
                            <h2 className="font-semibold text-lg text-foreground mb-4">Roles</h2>
                            <div className="space-y-1">
                                {roles.map((role) => {
                                    const isActive = activeRole?.id === role.id;
                                    return (
                                        <button
                                            key={role.id}
                                            onClick={() => setActiveRoleId(role.id)}
                                            className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-left text-sm font-medium transition-all duration-200 group ${
                                                isActive
                                                    ? 'bg-primary text-primary-foreground shadow-sm'
                                                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                                            }`}
                                        >
                                            <span className="truncate">{role.name}</span>
                                            {isActive && <Check className="h-4 w-4 shrink-0 ml-2" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Permissions Mapping Panel */}
                    <div className="md:col-span-2">
                        {activeRole ? (
                            <form onSubmit={handleSavePermissions} className="rounded-xl border bg-card p-6 shadow-xs flex flex-col gap-6">
                                <div className="border-b pb-4 flex items-center justify-between">
                                    <div>
                                        <h2 className="font-semibold text-xl text-foreground flex items-center gap-2">
                                            <Key className="h-5 w-5 text-muted-foreground" /> {activeRole.name} Permissions
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            Toggle individual permissions to assign or remove access controls for this role.
                                        </p>
                                    </div>
                                    <Button type="submit" disabled={processing}>
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </Button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {permissions.map((permission) => {
                                        const isChecked = data.permissions.includes(permission.name);
                                        return (
                                            <div
                                                key={permission.id}
                                                className={`flex items-center space-x-3 p-3.5 rounded-lg border transition-all duration-200 ${
                                                    isChecked
                                                        ? 'bg-primary/5 border-primary/25 dark:bg-primary/10'
                                                        : 'bg-transparent border-border hover:bg-muted/30'
                                                }`}
                                            >
                                                <Checkbox
                                                    id={`perm-${permission.id}`}
                                                    checked={isChecked}
                                                    onCheckedChange={(checked) => handlePermissionToggle(permission.name, !!checked)}
                                                />
                                                <label
                                                    htmlFor={`perm-${permission.id}`}
                                                    className="text-sm font-medium text-foreground select-none cursor-pointer leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-75"
                                                >
                                                    {permission.name}
                                                </label>
                                            </div>
                                        );
                                    })}
                                </div>
                            </form>
                        ) : (
                            <div className="rounded-xl border border-dashed p-12 text-center text-muted-foreground">
                                No role selected or configured in the system.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Role Dialog */}
            <Dialog open={isAddRoleOpen} onOpenChange={setIsAddRoleOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <form onSubmit={handleCreateRoleSubmit}>
                        <DialogHeader>
                            <DialogTitle>Add Custom Role</DialogTitle>
                            <DialogDescription>
                                Enter a unique name to create a new access management role.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 my-4">
                            <div className="space-y-1">
                                <Label htmlFor="role-name">Role Name</Label>
                                <Input
                                    id="role-name"
                                    value={roleForm.data.name}
                                    onChange={(e) => roleForm.setData('name', e.target.value)}
                                    placeholder="e.g. Editor, Moderator"
                                    required
                                    autoFocus
                                />
                                <InputError message={roleForm.errors.name} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddRoleOpen(false)}
                                disabled={roleForm.processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={roleForm.processing}>
                                {roleForm.processing ? 'Creating...' : 'Create Role'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}

RolesIndex.layout = {
    breadcrumbs: [
        {
            title: 'Roles & Permissions',
            href: '/roles-permissions',
        },
    ],
};
