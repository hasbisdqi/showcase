import { Link, usePage } from '@inertiajs/react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useInitials } from '@/hooks/use-initials';
import { Hash, MessageCircle } from 'lucide-react';

interface User {
    id: number;
    name: string;
}

interface ChatLayoutProps {
    children: React.ReactNode;
    users: User[];
    currentPath?: string;
}

export function ChatLayout({ children, users, currentPath }: ChatLayoutProps) {
    const { auth } = usePage().props as unknown as { auth: { user: { id: number; name: string } } };
    const getInitials = useInitials();

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden rounded-xl border bg-background shadow-sm">
            {/* Sidebar */}
            <aside className="flex w-56 shrink-0 flex-col border-r bg-muted/30">
                <div className="px-3 py-4 border-b">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Channels</p>
                    <Link
                        href="/chat"
                        className={cn(
                            'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors duration-150',
                            currentPath === '/chat'
                                ? 'bg-primary/10 text-primary'
                                : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                    >
                        <Hash className="h-4 w-4 shrink-0" />
                        <span className="truncate">general</span>
                    </Link>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                        Direct Messages
                    </p>
                    <div className="flex flex-col gap-0.5">
                        {users.map((user) => {
                            const href = `/chat/dm/${user.id}`;
                            const isActive = currentPath === href;
                            return (
                                <Link
                                    key={user.id}
                                    href={href}
                                    className={cn(
                                        'flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition-colors duration-150',
                                        isActive
                                            ? 'bg-primary/10 text-primary font-medium'
                                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                                    )}
                                >
                                    <Avatar className="h-6 w-6 shrink-0">
                                        <AvatarFallback className="text-[9px] bg-primary/10 text-primary font-bold">
                                            {getInitials(user.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="truncate">{user.name}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>

                {/* Me indicator */}
                <div className="border-t px-3 py-3 flex items-center gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                        <AvatarFallback className="text-[10px] bg-primary/15 text-primary font-bold">
                            {getInitials(auth.user.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <p className="text-xs font-semibold text-foreground truncate">{auth.user.name}</p>
                        <p className="text-[10px] text-muted-foreground">You</p>
                    </div>
                    <Badge variant="secondary" className="ml-auto text-[10px] px-1.5 py-0 shrink-0">Online</Badge>
                </div>
            </aside>

            {/* Main chat area */}
            <div className="flex flex-1 flex-col min-w-0">
                {children}
            </div>
        </div>
    );
}
