import { useEffect } from 'react';
import { useForm } from '@inertiajs/react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import InputError from '@/components/input-error';
import users from '@/routes/users';

interface Role {
    id: number;
    name: string;
}

interface UserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: any | null; // The user to edit, or null to create
    roles: Role[];
}

export default function UserModal({ isOpen, onClose, user, roles }: UserModalProps) {
    const isEdit = !!user;

    const { data, setData, post, put, processing, errors, reset, clearErrors } = useForm({
        name: '',
        email: '',
        password: '',
        roles: [] as string[],
    });

    useEffect(() => {
        if (isOpen) {
            clearErrors();
            if (user) {
                setData({
                    name: user.name || '',
                    email: user.email || '',
                    password: '',
                    roles: user.roles ? user.roles.map((r: any) => r.name) : [],
                });
            } else {
                setData({
                    name: '',
                    email: '',
                    password: '',
                    roles: [],
                });
            }
        }
    }, [isOpen, user]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (isEdit) {
            put(users.update(user.id).url, {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        } else {
            post(users.store().url, {
                onSuccess: () => {
                    onClose();
                    reset();
                },
            });
        }
    };

    const handleRoleChange = (roleName: string, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleName]);
        } else {
            setData(
                'roles',
                data.roles.filter((name) => name !== roleName),
            );
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <DialogHeader>
                        <DialogTitle>{isEdit ? 'Edit User' : 'Create User'}</DialogTitle>
                        <DialogDescription>
                            {isEdit
                                ? "Update the user's name, email, password, and roles."
                                : 'Fill in the information to create a new user.'}
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                        {/* Name Field */}
                        <div className="space-y-1">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                value={data.name}
                                onChange={(e) => setData('name', e.target.value)}
                                placeholder="John Doe"
                                required
                            />
                            <InputError message={errors.name} />
                        </div>

                        {/* Email Field */}
                        <div className="space-y-1">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                value={data.email}
                                onChange={(e) => setData('email', e.target.value)}
                                placeholder="john.doe@example.com"
                                required
                            />
                            <InputError message={errors.email} />
                        </div>

                        {/* Password Field */}
                        <div className="space-y-1">
                            <Label htmlFor="password">
                                Password {isEdit && <span className="text-xs text-muted-foreground">(leave blank to keep current)</span>}
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                placeholder={isEdit ? '••••••••' : 'Password (min 8 chars)'}
                                required={!isEdit}
                            />
                            <InputError message={errors.password} />
                        </div>

                        {/* Roles Checkboxes */}
                        <div className="space-y-2">
                            <Label>Roles</Label>
                            <div className="flex flex-wrap gap-4 rounded-md border p-3">
                                {roles.map((role) => (
                                    <div key={role.id} className="flex items-center space-x-2">
                                        <Checkbox
                                            id={`role-${role.id}`}
                                            checked={data.roles.includes(role.name)}
                                            onCheckedChange={(checked) => handleRoleChange(role.name, !!checked)}
                                        />
                                        <label
                                            htmlFor={`role-${role.id}`}
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            {role.name}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <InputError message={errors.roles as string} />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={processing}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {isEdit ? 'Save Changes' : 'Create User'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
