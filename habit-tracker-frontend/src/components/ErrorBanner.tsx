interface Props {
  message: string;
  onDismiss?: () => void;
}

function ErrorBanner({ message, onDismiss }: Props) {
  return (
    <div className="flex justify-between items-center gap-3 border-2 border-danger bg-danger/10 text-danger px-4 py-3 mb-4">
      <span className="text-sm font-medium">{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="font-bold shrink-0"
          aria-label="Dismiss"
        >
          ✕
        </button>
      )}
    </div>
  );
}

export default ErrorBanner;