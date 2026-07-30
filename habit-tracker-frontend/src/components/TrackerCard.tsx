import { Link } from "react-router-dom";
import type { TrackerResponse } from "../api/types";

const ACCENT_CYCLE = [
  "border-l-accent-purple",
  "border-l-accent-teal",
  "border-l-warning",
  "border-l-primary",
];

interface Props {
  tracker: TrackerResponse;
  index: number;
}

function TrackerCard({ tracker, index }: Props) {
  const accent = ACCENT_CYCLE[index % ACCENT_CYCLE.length];

  return (
    <Link
      to={`/trackers/${tracker.id}`}
      className={`block border-2 border-ink ${accent} border-l-4 bg-bg p-5 hover:bg-border/30 transition-colors`}
    >
      <h3 className="text-lg font-bold text-ink">{tracker.name}</h3>
      <p className="text-sm text-ink-soft mt-1">
        Starts {tracker.start_date ?? "unknown"}
      </p>
    </Link>
  );
}

export default TrackerCard;