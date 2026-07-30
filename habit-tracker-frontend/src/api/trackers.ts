import { apiFetch } from "./client";
import type {
  TrackerResponse,
  TrackerCreate,
  HabitResponse,
  HabitCreate,
  MatrixResponse,
  MatrixUpdateRequest,
  DayResponse,
  DayAppendRequest,
} from "./types";

export const getTrackers = () => apiFetch<TrackerResponse[]>("/trackers");

export const getTracker = (id: number) =>
  apiFetch<TrackerResponse>(`/trackers/${id}`);

export const createTracker = (data: TrackerCreate) =>
  apiFetch<TrackerResponse>("/trackers", {
    method: "POST",
    body: JSON.stringify(data),
  });

export const deleteTracker = (id: number) =>
  apiFetch<void>(`/trackers/${id}`, { method: "DELETE" });

export const getMatrix = (trackerId: number) =>
  apiFetch<MatrixResponse>(`/trackers/${trackerId}/matrix`);

export const updateMatrix = (trackerId: number, data: MatrixUpdateRequest) =>
  apiFetch<MatrixResponse>(`/trackers/${trackerId}/matrix`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const appendDays = (trackerId: number, data: DayAppendRequest) =>
  apiFetch<DayResponse[]>(`/trackers/${trackerId}/days`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const createHabit = (trackerId: number, data: HabitCreate) =>
  apiFetch<HabitResponse>(`/habits/${trackerId}/habits`, {
    method: "POST",
    body: JSON.stringify(data),
  });

export const archiveHabit = (trackerId: number, habitId: number) =>
  apiFetch<HabitResponse>(`/habits/${trackerId}/habits/${habitId}`, {
    method: "DELETE",
  });