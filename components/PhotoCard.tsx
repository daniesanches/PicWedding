import type { Photo } from "@/types";
import Image from "next/image";
import { memo } from "react";

interface PhotoCardProps {
  photo: Photo;
  isLiked: boolean;
  isAnimating: boolean;
  onLike: (photoId: string) => void;
  onDoubleClick?: (photoId: string) => void;
}

const formatDate = (fecha: any) => {
  if (!fecha) return "";
  const date = fecha.toDate ? fecha.toDate() : new Date(fecha);
  return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
    Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    "day",
  );
};

/**
 * Photo card component for feed with like functionality
 */
export const PhotoCard = memo(({
  photo,
  isLiked,
  isAnimating,
  onLike,
  onDoubleClick,
}: PhotoCardProps) => {
  return (
    <div className="post-card">
      <div
        className="post-image-container"
        onDoubleClick={() =>
          onDoubleClick && !isLiked && onDoubleClick(photo.id)
        }
      >
        <Image
          src={photo.url}
          alt="Post de boda"
          width={600}
          height={600}
          className="post-image"
          loading="lazy"
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 600px"
          priority={false}
        />
        {isAnimating && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              pointerEvents: "none",
            }}
          >
            <svg
              width="80"
              height="80"
              viewBox="0 0 24 24"
              fill="#ff3b30"
              stroke="white"
              strokeWidth="1"
              style={{
                filter: "drop-shadow(0 4px 8px rgba(0,0,0,0.3))",
                animation: "heartPop 0.6s ease-out",
              }}
            >
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
            </svg>
          </div>
        )}
      </div>
      <div className="post-actions" style={{ padding: "1rem" }}>
        <button
          className={`like-button ${isLiked ? "liked" : ""} ${isAnimating ? "animate-heart" : ""}`}
          onClick={() => onLike(photo.id)}
          style={{ fontSize: "1rem" }}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill={isLiked ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>
            {photo.likes || 0} {photo.likes === 1 ? "Like" : "Likes"}
          </span>
        </button>
        <span className="post-date" style={{ fontSize: "0.75rem" }}>
          {formatDate(photo.fecha)}
        </span>
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.photo.id === next.photo.id && 
         prev.isLiked === next.isLiked && 
         prev.isAnimating === next.isAnimating;
});

PhotoCard.displayName = "PhotoCard";
