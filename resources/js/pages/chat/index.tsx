import { Head, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Hash, Send, Users } from 'lucide-react';
import axios from 'axios';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ChatLayout } from '@/components/chat-layout';
import { cn } from '@/lib/utils';
import { useInitials } from '@/hooks/use-initials';
import '@/echo';

/* ─── Types ─────────────────────────────────────────────── */
interface Sender {
    id: number;
    name: string;
}

interface Message {
    id: number;
    body: string;
    created_at: string;
    sender: Sender;
}

interface User {
    id: number;
    name: string;
}

// Interface standar untuk props bawaan dari Inertia
interface PageProps extends Record<string, unknown> {
    auth: {
        user: User;
    };
}

interface ChatIndexProps {
    messages: Message[];
    users: User[];
    currentUserId: number;
}

/* ─── Helpers ────────────────────────────────────────────── */
function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function groupMessages(messages: Message[]) {
    const groups: { date: string; messages: Message[] }[] = [];
    for (const msg of messages) {
        const date = new Date(msg.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' });
        const last = groups[groups.length - 1];
        if (last && last.date === date) {
            last.messages.push(msg);
        } else {
            groups.push({ date, messages: [msg] });
        }
    }
    return groups;
}

/* ─── Page ───────────────────────────────────────────────── */
export default function ChatIndex({ messages: initialMessages, users, currentUserId }: ChatIndexProps) {
    // Menggunakan interface PageProps untuk tipe data yang lebih aman
    const { auth } = usePage<PageProps>().props;
    const getInitials = useInitials();

    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [body, setBody] = useState('');
    const [sending, setSending] = useState(false);
    const [onlineCount, setOnlineCount] = useState(1);
    
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);

    // Auto-scroll ke pesan terbawah saat state messages berubah
    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Subscribe ke Reverb/Echo presence channel
    useEffect(() => {
        const channel = window.Echo.join('chat.general');
        
        channel.here((members: Sender[]) => setOnlineCount(members.length))
            .joining(() => setOnlineCount((c) => c + 1))
            .leaving(() => setOnlineCount((c) => Math.max(1, c - 1)))
            .listen('.message.sent', (e: Message) => {
                setMessages((prev) => {
                    // Mencegah pesan ganda dari Websocket & Optimistic Update
                    if (prev.some((msg) => msg.id === e.id)) return prev;
                    return [...prev, e];
                });
            });

        return () => {
            window.Echo.leave('chat.general');
        };
    }, []);

    const handleSend = async () => {
        const text = body.trim();
        if (!text || sending) return;

        // Optimistic update
        const tempId = Date.now();
        const optimistic: Message = {
            id: tempId,
            body: text,
            created_at: new Date().toISOString(),
            sender: { id: currentUserId, name: auth.user.name },
        };
        
        setMessages((prev) => [...prev, optimistic]);
        setBody('');

        // Reset tinggi textarea kembali ke ukuran normal (1 baris)
        if (inputRef.current) {
            inputRef.current.style.height = 'auto';
        }

        try {
            setSending(true);
            const response = await axios.post('/chat', { body: text });
            
            // Opsional: Ganti temporary ID dengan ID asli dari respons server
            setMessages((prev) => 
                prev.map(msg => msg.id === tempId ? { ...msg, id: response.data.id } : msg)
            );
        } catch {
            // Revert optimistic update jika request gagal
            setMessages((prev) => prev.filter((m) => m.id !== tempId));
            setBody(text);
        } finally {
            setSending(false);
            inputRef.current?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const groups = groupMessages(messages);

    return (
        <>
            <Head title="Chat — general" />
            <ChatLayout users={users} currentPath="/chat">
                {/* Header */}
                <div className="flex items-center gap-3 border-b px-5 h-14 shrink-0">
                    <Hash className="h-5 w-5 text-muted-foreground" />
                    <span className="font-semibold text-foreground">general</span>
                    <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>{onlineCount} online</span>
                    </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-1">
                    {groups.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground">
                            <Hash className="h-10 w-10 opacity-30" />
                            <p className="text-sm">No messages yet. Say hi! 👋</p>
                        </div>
                    )}

                    {groups.map((group) => (
                        <div key={group.date} className="flex flex-col gap-1">
                            {/* Date separator */}
                            <div className="flex items-center gap-3 my-3">
                                <div className="flex-1 h-px bg-border" />
                                <span className="text-xs text-muted-foreground font-medium">{group.date}</span>
                                <div className="flex-1 h-px bg-border" />
                            </div>

                            {group.messages.map((msg, i) => {
                                const isMine = msg.sender.id === currentUserId;
                                const isFirst = i === 0 || group.messages[i - 1]?.sender.id !== msg.sender.id;
                                return (
                                    <div
                                        key={`msg-${msg.id}`}
                                        className={cn(
                                            'flex gap-2.5',
                                            isMine ? 'flex-row-reverse' : 'flex-row',
                                            !isFirst && 'mt-0.5',
                                        )}
                                    >
                                        {isFirst ? (
                                            <Avatar className="h-8 w-8 shrink-0 mt-1">
                                                <AvatarFallback className={cn('text-[10px] font-bold', isMine ? 'bg-primary/20 text-primary' : 'bg-muted-foreground/10 text-foreground')}>
                                                    {getInitials(msg.sender.name)}
                                                </AvatarFallback>
                                            </Avatar>
                                        ) : (
                                            <div className="w-8 shrink-0" />
                                        )}

                                        <div className={cn('flex flex-col max-w-[70%]', isMine && 'items-end')}>
                                            {isFirst && (
                                                <div className={cn('flex items-baseline gap-2 mb-0.5', isMine && 'flex-row-reverse')}>
                                                    <span className="text-xs font-semibold text-foreground">{msg.sender.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{formatTime(msg.created_at)}</span>
                                                </div>
                                            )}
                                            <div
                                                className={cn(
                                                    'rounded-2xl px-3.5 py-2 text-sm leading-relaxed break-words',
                                                    isMine
                                                        ? 'bg-primary text-primary-foreground rounded-tr-sm'
                                                        : 'bg-muted text-foreground rounded-tl-sm',
                                                )}
                                            >
                                                {msg.body}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ))}

                    <div ref={bottomRef} />
                </div>

                {/* Input */}
                <div className="border-t px-4 py-3 shrink-0">
                    <div className="flex items-end gap-2 rounded-xl border bg-muted/30 px-3 py-2 focus-within:ring-2 focus-within:ring-primary/30 transition-shadow">
                        <textarea
                            ref={inputRef}
                            id="chat-message-input"
                            rows={1}
                            placeholder="Message #general  (Enter to send, Shift+Enter for new line)"
                            className="flex-1 resize-none bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none min-h-[1.5rem] max-h-32"
                            value={body}
                            onChange={(e) => setBody(e.target.value)}
                            onKeyDown={handleKeyDown}
                            onInput={(e) => {
                                const el = e.currentTarget;
                                el.style.height = 'auto'; // Reset height sebelum mengukur scrollHeight
                                el.style.height = el.scrollHeight + 'px';
                            }}
                        />
                        <Button
                            id="chat-send-btn"
                            size="icon"
                            className="h-8 w-8 shrink-0 rounded-lg"
                            disabled={!body.trim() || sending}
                            onClick={handleSend}
                        >
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </ChatLayout>
        </>
    );
}

// Konfigurasi layout bawaan Inertia Wayfinder
ChatIndex.layout = {
    breadcrumbs: [
        { title: 'Chat', href: '/chat' },
        { title: '#general', href: '/chat' },
    ],
};