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
import { ArrowUpDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Inbox, Search } from 'lucide-react';
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
    searchPlaceholder = 'Cari...',
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
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
                            className="h-9 rounded-lg border-border bg-background pl-9 text-sm shadow-sm transition-colors focus-visible:border-primary focus-visible:ring-primary/20"
                        />
                    </div>
                    {!meta && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>Tampilkan</span>
                            <Select
                                value={`${table.getState().pagination.pageSize}`}
                                onValueChange={(value) => table.setPageSize(Number(value))}
                            >
                                <SelectTrigger className="h-9 w-[70px] rounded-lg border-border bg-background text-sm">
                                    <SelectValue placeholder={table.getState().pagination.pageSize} />
                                </SelectTrigger>
                                <SelectContent side="top">
                                    {[5, 10, 20, 30, 50].map((size) => (
                                        <SelectItem key={size} value={`${size}`}>{size}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <span>entri</span>
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="overflow-hidden rounded-2xl border border-border bg-card text-card-foreground shadow-sm">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="border-b-0 bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-600 hover:to-blue-800">
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id} className="text-[11px] font-semibold uppercase tracking-wider text-slate-300 [&:has([role=checkbox])]:pr-0">
                                        {header.isPlaceholder ? null : (
                                            <div
                                                className={
                                                    header.column.getCanSort()
                                                        ? 'flex cursor-pointer select-none items-center gap-1.5 rounded-md px-1 py-0.5 transition-colors hover:bg-white/10 hover:text-white'
                                                        : ''
                                                }
                                                onClick={header.column.getToggleSortingHandler()}
                                            >
                                                {flexRender(header.column.columnDef.header, header.getContext())}
                                                {header.column.getCanSort() && (
                                                    <ArrowUpDown className="h-3 w-3 text-slate-400" />
                                                )}
                                            </div>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    className="border-b border-border/60 transition-colors even:bg-muted/30 hover:bg-accent/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-32">
                                    <div className="flex flex-col items-center justify-center gap-3">
                                        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
                                            <Inbox className="h-7 w-7 text-muted-foreground/50" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-semibold text-foreground">Tidak ada data</p>
                                            <p className="mt-0.5 text-xs text-muted-foreground">Tidak ada hasil yang ditemukan.</p>
                                        </div>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                {meta ? (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-foreground">{meta.from}</span>–<span className="font-medium text-foreground">{meta.to}</span> dari <span className="font-medium text-foreground">{meta.total}</span> entri
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => meta.first_page_url && router.get(meta.first_page_url)}
                                disabled={meta.current_page === 1}
                            >
                                <ChevronsLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => meta.prev_page_url && router.get(meta.prev_page_url)}
                                disabled={!meta.prev_page_url}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="rounded-lg bg-muted px-3 py-1 text-sm font-medium text-foreground">
                                {meta.current_page} / {meta.last_page}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => meta.next_page_url && router.get(meta.next_page_url)}
                                disabled={!meta.next_page_url}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => meta.last_page_url && router.get(meta.last_page_url)}
                                disabled={meta.current_page === meta.last_page}
                            >
                                <ChevronsRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </>
                ) : (
                    <>
                        <p className="text-sm text-muted-foreground">
                            Menampilkan <span className="font-medium text-foreground">{table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1}</span>–<span className="font-medium text-foreground">{Math.min((table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize, table.getFilteredRowModel().rows.length)}</span> dari <span className="font-medium text-foreground">{table.getFilteredRowModel().rows.length}</span> entri
                        </p>
                        <div className="flex items-center gap-1.5">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronsLeft className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                <ChevronLeft className="h-3.5 w-3.5" />
                            </Button>
                            <span className="rounded-lg bg-muted px-3 py-1 text-sm font-medium text-foreground">
                                {table.getState().pagination.pageIndex + 1} / {table.getPageCount()}
                            </span>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronRight className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 w-8 rounded-lg border-border p-0"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                <ChevronsRight className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

// Helper function for sortable column headers
export function createSortableHeader(label: string) {
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
