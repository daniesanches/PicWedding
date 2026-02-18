"use client";

import { useState } from "react";
import { usePhotos } from "@/hooks/usePhotos";
import { usePhotoLikes } from "@/hooks/usePhotoLikes";
import { Header } from "@/components/Header";
import { GalleryGrid } from "@/components/GalleryGrid";
import { ImageModal } from "@/components/ImageModal";
import { EmptyState } from "@/components/EmptyState";
import type { Photo } from "@/types";

export default function Gallery() {
  const { photos, loading, currentPage, totalPages, goToPage } = usePhotos(6);
  const { likedPhotos, animatingLikes, handleLike } = usePhotoLikes();
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);

  const currentPhoto =
    selectedPhoto && photos.find((p) => p.id === selectedPhoto.id)
      ? photos.find((p) => p.id === selectedPhoto.id)!
      : selectedPhoto;

  return (
    <div className="container">
      <Header
        title="Recuerdos"
        subtitle="Danny & Luis"
        showBackButton
        showDashboardButton
      />

      <main
        style={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          marginTop: "1rem",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {photos.length > 0 || loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              minHeight: 0,
            }}
          >
            <GalleryGrid
              photos={photos}
              loading={loading}
              onPhotoClick={setSelectedPhoto}
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={goToPage}
            />
          </div>
        ) : (
          <EmptyState
            icon={
              <svg
                width="60"
                height="60"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <polyline points="21 15 16 10 5 21" />
              </svg>
            }
            message="Aún no hay fotos"
            actionLabel="Subir Foto"
            actionHref="/"
          />
        )}
      </main>

      {selectedPhoto && currentPhoto && (
        <ImageModal
          photo={currentPhoto}
          onClose={() => setSelectedPhoto(null)}
          isLiked={likedPhotos.has(currentPhoto.id)}
          isAnimating={animatingLikes.has(currentPhoto.id)}
          onLike={() => handleLike(currentPhoto.id)}
        />
      )}
    </div>
  );
}
