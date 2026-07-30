import { Link } from "react-router-dom";

function ErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="border-2 border-ink bg-bg p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-4 border-2 border-danger flex items-center justify-center">
          <span className="text-danger text-3xl font-bold">!</span>
        </div>
        <h1 className="text-2xl font-bold text-ink mb-2">Page not found</h1>
        <p className="text-sm text-ink-soft mb-6">
          Nothing lives at this address. It may have been deleted, or the link
          might just be wrong.
        </p>
        <Link
          to="/"
          className="inline-block bg-primary text-white font-bold px-5 py-2 border-2 border-ink"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default ErrorPage;