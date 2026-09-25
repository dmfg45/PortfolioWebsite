import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-6 text-center">
      <div className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-1/2 left-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/20 blur-[110px]" />
      </div>
      <div>
        <p className="bg-gradient-to-r from-accent-light to-accent-2 bg-clip-text font-display text-7xl font-bold text-transparent">
          404
        </p>
        <h1 className="mt-4 font-display text-2xl font-bold text-white">Page not found</h1>
        <p className="mt-2 text-white/60">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          to="/"
          className="mt-8 inline-block rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-[0_8px_30px_-8px_rgba(109,94,252,0.7)] transition-all hover:-translate-y-0.5 hover:bg-accent-light"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}
