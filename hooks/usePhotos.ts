"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { getPhotos, subscribeToPhotos } from "@/lib/imgbb";
import type { Photo } from "@/types";

/**
 * Custom hook for fetching photos with real-time updates and page-based pagination
 * @param pageSize Number of photos to fetch per page (default: 6)
 * @returns Object containing photos array, loading states, and pagination functions
 */
export function usePhotos(pageSize: number = 6) {
  const [allPhotos, setAllPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const unsubscribeRef = useRef<(() => void) | null>(null);

  // Calculate derived state
  const totalPages = useMemo(() => {
    return Math.ceil(allPhotos.length / pageSize) || 1;
  }, [allPhotos, pageSize]);

  const photos = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return allPhotos.slice(startIndex, endIndex);
  }, [allPhotos, currentPage, pageSize]);

  // Update page photos
  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  }, [totalPages]);

  // Subscribe to real-time updates
  useEffect(() => {
    setLoading(true);

    // First fetch initial data
    const fetchInitialData = async () => {
      try {
        const result = await getPhotos(null, 100, true);
        setAllPhotos(result.photos);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching initial photos:", error);
        setLoading(false);
      }
    };

    fetchInitialData();

    // Subscribe to real-time updates
    const unsubscribe = subscribeToPhotos((updatedPhotos) => {
      setAllPhotos(updatedPhotos);
      setLoading(false);
    });

    unsubscribeRef.current = unsubscribe;

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
      }
    };
  }, []);

  return {
    photos,
    loading,
    currentPage,
    totalPages,
    goToPage,
    fetchPhotos: (page: number = 1) => goToPage(page),
  };
}
