import * as React from 'react';
import { ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { router } from '@inertiajs/react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationInfo {
    from: number;
    to: number;
    total: number;
    links: PaginationLink[];
    per_page: number;
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchPlaceholder?: string;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    perPageValue?: number;
    onPerPageChange?: (value: number) => void;
    pagination?: PaginationInfo;
    onPageChange?: (url: string) => void;
    headerActions?: React.ReactNode;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchPlaceholder = 'Search...',
    searchValue,
    onSearchChange,
    perPageValue,
    onPerPageChange,
    pagination,
    onPageChange,
    headerActions,
}: DataTableProps<TData, TValue>) {
    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
    });

    const cleanPaginationLabel = (label: string) => {
        if (label.includes('Previous')) {
            return <ChevronLeft className="h-4 w-4" />;
        }
        if (label.includes('Next')) {
            return <ChevronRight className="h-4 w-4" />;
        }
        return label;
    };

    const handlePageNavigation = (url: string) => {
        if (onPageChange) {
            onPageChange(url);
        } else {
            router.get(url);
        }
    };

    return (
        <div className="rounded-xl border bg-card text-card-foreground shadow-xs">
            {/* Controls Bar */}
            <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between border-b">
                <div className="flex flex-1 items-center gap-3 max-w-sm">
                    {onSearchChange !== undefined && (
                        <div className="relative flex-1">
                            <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                type="search"
                                placeholder={searchPlaceholder}
                                value={searchValue || ''}
                                onChange={(e) => onSearchChange(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                    )}
                </div>
                
                <div className="flex items-center gap-4 self-end sm:self-auto">
                    {headerActions}
                    
                    {perPageValue !== undefined && onPerPageChange !== undefined && (
                        <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground whitespace-nowrap">Rows per page:</span>
                            <Select value={String(perPageValue)} onValueChange={(val) => onPerPageChange(Number(val))}>
                                <SelectTrigger className="w-[80px]">
                                    <SelectValue placeholder={String(perPageValue)} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="25">25</SelectItem>
                                    <SelectItem value="50">50</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    )}
                </div>
            </div>

            {/* Table View */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {header.isPlaceholder
                                            ? null
                                            : flexRender(header.column.columnDef.header, header.getContext())}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} className="hover:bg-muted/30">
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                                    No records found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Footer / Pagination */}
            {pagination && pagination.total > 0 && (
                <div className="flex flex-col gap-4 items-center justify-between p-4 sm:flex-row border-t text-sm text-muted-foreground">
                    <div>
                        Showing <span className="font-semibold text-foreground">{pagination.from}</span> to{' '}
                        <span className="font-semibold text-foreground">{pagination.to}</span> of{' '}
                        <span className="font-semibold text-foreground">{pagination.total}</span> records
                    </div>
                    <div className="flex items-center gap-1.5">
                        {pagination.links.map((link, idx) => {
                            const isNumeric = !isNaN(Number(link.label));
                            const isNav = !isNumeric;

                            if (!link.url) {
                                return (
                                    <Button
                                        key={idx}
                                        variant="outline"
                                        size="icon"
                                        disabled
                                        className="h-8 w-8 opacity-50"
                                    >
                                        {cleanPaginationLabel(link.label)}
                                    </Button>
                                );
                            }

                            return (
                                <Button
                                    key={idx}
                                    variant={link.active ? 'default' : 'outline'}
                                    size={isNav ? 'icon' : 'sm'}
                                    onClick={() => handlePageNavigation(link.url!)}
                                    className={`h-8 ${isNav ? 'w-8' : 'min-w-8'}`}
                                >
                                    {cleanPaginationLabel(link.label)}
                                </Button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
