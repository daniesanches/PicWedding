"use client";

import { useState, useRef, memo } from "react";
import Image from "next/image";
import type { Photo } from "@/types";

interface ImageModalProps {
  photo: Photo;
  onClose: () => void;
  isLiked?: boolean;
  isAnimating?: boolean;
  onLike?: (photoId: string) => void;
}

function formatDate(fecha: unknown): string {
  if (!fecha) return "";
  const date =
    typeof fecha === "object" && fecha !== null && "toDate" in fecha
      ? (fecha as { toDate: () => Date }).toDate()
      : new Date(fecha as string | number);
  return new Intl.RelativeTimeFormat("es", { numeric: "auto" }).format(
    Math.floor((date.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
    "day",
  );
}

/**
 * Image modal with zoom, pan and feed de likes (like, fecha, doble tap)
 */
export const ImageModal = memo(({
  photo,
  onClose,
  isLiked = false,
  isAnimating = false,
  onLike,
}: ImageModalProps) => {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastDist, setLastDist] = useState(0);
  const imgRef = useRef<HTMLImageElement>(null);
  const startRef = useRef({ x: 0, y: 0 });
  const lastTapRef = useRef(0);

  const handleDoubleTapLike = () => {
    if (onLike && !isLiked) onLike(photo.id);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      setIsDragging(true);
      startRef.current = {
        x: e.touches[0].clientX - position.x,
        y: e.touches[0].clientY - position.y,
      };
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      setLastDist(dist);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && isDragging) {
      const newX = e.touches[0].clientX - startRef.current.x;
      const newY = e.touches[0].clientY - startRef.current.y;
      setPosition({ x: newX, y: newY });
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY,
      );
      if (lastDist > 0) {
        const delta = dist / lastDist;
        const newScale = Math.min(Math.max(1, scale * delta), 4);
        setScale(newScale);
      }
      setLastDist(dist);
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length === 0 && !isDragging && scale <= 1.1) {
      const now = Date.now();
      if (now - lastTapRef.current < 350) {
        handleDoubleTapLike();
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;
    }
    setIsDragging(false);
    setLastDist(0);
    if (scale <= 1) {
      setPosition({ x: 0, y: 0 });
      setScale(1);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    startRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleDoubleClick = () => {
    handleDoubleTapLike();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - startRef.current.x;
      const newY = e.clientY - startRef.current.y;
      setPosition({ x: newX, y: newY });
    }
  };

  const handleWheel = (e: React.WheelEvent) => {
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.min(Math.max(1, scale * delta), 4);
    setScale(newScale);
    if (newScale === 1) setPosition({ x: 0, y: 0 });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <button
        className="close-button"
        onClick={(e) => {
          e.stopPropagation();
          onClose();
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        onWheel={handleWheel}
      >
        <div className="modal-image-wrapper" style={{ position: "relative" }}>
          <Image
              ref={imgRef}
              src={photo.url}
              alt="Vista detallada"
              width={1000}
              height={1000}
              className="modal-image"
              style={{
                transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
              }}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={() => setIsDragging(false)}
              onMouseLeave={() => setIsDragging(false)}
              onDoubleClick={handleDoubleClick}
              draggable={false}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 80vw, 1000px"
              priority={true} // High priority for modal images
            />
          {isAnimating && (
            <div
              className="modal-heart-overlay"
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
                  animation: "heartBeat 0.6s ease-out",
                }}
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          )}
        </div>
        <div
          className="modal-feed"
          onClick={(e) => e.stopPropagation()}
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            padding: "1rem max(20px, env(safe-area-inset-right))  max(1rem, env(safe-area-inset-bottom)) max(20px, env(safe-area-inset-left))",
            background: "linear-gradient(transparent, rgba(0,0,0,0.85))",
            display: "flex",
            flexDirection: "column",
            gap: "0.5rem",
            zIndex: 1005,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem",
            }}
          >
            {onLike ? (
              <button
                type="button"
                className={`like-button ${isLiked ? "liked" : ""} ${isAnimating ? "animate-heart" : ""}`}
                onClick={() => onLike(photo.id)}
                style={{
                  fontSize: "1rem",
                  minHeight: "44px",
                  padding: "0.5rem 0",
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.75rem",
                  color: "var(--text)",
                }}
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
                  {photo.likes ?? 0} {photo.likes === 1 ? "Like" : "Likes"}
                </span>
              </button>
            ) : null}
            <span
              className="post-date"
              style={{
                fontSize: "0.75rem",
                color: "var(--text-light)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                fontWeight: 500,
              }}
            >
              {formatDate(photo.fecha)}
            </span>
          </div>
          {onLike ? (
            <p
              className="modal-feed-hint"
              style={{
                margin: 0,
                fontSize: "0.8rem",
                color: "var(--text-light)",
                opacity: 0.9,
              }}
            >
              Toca 2 veces en la foto para dar like
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}, (prev, next) => {
  return prev.photo.id === next.photo.id && 
         prev.isLiked === next.isLiked && 
         prev.isAnimating === next.isAnimating;
});

ImageModal.displayName = "ImageModal";
