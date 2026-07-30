interface Props {
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onCancel,
}: Props) {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-4 z-50">
      <div className="border-2 border-ink bg-bg p-6 max-w-sm w-full">
        <h2 className="text-lg font-bold text-ink mb-2">{title}</h2>
        <p className="text-sm text-ink-soft mb-5">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 border-2 border-border text-ink-soft"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-danger text-white font-bold px-4 py-2 border-2 border-ink"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;