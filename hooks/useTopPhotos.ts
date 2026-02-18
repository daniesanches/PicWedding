"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { getTopPhotos, subscribeToTopPhotos } from "@/lib/imgbb";
import type { Photo } from "@/types";

/**
 * Custom hook for fetching top photos with most likes with real-time updates
 * @param count Number of top photos to fetch (default: 10)
 * @returns Object containing top photos array and loading state
 */
export function useTopPhotos(count: number = 4) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Fetch initial data and subscribe to real-time updates
  useEffect(() => {
    setLoading(true);

    // First fetch initial data
    const fetchInitialData = async () => {
      try {
        const topPhotos = await getTopPhotos(count);
        setPhotos(topPhotos);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial top photos:", error);
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToTopPhotos((updatedPhotos) => {
      setPhotos(updatedPhotos);
      setLoading(false);
    }, count);

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, [count]);

  return {
    photos,
    loading,
    refresh: () => {
      setLoading(true);
      getTopPhotos(count).then((topPhotos) => {
        setPhotos(topPhotos);
        setLoading(false);
      });
    },
  };
}
