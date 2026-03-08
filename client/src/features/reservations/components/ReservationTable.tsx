import { useMemo, useState } from "react";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import type { SortingState } from "@tanstack/react-table";
import { format } from "date-fns";
import { ArrowUpDown, Trash2, Plane, Hotel, UtensilsCrossed, Car, Train, HelpCircle, Search, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useTripRole } from "@/hooks/useTripRole";
import { useDeleteReservation } from "../hooks/useReservations";
import type { Reservation } from "../reservations.types";

const typeIcons = { flight: Plane, hotel: Hotel, restaurant: UtensilsCrossed, car: Car, train: Train, other: HelpCircle };
const col = createColumnHelper<Reservation>();

export function ReservationTable({ reservations, tripId, currencySymbol = "\u20B9" }: { reservations: Reservation[]; tripId: string; currencySymbol?: string }) {
  const { canEdit } = useTripRole();
  const deleteRes = useDeleteReservation(tripId);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => [
    col.accessor("type", {
      header: "Type",
      cell: (info) => {
        const Icon = typeIcons[info.getValue()] || HelpCircle;
        return (
          <Badge variant="outline" className="gap-1 capitalize">
            <Icon className="h-3 w-3" />
            {info.getValue()}
          </Badge>
        );
      },
    }),
    col.accessor("title", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          Title <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: (info) => <span className="font-medium">{info.getValue()}</span>,
    }),
    col.accessor("provider", {
      header: "Provider",
      cell: (info) => info.getValue() || "—",
    }),
    col.accessor("confirmation_code", {
      header: "Confirmation",
      cell: (info) => info.getValue() ? <code className="rounded-md bg-muted px-2 py-0.5 text-xs font-mono">{info.getValue()}</code> : "—",
    }),
    col.accessor("start_datetime", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-3 h-8" onClick={() => column.toggleSorting()}>
          Date <ArrowUpDown className="ml-1 h-3 w-3" />
        </Button>
      ),
      cell: (info) => info.getValue() ? format(new Date(info.getValue()!), "MMM d, h:mm a") : "—",
    }),
    col.accessor("cost_cents", {
      header: "Cost",
      cell: (info) => info.getValue() ? <span className="font-semibold text-primary">{currencySymbol}{((info.getValue() ?? 0) / 100).toFixed(2)}</span> : "—",
    }),
    ...(canEdit ? [col.display({
      id: "actions",
      cell: ({ row }) => (
        <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteRes.mutate(row.original.id)}>
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ),
    })] : []),
  ], [canEdit, deleteRes]);

  const table = useReactTable({
    data: reservations,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search reservations..." value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} className="pl-9 h-10" />
      </div>

      {/* Desktop table */}
      <div className="hidden md:block rounded-xl border border-border/50 overflow-hidden">
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
                    <Ticket className="h-8 w-8 mb-2" />
                    <p>No reservations yet</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-2">
        {table.getRowModel().rows.length ? (
          table.getRowModel().rows.map((row) => {
            const res = row.original;
            const Icon = typeIcons[res.type] || HelpCircle;
            return (
              <div key={row.id} className="rounded-xl border border-border/50 bg-card p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="outline" className="gap-1 capitalize text-[10px]">
                        <Icon className="h-3 w-3" />
                        {res.type}
                      </Badge>
                      {res.confirmation_code && (
                        <code className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-mono">{res.confirmation_code}</code>
                      )}
                    </div>
                    <p className="font-medium truncate">{res.title}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-muted-foreground">
                      {res.provider && <span>{res.provider}</span>}
                      {res.start_datetime && <span>{format(new Date(res.start_datetime), "MMM d, h:mm a")}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {res.cost_cents ? <span className="font-semibold text-primary text-sm">{currencySymbol}{((res.cost_cents ?? 0) / 100).toFixed(2)}</span> : null}
                    {canEdit && (
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive" onClick={() => deleteRes.mutate(res.id)}>
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
            <Ticket className="h-8 w-8 mb-2" />
            <p>No reservations yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
