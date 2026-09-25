import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

const links = [
  { href: "#hero", label: "Home" },
  { href: "#about", label: "About" },
  { href: "#work", label: "Work" },
  { href: "#contact", label: "Contact" },
];

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 8);
    }
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleButtonRef.current?.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled || open
          ? "bg-ink/80 backdrop-blur-lg border-b border-white/10 shadow-[0_1px_0_0_rgba(255,255,255,0.03)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="group flex items-center gap-2.5 font-display text-lg font-bold tracking-tight text-white"
        >
          <img
            src="/images/logo.png"
            alt="André Graça"
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white/10 transition-all group-hover:ring-accent-light/60"
          />
          André Graça
        </Link>

        <ul className="hidden sm:flex items-center gap-1 text-sm text-white/70">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="relative block px-4 py-2 transition-colors hover:text-white before:absolute before:inset-x-4 before:bottom-1 before:h-px before:origin-left before:scale-x-0 before:bg-gradient-to-r before:from-accent-light before:to-accent-2 before:transition-transform before:duration-300 hover:before:scale-x-100"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <button
          ref={toggleButtonRef}
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="mobile-menu"
          className="sm:hidden flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-lg border border-white/10 text-white/80 transition-colors hover:border-white/20 hover:text-white"
        >
          <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? "translate-y-2 rotate-45" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition-opacity ${open ? "opacity-0" : ""}`} />
          <span className={`block h-0.5 w-5 bg-current transition-transform ${open ? "-translate-y-2 -rotate-45" : ""}`} />
        </button>
      </nav>

      {open && (
        <ul
          id="mobile-menu"
          data-testid="mobile-menu"
          className="sm:hidden border-t border-white/10 bg-ink/95 px-6 py-4 space-y-4 text-sm text-white/70"
        >
          {links.map((link) => (
            <li key={link.href}>
              <a href={link.href} onClick={() => setOpen(false)} className="block hover:text-white transition-colors">
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      )}
    </header>
  );
}
