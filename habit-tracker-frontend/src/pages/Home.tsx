import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getTrackers } from "../api/trackers";
import TrackerCard from "../components/TrackerCard";
import CreateTrackerForm from "../components/CreateTrackerForm";

function Home() {
  const [showForm, setShowForm] = useState(false);

  const { data: trackers, isLoading, error } = useQuery({
    queryKey: ["trackers"],
    queryFn: getTrackers,
  });

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-ink">Habit Trackers</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-primary text-white font-bold px-4 py-2 border-2 border-ink"
        >
          + New Tracker
        </button>
      </div>

      {isLoading && <p className="text-ink-soft">Loading...</p>}
      {error && <p className="text-danger">Failed to load trackers.</p>}

      {trackers && trackers.length === 0 && (
        <p className="text-ink-soft">No trackers yet. Create your first one.</p>
      )}

      {trackers && trackers.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {trackers.map((t, i) => (
            <TrackerCard key={t.id} tracker={t} index={i} />
          ))}
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4">
          <CreateTrackerForm onClose={() => setShowForm(false)} />
        </div>
      )}
    </div>
  );
}

export default Home;