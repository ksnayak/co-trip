import * as tripsRepo from "../repositories/trips.repository";
import { BadRequestError, NotFoundError } from "../utils/errors";

export async function getTrips(userId: string) {
  const rows = await tripsRepo.findByUserId(userId);
  return rows.map((r) => ({ ...r.trips, role: r.role }));
}

export async function getTrip(id: string) {
  const trip = await tripsRepo.findById(id);
  if (!trip) throw new NotFoundError("Trip not found");
  return trip;
}

export async function createTrip(
  userId: string,
  data: {
    title: string;
    description?: string;
    destination?: string;
    start_date?: string;
    end_date?: string;
    budget_cents?: number;
    currency?: string;
    cover_image?: string;
  }
) {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (end < start) {
      throw new BadRequestError("End date must be after start date");
    }
  }

  return tripsRepo.create({ ...data, created_by: userId });
}

export async function updateTrip(
  id: string,
  data: Partial<{
    title: string;
    description: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget_cents: number;
    currency: string;
    cover_image: string;
  }>
) {
  if (data.start_date && data.end_date) {
    const start = new Date(data.start_date);
    const end = new Date(data.end_date);
    if (end < start) {
      throw new BadRequestError("End date must be after start date");
    }
  }

  const trip = await tripsRepo.update(id, data);
  if (!trip) throw new NotFoundError("Trip not found");
  return trip;
}

export async function deleteTrip(id: string) {
  await tripsRepo.softDelete(id);
}
