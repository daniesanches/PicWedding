"use client";

import { useState, useEffect, useCallback } from "react";
import { useTopPhotos } from "@/hooks/useTopPhotos";
import { usePhotoLikes } from "@/hooks/usePhotoLikes";
import { Header } from "@/components/Header";
import { ImageModal } from "@/components/ImageModal";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import type { Photo } from "@/types";

// Color palette matching the app's design
const CHART_COLORS = [
  "#d4a4b9",
  "#c07696",
  "#ac4873",
  "#5a0332",
  "#3b0221",
  "#1a010f",
  "#0d0007",
];

// Calculate donut chart segments
function calculateDonutSegments(photos: Photo[], maxLikes: number) {
  const totalLikes = photos.reduce((sum, p) => sum + p.likes, 0);
  if (totalLikes === 0) return [];

  let currentAngle = 0;
  return photos.map((photo, index) => {
    const percentage = photo.likes / totalLikes;
    const angle = percentage * 360;
    const startAngle = currentAngle;
    currentAngle += angle;

    return {
      ...photo,
      percentage,
      startAngle,
      endAngle: currentAngle,
      color: CHART_COLORS[index % CHART_COLORS.length],
      isTop3: index < 3,
    };
  });
}

// SVG Donut Chart Component
function DonutChart({
  segments,
  size = 180,
  strokeWidth = 35,
}: {
  segments: ReturnType<typeof calculateDonutSegments>;
  size?: number;
  strokeWidth?: number;
}) {
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;

  const createArcPath = (startAngle: number, endAngle: number) => {
    const start = polarToCartesian(center, center, radius, startAngle);
    const end = polarToCartesian(center, center, radius, endAngle);
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${end.x} ${end.y}`;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {segments.map((segment) => {
        if (segment.percentage === 0) return null;

        return (
          <g key={segment.id}>
            <path
              d={createArcPath(segment.startAngle, segment.endAngle)}
              fill="none"
              stroke={segment.color}
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              style={{
                transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
              }}
            />
          </g>
        );
      })}
      {/* Inner circle for donut effect */}
      <circle
        cx={center}
        cy={center}
        r={radius - strokeWidth / 2}
        fill="var(--glass)"
      />
    </svg>
  );
}

function polarToCartesian(
  centerX: number,
  centerY: number,
  radius: number,
  angleInDegrees: number,
) {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: centerX + radius * Math.cos(angleInRadians),
    y: centerY + radius * Math.sin(angleInRadians),
  };
}

export default function Dashboard() {
  const { photos, loading } = useTopPhotos(4);
  const { likedPhotos, animatingLikes, handleLike } = usePhotoLikes();
  const [maxLikes, setMaxLikes] = useState(1);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [localPhotos, setLocalPhotos] = useState<Photo[]>([]);

  useEffect(() => {
    setLocalPhotos(photos);
  }, [photos]);

  useEffect(() => {
    if (localPhotos.length > 0) {
      const max = Math.max(...localPhotos.map((p) => p.likes), 1);
      setMaxLikes(max);
    }
  }, [localPhotos]);

  const segments = calculateDonutSegments(localPhotos, maxLikes);
  const totalLikes = localPhotos.reduce((sum, p) => sum + p.likes, 0);

  const formatLikes = (count: number) => {
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "k";
    }
    return count.toString();
  };

  const currentPhoto =
    selectedPhoto && localPhotos.find((p) => p.id === selectedPhoto.id)
      ? localPhotos.find((p) => p.id === selectedPhoto.id)!
      : selectedPhoto;

  const onPhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
  };

  const onCloseModal = () => {
    setSelectedPhoto(null);
  };

  const onLikePhoto = useCallback(
    (photoId: string) => {
      handleLike(photoId);
    },
    [handleLike],
  );

  return (
    <div className="container">
      <Header title="Top Favoritas" subtitle="Danny & Luis" showBackButton />

      <main
        style={{
          flex: 1,
          width: "100%",
          minHeight: 0,
          marginTop: "1rem",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        {loading ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingSpinner />
          </div>
        ) : localPhotos.length === 0 ? (
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: "1rem",
            }}
          >
            <svg
              width="60"
              height="60"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              style={{ opacity: 0.6 }}
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <p style={{ color: "var(--text-light)", fontSize: "1.1rem)" }}>
              No hay fotos aún
            </p>
          </div>
        ) : (
          <div className="dashboard-container">
            {/* Donut Chart */}
            <div className="chart-section">
              <div className="chart-wrapper">
                <DonutChart segments={segments} size={180} strokeWidth={35} />
                <div className="chart-center">
                  <span className="chart-total">{formatLikes(totalLikes)}</span>
                  <span className="chart-label">Total</span>
                </div>
              </div>

              {/* Legend */}
              <div className="chart-legend">
                {segments.map((segment, index) => (
                  <div
                    key={segment.id}
                    className="legend-item"
                    style={{ borderLeftColor: segment.color }}
                  >
                    <span className="legend-rank">#{index + 1}</span>
                    <span className="legend-likes">
                      {formatLikes(segment.likes)}
                    </span>
                    <span className="legend-percent">
                      {Math.round(segment.percentage * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Image Previews Grid - Symmetrical 4 columns */}
            <div className="previews-section">
              <div className="previews-grid">
                {localPhotos.map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`preview-card ${index < 3 ? "top-3" : ""}`}
                    onClick={() => onPhotoClick(photo)}
                    style={{
                      borderTop: `3px solid ${CHART_COLORS[index % CHART_COLORS.length]}`,
                    }}
                  >
                    <div className="preview-rank">#{index + 1}</div>
                    <div className="preview-image-container">
                      <img
                        src={photo.url}
                        alt={`Foto ${index + 1}`}
                        className="preview-image"
                        loading="lazy"
                      />
                      {index < 3 && (
                        <div className="preview-badge">
                          <svg
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="preview-info">
                      <span className="preview-likes">{photo.likes}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {selectedPhoto && currentPhoto && (
        <ImageModal
          photo={currentPhoto}
          onClose={onCloseModal}
          isLiked={likedPhotos.has(currentPhoto.id)}
          isAnimating={animatingLikes.has(currentPhoto.id)}
          onLike={onLikePhoto}
        />
      )}

      <style jsx>{`
        .dashboard-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          overflow-y: auto;
          padding-bottom: 0.5rem;
        }

        .chart-section {
          background: var(--glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-lg);
          padding: 1rem;
          flex-shrink: 0;
        }

        .chart-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          margin: 0.5rem 0;
        }

        .chart-center {
          position: absolute;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .chart-total {
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--primary);
        }

        .chart-label {
          font-size: 0.7rem;
          color: var(--text-light);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .chart-legend {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.75rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.35rem 0.6rem;
          background: rgba(255, 255, 255, 0.05);
          border-radius: var(--radius-sm);
          border-left: 3px solid;
          font-size: 0.7rem;
        }

        .legend-rank {
          font-weight: 600;
          color: var(--text-light);
        }

        .legend-likes {
          font-weight: 700;
          color: var(--primary);
        }

        .legend-percent {
          color: var(--text-light);
          font-size: 0.65rem;
        }

        .previews-section {
          flex-shrink: 0;
        }

        .previews-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .preview-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          position: relative;
          padding-top: 5px;
          cursor: pointer;
        }

        .preview-rank {
          font-size: 0.65rem;
          font-weight: 600;
          color: var(--text-light);
        }

        .preview-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: var(--shadow-sm);
          transition: all 0.2s ease;
        }

        .preview-card:active .preview-image-container {
          transform: scale(0.95);
        }

        .preview-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .preview-badge {
          position: absolute;
          top: 3px;
          right: 3px;
          width: 18px;
          height: 18px;
          background: linear-gradient(135deg, #ffd700, #ffb700);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }

        .preview-badge svg {
          color: var(--secondary);
        }

        .preview-info {
          display: flex;
          align-items: center;
        }

        .preview-likes {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--text);
        }

        @media (max-width: 400px) {
          .previews-grid {
            gap: 6px;
          }

          .legend-item {
            padding: 0.3rem 0.5rem;
            font-size: 0.65rem;
          }
        }
      `}</style>
    </div>
  );
}
