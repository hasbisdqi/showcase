import { Link, usePage } from '@inertiajs/react';
import { FileText, LogIn, LayoutGrid, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

interface PublicLayoutProps {
    children: React.ReactNode;
}

export default function PublicLayout({ children }: PublicLayoutProps) {
    const { auth } = usePage().props as unknown as { auth: { user?: { id: number; name: string } } };
    const [menuOpen, setMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col">
            {/* Sticky Navbar */}
            <header className="sticky top-0 z-50 w-full border-b bg-background/90 backdrop-blur-md">
                <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight group">
                        <span className="bg-primary text-primary-foreground p-1.5 rounded-lg transition-transform duration-200 group-hover:scale-105">
                            <FileText className="h-4 w-4" />
                        </span>
                        <span className="text-foreground group-hover:text-primary transition-colors duration-200">Showcase</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden sm:flex items-center gap-2">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/blog">Blog</Link>
                        </Button>
                        {auth.user ? (
                            <Button variant="outline" size="sm" asChild>
                                <Link href="/dashboard">
                                    <LayoutGrid className="mr-2 h-4 w-4" />
                                    Dashboard
                                </Link>
                            </Button>
                        ) : (
                            <>
                                <Button variant="ghost" size="sm" asChild>
                                    <Link href="/login">Log in</Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link href="/register">
                                        <LogIn className="mr-2 h-4 w-4" />
                                        Sign up
                                    </Link>
                                </Button>
                            </>
                        )}
                    </nav>

                    {/* Mobile menu toggle */}
                    <button
                        className="sm:hidden p-2 rounded-md hover:bg-muted transition-colors"
                        onClick={() => setMenuOpen((v) => !v)}
                        aria-label="Toggle menu"
                    >
                        {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {menuOpen && (
                    <div className="sm:hidden border-t bg-background px-4 pb-4 pt-2 flex flex-col gap-2">
                        <Link href="/blog" className="py-2 text-sm font-medium hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                            Blog
                        </Link>
                        {auth.user ? (
                            <Link href="/dashboard" className="py-2 text-sm font-medium hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link href="/login" className="py-2 text-sm font-medium hover:text-primary transition-colors" onClick={() => setMenuOpen(false)}>
                                    Log in
                                </Link>
                                <Link href="/register" className="py-2 text-sm font-semibold text-primary hover:opacity-80 transition-opacity" onClick={() => setMenuOpen(false)}>
                                    Sign up →
                                </Link>
                            </>
                        )}
                    </div>
                )}
            </header>

            {/* Page Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
            <footer className="border-t bg-muted/30">
                <div className="mx-auto max-w-6xl px-4 sm:px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2">
                        <span className="bg-primary text-primary-foreground p-1.5 rounded-lg">
                            <FileText className="h-4 w-4" />
                        </span>
                        <span className="font-bold text-sm">Showcase</span>
                        <span className="text-muted-foreground text-sm ml-2">© {new Date().getFullYear()}</span>
                    </div>
                    <nav className="flex items-center gap-6 text-sm text-muted-foreground">
                        <Link href="/" className="hover:text-foreground transition-colors">Home</Link>
                        <Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link>
                        <Link href="/login" className="hover:text-foreground transition-colors">Log in</Link>
                        <Link href="/register" className="hover:text-foreground transition-colors">Sign up</Link>
                    </nav>
                </div>
            </footer>
        </div>
    );
}
