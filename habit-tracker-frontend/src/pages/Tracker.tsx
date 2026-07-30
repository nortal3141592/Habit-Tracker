import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getMatrix, deleteTracker } from "../api/trackers";
import { ApiError } from "../api/client";
import MatrixGrid from "../components/MatrixGrid";
import ErrorBanner from "../components/ErrorBanner";
import ConfirmDialog from "../components/ConfirmDialog";

function Tracker() {
  const { id } = useParams();
  const trackerId = Number(id);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { data: matrix, isLoading, error } = useQuery({
    queryKey: ["matrix", trackerId],
    queryFn: () => getMatrix(trackerId),
    enabled: !Number.isNaN(trackerId),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteTracker(trackerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trackers"] });
      navigate("/");
    },
    onError: (err) => {
      setDeleteError(
        err instanceof ApiError ? err.message : "Could not delete this tracker."
      );
    },
  });

  if (Number.isNaN(trackerId)) return <div className="p-6">Invalid tracker id.</div>;
  if (isLoading) return <div className="p-6 text-ink-soft">Loading...</div>;
  if (error || !matrix)
    return <div className="p-6 text-danger">Failed to load this tracker.</div>;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => navigate("/")} className="text-ink-soft text-sm">
          ← Back
        </button>
        <button
          onClick={() => setConfirmingDelete(true)}
          disabled={deleteMutation.isPending}
          className="bg-danger text-white font-bold px-4 py-2 border-2 border-ink disabled:opacity-40"
        >
          {deleteMutation.isPending ? "Deleting..." : "Delete Tracker"}
        </button>
      </div>

      {deleteError && (
        <ErrorBanner message={deleteError} onDismiss={() => setDeleteError(null)} />
      )}

      <MatrixGrid trackerId={trackerId} matrix={matrix} />

      {confirmingDelete && (
        <ConfirmDialog
          title="Delete this tracker?"
          message="This removes all its days, habits, and entries permanently. This can't be undone."
          confirmLabel="Delete Tracker"
          onConfirm={() => {
            setConfirmingDelete(false);
            setDeleteError(null);
            deleteMutation.mutate();
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      )}
    </div>
  );
}

export default Tracker;