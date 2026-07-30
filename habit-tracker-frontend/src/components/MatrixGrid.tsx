import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { MatrixResponse } from "../api/types";
import {
  updateMatrix,
  appendDays,
  createHabit,
  archiveHabit,
} from "../api/trackers";

import { ApiError } from "../api/client";
import ErrorBanner from "./ErrorBanner";
import ConfirmDialog from "./ConfirmDialog";

interface Props {
  trackerId: number;
  matrix: MatrixResponse;
}

function MatrixGrid({ trackerId, matrix }: Props) {
  // entry_id -> new completed value, only for cells the user has touched but not saved
  const [dirty, setDirty] = useState<Map<number, boolean>>(new Map());
  const [newHabitName, setNewHabitName] = useState("");
  const [addingHabit, setAddingHabit] = useState(false);
  const [appendCount, setAppendCount] = useState("7");
  const [habitError, setHabitError] = useState<string | null>(null);
  const [confirmingHabitId, setConfirmingHabitId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const invalidate = () =>
    queryClient.invalidateQueries({ queryKey: ["matrix", trackerId] });

  const saveMutation = useMutation({
    mutationFn: () =>
      updateMatrix(trackerId, {
        updates: Array.from(dirty.entries()).map(([entry_id, completed]) => ({
          entry_id,
          completed,
        })),
      }),
    onSuccess: () => {
      setDirty(new Map());
      invalidate();
    },
  });

  const appendDaysMutation = useMutation({
    mutationFn: () => appendDays(trackerId, { num_days: Number(appendCount) }),
    onSuccess: invalidate,
  });

  const addHabitMutation = useMutation({
    mutationFn: () => createHabit(trackerId, { name: newHabitName }),
    onSuccess: () => {
      setNewHabitName("");
      setAddingHabit(false);
      invalidate();
    },
  });

  const archiveHabitMutation = useMutation({
  mutationFn: (habitId: number) => archiveHabit(trackerId, habitId),
  onSuccess: () => {
    setHabitError(null);
    invalidate();
  },
  onError: (err) => {
    setHabitError(
      err instanceof ApiError ? err.message : "Could not delete this habit."
    );
  },
});

  function toggleCell(entryId: number, currentValue: boolean) {
    const next = new Map(dirty);
    next.set(entryId, !currentValue);
    setDirty(next);
  }

  function isChecked(entryId: number, serverValue: boolean): boolean {
    return dirty.has(entryId) ? dirty.get(entryId)! : serverValue;
  }

  const hasUnsavedChanges = dirty.size > 0;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <p className="text-sm text-ink-soft">
          {hasUnsavedChanges
            ? `${dirty.size} unsaved change${dirty.size > 1 ? "s" : ""}`
            : "All changes saved"}
        </p>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={!hasUnsavedChanges || saveMutation.isPending}
          className="bg-primary text-white font-bold px-4 py-2 border-2 border-ink disabled:opacity-40"
        >
          {saveMutation.isPending ? "Saving..." : "Save Changes"}
        </button>
      </div>

       {habitError && (
        <ErrorBanner
          message={habitError}
          onDismiss={() => setHabitError(null)}
        />
      )}


      <div className="overflow-x-auto border-2 border-ink">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-2 border-ink p-2 bg-bg text-left sticky left-0">
                Day
              </th>
              {matrix.habits.map((habit) => (
                <th
                  key={habit.id}
                  className="border-2 border-ink p-2 bg-bg text-sm min-w-[100px]"
                >
                  <div className="flex items-center justify-between gap-2 px-1">
                    <span>{habit.name}</span>
                    <button
                    onClick={() => setConfirmingHabitId(habit.id)}
                    title="Delete habit"
                    className="text-danger font-bold shrink-0 px-1 py-0.5 hover:bg-danger/10"
                    >
                    ✕
                    </button>
                    </div>
                </th>
              ))}
              <th className="border-2 border-ink p-2 bg-bg w-12">
                <button
                  onClick={() => setAddingHabit(true)}
                  title="Add habit"
                  className="text-primary font-bold text-lg"
                >
                  +
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {matrix.days.map((day) => (
              <tr key={day.id}>
                <td className="border-2 border-ink p-2 text-sm font-medium bg-bg sticky left-0">
                  Day {day.day_index} — {day.date}
                </td>
                {matrix.habits.map((habit) => {
                  const entry = day.entries.find((e) => e.habit_id === habit.id);
                  if (!entry) {
                    // Shouldn't happen given the backend backfills entries, but don't crash if it does.
                    return <td key={habit.id} className="border-2 border-border p-2" />;
                  }
                  const checked = isChecked(entry.entry_id, entry.completed);
                  const isDirty = dirty.has(entry.entry_id);
                  return (
                    <td
                      key={habit.id}
                      className="border-2 border-border p-2 text-center"
                    >
                      <button
                        onClick={() => toggleCell(entry.entry_id, checked)}
                        className={`w-6 h-6 border-2 inline-flex items-center justify-center ${
                          checked
                            ? "bg-success border-success"
                            : "bg-bg border-border"
                        } ${isDirty ? "ring-2 ring-warning" : ""}`}
                      >
                        {checked && (
                          <span className="text-white text-sm font-bold">✓</span>
                        )}
                      </button>
                    </td>
                  );
                })}
                <td className="border-2 border-border" />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {addingHabit && (
        <div className="flex gap-2 mt-3 items-center">
          <input
            value={newHabitName}
            onChange={(e) => setNewHabitName(e.target.value)}
            placeholder="Habit name"
            className="border-2 border-border p-2 focus:border-primary outline-none"
          />
          <button
            onClick={() => addHabitMutation.mutate()}
            disabled={!newHabitName.trim() || addHabitMutation.isPending}
            className="bg-primary text-white font-bold px-3 py-2 border-2 border-ink disabled:opacity-40"
          >
            Add
          </button>
          <button
            onClick={() => setAddingHabit(false)}
            className="px-3 py-2 border-2 border-border text-ink-soft"
          >
            Cancel
          </button>
        </div>
      )}

      <div className="flex gap-2 mt-4 items-center">
        <input
          type="number"
          min={1}
          value={appendCount}
          onChange={(e) => setAppendCount(e.target.value)}
          className="border-2 border-border p-2 w-20 focus:border-primary outline-none"
        />
        <button
          onClick={() => appendDaysMutation.mutate()}
          disabled={appendDaysMutation.isPending}
          className="border-2 border-ink font-bold px-3 py-2 disabled:opacity-40"
        >
          {appendDaysMutation.isPending ? "Adding..." : "Add Days"}
        </button>
      </div>
      {confirmingHabitId !== null && (
  <ConfirmDialog
    title="Delete this habit?"
    message={`Historical data for "${
      matrix.habits.find((h) => h.id === confirmingHabitId)?.name ?? "this habit"
    }" is preserved but it won't show here anymore.`}
    confirmLabel="Delete Habit"
    onConfirm={() => {
      archiveHabitMutation.mutate(confirmingHabitId);
      setConfirmingHabitId(null);
    }}
    onCancel={() => setConfirmingHabitId(null)}
  />
)}
    </div>
  );
}

export default MatrixGrid;