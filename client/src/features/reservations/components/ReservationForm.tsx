import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateReservation } from "../hooks/useReservations";
import { toast } from "sonner";
import type { Reservation } from "../reservations.types";

const types: Reservation["type"][] = ["hotel", "flight", "restaurant", "car", "train", "other"];

export function AddReservationDialog({ tripId }: { tripId: string }) {
  const [open, setOpen] = useState(false);
  const create = useCreateReservation(tripId);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    try {
      await create.mutateAsync({
        type: form.get("type") as Reservation["type"],
        title: form.get("title") as string,
        confirmation_code: (form.get("confirmation_code") as string) || undefined,
        provider: (form.get("provider") as string) || undefined,
        location: (form.get("location") as string) || undefined,
        start_datetime: (form.get("start_datetime") as string) || undefined,
        end_datetime: (form.get("end_datetime") as string) || undefined,
        cost_cents: form.get("cost") ? Math.round(Number(form.get("cost")) * 100) : undefined,
        notes: (form.get("notes") as string) || undefined,
      });
      toast.success("Reservation added");
      setOpen(false);
    } catch {
      toast.error("Failed to add reservation");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Plus className="h-4 w-4" />
          Add reservation
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add reservation</DialogTitle>
          <DialogDescription>Add a booking or reservation for this trip.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label>Type</Label>
              <Select name="type" defaultValue="hotel">
                <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {types.map((t) => <SelectItem key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-title">Title</Label>
              <Input id="res-title" name="title" required placeholder="Hotel Sunrise" className="h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="res-provider">Provider</Label>
              <Input id="res-provider" name="provider" placeholder="Booking.com" className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-conf">Confirmation code</Label>
              <Input id="res-conf" name="confirmation_code" placeholder="ABC123" className="h-11" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="res-location">Location</Label>
            <Input id="res-location" name="location" placeholder="123 Main St" className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="res-start">Start</Label>
              <Input id="res-start" name="start_datetime" type="datetime-local" className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="res-end">End</Label>
              <Input id="res-end" name="end_datetime" type="datetime-local" className="h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="res-cost">Cost ($)</Label>
              <Input id="res-cost" name="cost" type="number" step="0.01" min="0" placeholder="0.00" className="h-11" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="res-notes">Notes</Label>
            <Textarea id="res-notes" name="notes" rows={2} />
          </div>
          <Button type="submit" disabled={create.isPending} className="h-11 mt-1">
            {create.isPending ? "Adding..." : "Add reservation"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
