import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6 text-center">
      <div>
        <p className="text-accent-light font-display text-6xl font-bold">404</p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-white/60">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-light transition-colors"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
