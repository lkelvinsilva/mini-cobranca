import { useEffect, useState, useCallback } from 'react';
export default function useFetch(fn, deps = []) {
  const [s, set] = useState({ data: null, loading: true, error: null });
  const run = useCallback(() => { set((p) => ({ ...p, loading: true, error: null })); fn().then((data) => set({ data, loading: false, error: null })).catch((e) => set({ data: null, loading: false, error: e.message === 'Failed to fetch' ? 'API indisponível em ' + (import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000') : e.message })); }, deps); // eslint-disable-line
  useEffect(run, [run]);
  return { ...s, reload: run };
}
