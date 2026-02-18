"use client";

import { useState, useEffect } from "react";
import { toggleLike } from "@/lib/imgbb";
import type { Photo } from "@/types";

/**
 * Custom hook for managing photo likes with localStorage persistence
 * @returns Object containing liked photos set, animating likes, and like handler
 */
export function usePhotoLikes() {
  const [likedPhotos, setLikedPhotos] = useState<Set<string>>(new Set());
  const [animatingLikes, setAnimatingLikes] = useState<Set<string>>(new Set());

  // Load liked photos from localStorage on mount
  useEffect(() => {
    const savedLikes = localStorage.getItem("picwedding_likes");
    if (savedLikes) {
      setLikedPhotos(new Set(JSON.parse(savedLikes)));
    }
  }, []);

  /**
   * Handles like/unlike action
   * @param photoId ID of the photo to like/unlike
   */
  const handleLike = async (
    photoId: string,
  ) => {
    const isLiked = likedPhotos.has(photoId);
    const newLikedPhotos = new Set(likedPhotos);

    if (isLiked) {
      newLikedPhotos.delete(photoId);
    } else {
      newLikedPhotos.add(photoId);
      // Trigger animation
      setAnimatingLikes((prev) => new Set(prev).add(photoId));
      setTimeout(() => {
        setAnimatingLikes((prev) => {
          const next = new Set(prev);
          next.delete(photoId);
          return next;
        });
      }, 600);
    }

    // Update local state
    setLikedPhotos(newLikedPhotos);
    localStorage.setItem(
      "picwedding_likes",
      JSON.stringify(Array.from(newLikedPhotos)),
    );

    // Sync with backend
    try {
      await toggleLike(photoId, !isLiked);
    } catch (error) {
      // Revert on error
      const reverted = new Set(newLikedPhotos);
      if (isLiked) reverted.add(photoId);
      else reverted.delete(photoId);
      setLikedPhotos(reverted);
      localStorage.setItem(
        "picwedding_likes",
        JSON.stringify(Array.from(reverted)),
      );
    }
  };

  return { likedPhotos, animatingLikes, handleLike };
}
