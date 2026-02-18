"use client";

import { useState, memo } from "react";
import Image from "next/image";
import type { Photo } from "@/types";

interface GalleryGridProps {
  photos: Photo[];
  loading: boolean;
  onPhotoClick: (photo: Photo) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

interface GalleryItemProps {
  photo: Photo;
  onPhotoClick: (photo: Photo) => void;
}

const GalleryItem = memo(({ photo, onPhotoClick }: GalleryItemProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div className="gallery-item" onClick={() => onPhotoClick(photo)}>
      {!imageLoaded && (
        <div className="skeleton gallery-item-skeleton" aria-hidden />
      )}
      <Image
        src={photo.url}
        alt="Recuerdo de boda"
        width={400}
        height={400}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        style={{ opacity: imageLoaded ? 1 : 0 }}
        className="gallery-item-img"
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
        priority={false}
      />
    </div>
  );
}, (prev, next) => prev.photo.id === next.photo.id);

GalleryItem.displayName = "GalleryItem";

/**
 * Generate page numbers with ellipsis for dynamic pagination
 * Example: < 1 2 3 ... 8 9 >
 */
function getPageNumbers(
  currentPage: number,
  totalPages: number,
): (number | string)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const pages: (number | string)[] = [];

  // Always show first page
  pages.push(1);

  // Calculate range around current page
  const leftBound = Math.max(2, currentPage - 1);
  const rightBound = Math.min(totalPages - 1, currentPage + 1);

  // Add ellipsis if there's a gap after first page
  if (leftBound > 2) {
    pages.push("...");
  }

  // Add pages around current page
  for (let i = leftBound; i <= rightBound; i++) {
    pages.push(i);
  }

  // Add ellipsis if there's a gap before last page
  if (rightBound < totalPages - 1) {
    pages.push("...");
  }

  // Always show last page
  pages.push(totalPages);

  return pages;
}

/**
 * Gallery grid component with dynamic pagination
 */
export function GalleryGrid({
  photos,
  loading,
  onPhotoClick,
  currentPage,
  totalPages,
  onPageChange,
}: GalleryGridProps) {
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  if (loading) {
    return (
      <div className="gallery-grid">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="skeleton"
            style={{ aspectRatio: "1", borderRadius: "var(--radius-sm)" }}
          />
        ))}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
      <div className="gallery-grid">
        {photos.map((photo) => (
          <GalleryItem
            key={photo.id}
            photo={photo}
            onPhotoClick={onPhotoClick}
          />
        ))}
      </div>

      {/* Dynamic Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            className={`pagination-btn ${currentPage === 1 ? "disabled" : ""}`}
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <div className="pagination-numbers">
            {pageNumbers.map((page, index) => (
              <span
                key={index}
                className={`pagination-ellipsis ${
                  typeof page === "number" && page === currentPage
                    ? "active"
                    : ""
                }`}
                onClick={() => typeof page === "number" && onPageChange(page)}
                style={{
                  cursor: typeof page === "number" ? "pointer" : "default",
                  background:
                    typeof page === "number" && page === currentPage
                      ? "rgba(255, 255, 255, 0.2)"
                      : "transparent",
                }}
              >
                {page}
              </span>
            ))}
          </div>

          <button
            className={`pagination-btn ${currentPage === totalPages ? "disabled" : ""}`}
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
