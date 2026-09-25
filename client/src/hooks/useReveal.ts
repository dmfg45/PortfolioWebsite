import { useEffect, useRef, useState } from "react";

/**
 * Tracks whether an element has scrolled into view, for a one-shot
 * fade-up-in animation. Falls back to "already visible" when
 * IntersectionObserver isn't available (older browsers, jsdom in tests)
 * so content is never hidden behind an animation that can't run.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [visible, setVisible] = useState(typeof IntersectionObserver === "undefined");

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, visible };
}
