import { useCallback, useEffect, useRef, useState } from "react";

interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Runs `loader` whenever `deps` change, tracking loading/error state and
 * discarding responses from superseded requests.
 */
export function useApiData<T>(loader: () => Promise<T>, deps: unknown[]) {
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  const [state, setState] = useState<ApiState<T>>({ data: null, loading: true, error: null });
  const [reloadCount, setReloadCount] = useState(0);

  useEffect(() => {
    let active = true;
    setState(prev => ({ ...prev, loading: true, error: null }));
    loaderRef.current()
      .then(data => active && setState({ data, loading: false, error: null }))
      .catch(error => active && setState({ data: null, loading: false, error: error.message }));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, reloadCount]);

  const reload = useCallback(() => setReloadCount(c => c + 1), []);
  return { ...state, reload };
}

export function useDebouncedValue<T>(value: T, delay = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
