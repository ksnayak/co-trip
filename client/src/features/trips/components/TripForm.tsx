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
import { useCreateTrip } from "../hooks/useTrips";
import { toast } from "sonner";
import { Plus, Sparkles } from "lucide-react";
import { CURRENCIES, getCurrencySymbol } from "@/lib/currency";

export function CreateTripDialog() {
  const [open, setOpen] = useState(false);
  const createTrip = useCreateTrip();
  const [currency, setCurrency] = useState("INR");

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
      await createTrip.mutateAsync(data);
      toast.success("Trip created");
      setOpen(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create trip");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Trip</span>
          <span className="sm:hidden">New</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Plan a new trip
          </DialogTitle>
          <DialogDescription>Fill in the details to start planning your adventure.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4 mt-2">
          <div className="grid gap-2">
            <Label htmlFor="title">Trip name</Label>
            <Input id="title" name="title" placeholder="Summer in Italy" required className="h-11" />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="destination">Destination</Label>
            <Input id="destination" name="destination" placeholder="Rome, Italy" className="h-11" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="start_date">Start date</Label>
              <Input id="start_date" name="start_date" type="date" className="h-11" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end_date">End date</Label>
              <Input id="end_date" name="end_date" type="date" className="h-11" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="grid gap-2">
              <Label htmlFor="budget">Budget ({getCurrencySymbol(currency)})</Label>
              <Input id="budget" name="budget" type="number" step="0.01" min="0" placeholder="0.00" className="h-11" />
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
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" placeholder="What's the plan?" rows={3} />
          </div>
          <Button type="submit" disabled={createTrip.isPending} className="h-11 mt-1">
            {createTrip.isPending ? "Creating..." : "Create trip"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
