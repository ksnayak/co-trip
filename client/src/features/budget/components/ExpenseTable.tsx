import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Trash2, Search, Receipt } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTripRole } from "@/hooks/useTripRole";
import { useDeleteExpense } from "../hooks/useExpenses";
import type { Expense } from "../budget.types";

const col = createColumnHelper<Expense>();

export function ExpenseTable({ expenses, tripId, currencySymbol = "\u20B9" }: { expenses: Expense[]; tripId: string; currencySymbol?: string }) {
  const { canEdit } = useTripRole();
  const deleteExpense = useDeleteExpense(tripId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => [
    col.accessor("title", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          Title <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    col.accessor("amount_cents", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          Amount <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: (info) => <span className="font-semibold text-primary">{currencySymbol}{((info.getValue() ?? 0) / 100).toFixed(2)}</span>,
    }),
    col.accessor("category", {
      header: "Category",
      cell: (info) => info.getValue() ? (
        <Badge variant="outline" className="capitalize text-xs">{info.getValue()}</Badge>
      ) : "—",
    }),
    col.accessor("date", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: (info) => info.getValue() ? format(new Date(info.getValue()!), "MMM d") : "—",
    }),
    col.accessor("payer", {
      header: "Paid by",
      cell: (info) => info.getValue()?.display_name || info.getValue()?.email || "—",
    }),
    ...(canEdit ? [col.display({
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteExpense.mutate(row.original.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    })] : []),
  ], [canEdit, deleteExpense]);

  const table = useReactTable({
    data: expenses,
    columns,
    state: { sorting, columnFilters: filters, globalFilter },
    onSortingChange: setSorting,
    onColumnFiltersChange: setFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search expenses..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 h-10" />
      </div>

      {/* Desktop table */}
      <div className="hidden sm:block rounded-xl border border-border/50 overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id} className="hover:bg-transparent">
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>{h.isPlaceholder ? null : flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-32 text-center">
                  <div className="flex flex-col items-center text-muted-foreground">
                    <Receipt className="h-8 w-8 mb-2" />
                    <p>No expenses yet</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="sm:hidden space-y-2">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const expense = row.original;
            return (
              <div key={row.id} className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{expense.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs text-muted-foreground">
                      {expense.category && (
                        <Badge variant="outline" className="capitalize text-[10px]">{expense.category}</Badge>
                      )}
                      {expense.date && <span>{format(new Date(expense.date), "MMM d")}</span>}
                      {expense.payer && <span>{expense.payer.display_name || expense.payer.email}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-semibold text-primary">{currencySymbol}{((expense.amount_cents ?? 0) / 100).toFixed(2)}</span>
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteExpense.mutate(expense.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="flex flex-col items-center py-12 text-muted-foreground">
            <Receipt className="h-8 w-8 mb-2" />
            <p>No expenses yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
