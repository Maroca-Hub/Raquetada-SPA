import { useCallback, useEffect, useRef, useState } from "react";
import type { Page } from "../types";

export const PAGE_SIZE = 20;

interface PaginatedState<T> {
  items: T[];
  page: number; // last loaded page (1-indexed); 0 = nothing loaded yet
  hasMore: boolean;
  total: number | null;
  loading: boolean; // initial / reset load
  loadingMore: boolean; // appending the next page
  error: string | null;
}

const initial = <T,>(): PaginatedState<T> => ({
  items: [],
  page: 0,
  hasMore: true,
  total: null,
  loading: true,
  loadingMore: false,
  error: null,
});

/**
 * Infinite-scroll list backed by a Spring `Page<T>` endpoint. `fetchPage` must
 * be a memoized callback — the list resets to page 1 whenever its identity
 * changes (e.g. a filter changed). Page size is fixed server-side.
 */
export function usePaginatedList<T>(
  fetchPage: (page: number) => Promise<Page<T>>,
) {
  const [state, setState] = useState<PaginatedState<T>>(initial<T>);
  const stateRef = useRef(state);
  const runIdRef = useRef(0);

  useEffect(() => {
    stateRef.current = state;
  });

  const load = useCallback(
    async (page: number, reset: boolean) => {
      const runId = ++runIdRef.current;
      setState((s) => ({
        ...s,
        loading: reset,
        loadingMore: !reset,
        error: null,
      }));
      try {
        const res = await fetchPage(page);
        if (runId !== runIdRef.current) return;
        const noMore =
          res.last === true || res.content.length < PAGE_SIZE;
        setState((s) => ({
          items: reset ? res.content : [...s.items, ...res.content],
          page,
          hasMore: !noMore,
          total:
            typeof res.totalElements === "number" ? res.totalElements : s.total,
          loading: false,
          loadingMore: false,
          error: null,
        }));
      } catch (err) {
        if (runId !== runIdRef.current) return;
        setState((s) => ({
          ...s,
          loading: false,
          loadingMore: false,
          error: (err as Error).message,
        }));
      }
    },
    [fetchPage],
  );

  useEffect(() => {
    void (async () => {
      await load(1, true);
    })();
  }, [load]);

  const loadMore = useCallback(() => {
    const s = stateRef.current;
    if (s.loading || s.loadingMore || !s.hasMore) return;
    void load(s.page + 1, false);
  }, [load]);

  const reload = useCallback(() => {
    void load(1, true);
  }, [load]);

  return { ...state, loadMore, reload };
}
