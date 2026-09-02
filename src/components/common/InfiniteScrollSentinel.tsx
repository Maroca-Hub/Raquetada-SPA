import { useEffect, useRef } from "react";

/**
 * Invisible element placed at the end of a list; calls `onReach` when it scrolls
 * into view (200px early). Render it only while there are more pages to load.
 * `onReach` should be a stable callback.
 */
export function InfiniteScrollSentinel({
  onReach,
  disabled = false,
}: {
  onReach: () => void;
  disabled?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (disabled) return;
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) onReach();
      },
      { rootMargin: "200px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [disabled, onReach]);

  return <div ref={ref} aria-hidden style={{ height: 1 }} />;
}
