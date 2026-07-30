// Mirrors the backend's Pydantic schemas exactly. Keep in sync with the OpenAPI spec.

export type PeriodMode = "fixed_days" | "end_date";

export interface TrackerResponse {
  id: number;
  name: string;
  period_mode: PeriodMode | null;
  start_date: string | null; // "YYYY-MM-DD" — kept as a string, parsed only at display time
  created_at: string;        // ISO datetime string
}

export interface TrackerCreate {
  name: string;
  start_date: string;             // "YYYY-MM-DD"
  num_days?: number;               // exactly one of num_days / end_date
  end_date?: string;                // "YYYY-MM-DD"
  initial_habit_names: string[];
}

export interface HabitResponse {
  id: number;
  tracker_id: number;
  name: string;
  created_at: string;
  archived_at: string | null;
}

export interface HabitCreate {
  name: string;
}

export interface MatrixEntryOut {
  entry_id: number;
  habit_id: number;
  completed: boolean;
}

export interface MatrixDayOut {
  id: number;
  day_index: number;
  date: string;
  entries: MatrixEntryOut[];
}

export interface MatrixHabitOut {
  id: number;
  name: string;
}

export interface MatrixResponse {
  tracker_id: number;
  habits: MatrixHabitOut[];
  days: MatrixDayOut[];
}

export interface EntryUpdate {
  entry_id: number;
  completed: boolean;
}

export interface MatrixUpdateRequest {
  updates: EntryUpdate[];
}

export interface DayResponse {
  id: number;
  day_index: number;
  date: string;
}

export interface DayAppendRequest {
  num_days: number;
}

// Matches your exception handlers exactly: every error path returns this shape.
export type ErrorCode =
  | "not_found"
  | "already_configured"
  | "validation_error"
  | "internal_error";

export interface ApiErrorBody {
  detail: string;
  error_code: ErrorCode;
}