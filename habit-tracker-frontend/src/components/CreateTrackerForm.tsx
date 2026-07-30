import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createTracker } from "../api/trackers";
import { ApiError } from "../api/client";

function CreateTrackerForm({ onClose }: { onClose: () => void }) {
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [periodType, setPeriodType] = useState<"num_days" | "end_date">("num_days");
  const [numDays, setNumDays] = useState("");
  const [endDate, setEndDate] = useState("");
  const [habitNames, setHabitNames] = useState([""]);
  const [formError, setFormError] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: createTracker,
    onSuccess: (tracker) => {
      // Tell React Query the trackers list is stale so Home refetches with the new one included.
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      navigate(`/trackers/${tracker.id}`);
    },
    onError: (err) => {
      setFormError(err instanceof ApiError ? err.message : "Something went wrong.");
    },
  });

  function updateHabitName(i: number, value: string) {
    const next = [...habitNames];
    next[i] = value;
    setHabitNames(next);
  }

  function addHabitField() {
    setHabitNames([...habitNames, ""]);
  }

  function removeHabitField(i: number) {
    setHabitNames(habitNames.filter((_, idx) => idx !== i));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    const cleanedHabits = habitNames.map((h) => h.trim()).filter(Boolean);
    if (cleanedHabits.length === 0) {
      setFormError("Add at least one habit.");
      return;
    }

    mutation.mutate({
      name,
      start_date: startDate,
      initial_habit_names: cleanedHabits,
      ...(periodType === "num_days"
        ? { num_days: Number(numDays) }
        : { end_date: endDate }),
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-2 border-ink bg-bg p-6 max-w-md w-full"
    >
      <h2 className="text-xl font-bold mb-4">New Tracker</h2>

      {formError && (
        <p className="text-danger text-sm mb-3 font-medium">{formError}</p>
      )}

      <label className="block mb-3">
        <span className="text-sm text-ink-soft">Name</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border-2 border-border p-2 mt-1 focus:border-primary outline-none"
        />
      </label>

      <label className="block mb-3">
        <span className="text-sm text-ink-soft">Start date</span>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          required
          className="w-full border-2 border-border p-2 mt-1 focus:border-primary outline-none"
        />
      </label>

      <div className="mb-3">
        <span className="text-sm text-ink-soft">Length</span>
        <div className="flex gap-4 mt-1">
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              checked={periodType === "num_days"}
              onChange={() => setPeriodType("num_days")}
            />
            Number of days
          </label>
          <label className="flex items-center gap-1 text-sm">
            <input
              type="radio"
              checked={periodType === "end_date"}
              onChange={() => setPeriodType("end_date")}
            />
            End date
          </label>
        </div>

        {periodType === "num_days" ? (
          <input
            type="number"
            min={1}
            value={numDays}
            onChange={(e) => setNumDays(e.target.value)}
            required
            placeholder="e.g. 30"
            className="w-full border-2 border-border p-2 mt-2 focus:border-primary outline-none"
          />
        ) : (
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
            className="w-full border-2 border-border p-2 mt-2 focus:border-primary outline-none"
          />
        )}
      </div>

      <div className="mb-4">
        <span className="text-sm text-ink-soft">Habits</span>
        {habitNames.map((h, i) => (
          <div key={i} className="flex gap-2 mt-1">
            <input
              value={h}
              onChange={(e) => updateHabitName(i, e.target.value)}
              placeholder={`Habit ${i + 1}`}
              className="flex-1 border-2 border-border p-2 focus:border-primary outline-none"
            />
            {habitNames.length > 1 && (
              <button
                type="button"
                onClick={() => removeHabitField(i)}
                className="text-danger font-bold px-2"
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={addHabitField}
          className="text-primary text-sm mt-2 font-medium"
        >
          + Add habit
        </button>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={mutation.isPending}
          className="bg-primary text-white font-bold px-4 py-2 border-2 border-ink disabled:opacity-50"
        >
          {mutation.isPending ? "Creating..." : "Create Tracker"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 border-2 border-border text-ink-soft"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}

export default CreateTrackerForm;