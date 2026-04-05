"use client";

import { useState, useEffect, useCallback } from "react";
import {
  fetchLists,
  fetchListBySlug,
  type List,
  type ListWithItems,
  type ListsClientOptions,
} from "./client";

export interface UseListsReturn {
  lists: List[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useLists(opts?: ListsClientOptions): UseListsReturn {
  const [lists, setLists] = useState<List[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    setError(null);
    fetchLists(opts)
      .then(setLists)
      .catch((err) => setError(err.message ?? "Failed to fetch lists"))
      .finally(() => setLoading(false));
  }, [opts?.projectToken, opts?.apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  return { lists, loading, error, refetch: load };
}

export interface UseListReturn {
  list: ListWithItems | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useList(
  slug: string | null | undefined,
  opts?: ListsClientOptions,
): UseListReturn {
  const [list, setList] = useState<ListWithItems | null>(null);
  const [loading, setLoading] = useState(!!slug);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    if (!slug) {
      setList(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetchListBySlug(slug, opts)
      .then(setList)
      .catch((err) => setError(err.message ?? "Failed to fetch list"))
      .finally(() => setLoading(false));
  }, [slug, opts?.projectToken, opts?.apiUrl]);

  useEffect(() => {
    load();
  }, [load]);

  return { list, loading, error, refetch: load };
}
