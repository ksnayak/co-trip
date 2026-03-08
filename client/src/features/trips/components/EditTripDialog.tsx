import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUpdateTrip } from "../hooks/useTrips";
import { toast } from "sonner";
import { Settings } from "lucide-react";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currency";
import type { Trip } from "../trips.types";

export function EditTripDialog({ trip }: { trip: Trip }) {
  const [open, setOpen] = useState(false);
  const updateTrip = useUpdateTrip(trip.id);
  const [currency, setCurrency] = useState(trip.currency || "INR");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const data = {
      title: form.get("title") as string,
      destination: (form.get("destination") as string) || undefined,
      start_date: (form.get("start_date") as string) || undefined,
      end_date: (form.get("end_date") as string) || undefined,
      description: (form.get("description") as string) || undefined,
      budget_cents: form.get("budget") ? Math.round(Number(form.get("budget")) * 100) : undefined,
      currency,
    };

    try {
      await updateTrip.mutateAsync(data);
      toast.success("Trip updated");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update trip");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Edit trip
          </DialogTitle>
          <DialogDescription>Update your trip details.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Trip name</Label>
            <Input id="edit-title" name="title" defaultValue={trip.title} required className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-destination">Destination</Label>
            <Input id="edit-destination" name="destination" defaultValue={trip.destination || ""} className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-start_date">Start date</Label>
              <Input id="edit-start_date" name="start_date" type="date" defaultValue={trip.start_date || ""} className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-end_date">End date</Label>
              <Input id="edit-end_date" name="end_date" type="date" defaultValue={trip.end_date || ""} className="h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="edit-budget">Budget ({getCurrencySymbol(currency)})</Label>
              <Input
                id="edit-budget"
                name="budget"
                type="number"
                step="0.01"
                min="0"
                defaultValue={trip.budget_cents ? (trip.budget_cents / 100).toFixed(2) : ""}
                placeholder="0.00"
                className="h-11"
              />
            </div>
            <div className="grid gap-2">
              <Label>Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CURRENCIES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.symbol} {c.code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea id="edit-description" name="description" defaultValue={trip.description || ""} rows={3} />
          </div>
          <Button type="submit" disabled={updateTrip.isPending} className="h-11 mt-1">
            {updateTrip.isPending ? "Saving..." : "Save changes"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
