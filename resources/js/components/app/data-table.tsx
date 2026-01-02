import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Search } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { router } from '@inertiajs/react';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    searchKey?: string;
    searchPlaceholder?: string;
    pageSize?: number;
    // Server-side pagination props
    meta?: {
        current_page: number;
        from: number;
        last_page: number;
        per_page: number;
        to: number;
        total: number;
        prev_page_url: string | null;
        next_page_url: string | null;
        links?: { url: string | null; label: string; active: boolean }[];
        path?: string;
        first_page_url?: string;
        last_page_url?: string;
    };
    hideSearch?: boolean;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    searchKey,
    searchPlaceholder = 'Search...',
    pageSize = 10,
    meta,
    hideSearch = false,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = React.useState('');

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        // Only use client pagination if no meta
        getPaginationRowModel: meta ? undefined : getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            globalFilter,
        },
        manualPagination: !!meta,
        pageCount: meta ? meta.last_page : undefined,
        initialState: {
            pagination: {
                pageSize,
            },
        },
    });

    return (
        <div className="space-y-4">
            {/* Search and Controls */}
            {!hideSearch && (
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            placeholder={searchPlaceholder}
                            value={searchKey ? (table.getColumn(searchKey)?.getFilterValue() as string) ?? '' : globalFilter}
                            onChange={(event) =>
                                searchKey
                                    ? table.getColumn(searchKey)?.setFilterValue(event.target.value)
                                    : setGlobalFilter(event.target.value)
                            }
                            className="pl-9"
                        />
                    </div>
                    {/* Only show page size selector for Client-Side pagination */}
                    {!meta && (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">Show</span>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                }}
                            >
                                <SelectTrigger className="h-9 w-[70px]">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 30, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>
                                            {size}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span className="text-sm text-muted-foreground">entries</span>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="rounded-lg border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="bg-muted/50 hover:bg-muted/50">
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id} className="font-semibold">
                                            {header.isPlaceholder ? null : (
                                                <div
                                                    className={
                                                        header.column.getCanSort()
                                                            ? 'flex cursor-pointer select-none items-center gap-2 hover:text-foreground'
                                                            : ''
                                                    }
                                                    onClick={header.column.getToggleSortingHandler()}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {header.column.getCanSort() && (
                                                        <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
                                                    )}
                                                </div>
                                            )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Search className="h-8 w-8" />
                                        <span>No results found.</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                {meta ? (
                    // Server-side Pagination
                    <>
                        <div className="text-sm text-muted-foreground">
                            Showing {meta.from} to {meta.to} of {meta.total} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => meta.first_page_url && router.get(meta.first_page_url)}
                                disabled={meta.current_page === 1}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => meta.prev_page_url && router.get(meta.prev_page_url)}
                                disabled={!meta.prev_page_url}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">
                                    Page {meta.current_page} of {meta.last_page}
                                </span>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => meta.next_page_url && router.get(meta.next_page_url)}
                                disabled={!meta.next_page_url}
                            >
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => meta.last_page_url && router.get(meta.last_page_url)}
                                disabled={meta.current_page === meta.last_page}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                ) : (
                    // Client-side Pagination
                    <>
                        <div className="text-sm text-muted-foreground">
                            Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
                            {Math.min(
                                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                                table.getFilteredRowModel().rows.length,
                            )}{' '}
                            of {table.getFilteredRowModel().rows.length} entries
                        </div>
                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronsLeft className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-4 w-4" />
                            </Button>
                            <div className="flex items-center gap-1">
                                <span className="text-sm font-medium">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                <ChevronRight className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronsRight className="h-4 w-4" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper function for sortable column headers
export function createSortableHeader<T>(label: string) {
    return ({ column }: { column: { getIsSorted: () => 'asc' | 'desc' | false, toggleSorting: (desc?: boolean) => void } }) => {
        return (
            <div
                className={
                    column.getIsSorted()
                        ? 'flex cursor-pointer select-none items-center gap-2 text-foreground'
                        : 'cursor-pointer select-none data-[is-sorted=asc]:'
                }
                onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
            >
                {label}
            </div>
        );
    };
}
