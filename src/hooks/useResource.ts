import { useEffect, useState } from "react";
import { useApi } from "./useApi";
import type { Api } from "../services/api";

interface ResourceState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

export function useResource<T>(load: (api: Api) => Promise<T>, deps: unknown[] = []) {
  const api = useApi();
  const [state, setState] = useState<ResourceState<T>>({ data: null, error: null, loading: true });

  useEffect(() => {
    let active = true;
    load(api)
      .then((result) => {
        if (active) setState({ data: result, error: null, loading: false });
      })
      .catch((err: Error) => {
        if (active) setState({ data: null, error: err.message, loading: false });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
