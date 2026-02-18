"use client";

import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/Header";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { subscribeToPhotos, uploadToImgBB, deletePhoto } from "@/lib/imgbb";
import type { Photo } from "@/types";

export default function AdminPanel() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    photoId: string | null;
  }>({ isOpen: false, photoId: null });

  // Subscribe to real-time photos updates
  useEffect(() => {
    setLoading(true);
    const unsubscribe = subscribeToPhotos((newPhotos) => {
      setPhotos(newPhotos);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadStatus(null);

      // Auto-upload the file immediately
      setUploading(true);
      try {
        await uploadToImgBB(file);
        setUploadStatus({
          type: "success",
          message: "Foto subida correctamente",
        });
      } catch (error) {
        setUploadStatus({
          type: "error",
          message:
            error instanceof Error ? error.message : "Error al subir la foto",
        });
      } finally {
        setUploading(false);
        setSelectedFile(null);
        // Reset file input
        const fileInput = document.getElementById(
          "file-upload",
        ) as HTMLInputElement;
        if (fileInput) fileInput.value = "";
      }
    }
  };

  const handleDelete = useCallback((photoId: string) => {
    setDeleteModal({ isOpen: true, photoId });
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteModal.photoId) return;

    setDeleting(deleteModal.photoId);
    try {
      await deletePhoto(deleteModal.photoId);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Error al eliminar la foto",
      );
    } finally {
      setDeleting(null);
      setDeleteModal({ isOpen: false, photoId: null });
    }
  }, [deleteModal.photoId]);

  const cancelDelete = useCallback(() => {
    setDeleteModal({ isOpen: false, photoId: null });
  }, []);

  return (
    <div className="container">
      <Header title="Panel de Control" subtitle="Danny & Luis" showBackButton />

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
        {/* Upload Section */}
        <div className="upload-section">
          <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>
            Subir nueva foto
          </h3>
          <div className="upload-controls">
            <div style={{ position: "relative", width: "100%" }}>
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{
                  position: "absolute",
                  opacity: 0,
                  width: "100%",
                  height: "100%",
                  cursor: "pointer",
                }}
              />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                  padding: "0.6rem 1rem",
                  background: "rgba(255, 255, 255, 0.05)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "var(--radius-sm)",
                  color: selectedFile ? "var(--text)" : "var(--text-light)",
                  fontSize: "0.85rem",
                  cursor: "pointer",
                }}
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="sm" text="Subiendo..." />
                  </>
                ) : (
                  <>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <polyline points="21 15 16 10 5 21" />
                    </svg>
                    <span>
                      {selectedFile ? selectedFile.name : "Seleccionar foto..."}
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
          {uploadStatus && (
            <div
              className={`upload-status ${uploadStatus.type}`}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem",
                borderRadius: "8px",
                fontSize: "0.85rem",
                background:
                  uploadStatus.type === "success"
                    ? "rgba(76, 175, 80, 0.2)"
                    : "rgba(244, 67, 54, 0.2)",
                color:
                  uploadStatus.type === "success"
                    ? "var(--success)"
                    : "var(--error)",
              }}
            >
              {uploadStatus.message}
            </div>
          )}
        </div>

        {/* Photos Grid */}
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
        ) : photos.length === 0 ? (
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
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <p style={{ color: "var(--text-light)", fontSize: "1.1rem)" }}>
              No hay fotos aún
            </p>
          </div>
        ) : (
          <div className="admin-photos-grid">
            {photos.map((photo) => (
              <div key={photo.id} className="admin-photo-card">
                <div className="admin-photo-image-container">
                  <img
                    src={photo.url}
                    alt="Foto"
                    className="admin-photo-image"
                    loading="lazy"
                  />
                  <button
                    className="delete-button"
                    onClick={() => handleDelete(photo.id)}
                    disabled={deleting === photo.id}
                  >
                    {deleting === photo.id ? (
                      <LoadingSpinner size="sm" />
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    )}
                  </button>
                </div>
                <div className="admin-photo-info">
                  <span className="admin-photo-likes">{photo.likes} likes</span>
                </div>
              </div>
            ))}
          </div>
        )}
        {deleteModal.isOpen && (
          <div className="delete-modal-overlay">
            <div className="delete-modal">
              <div className="delete-modal-icon">
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
              <div className="delete-modal-content">
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1.25rem" }}>
                  ¿Eliminar foto?
                </h3>
                <p style={{ margin: "0 0 1rem 0", color: "var(--text-light)" }}>
                  Esta acción no se puede deshacer. La foto se eliminará
                  permanentemente de la galería.
                </p>
                <div className="delete-modal-actions">
                  <button
                    className="btn-secondary"
                    onClick={cancelDelete}
                    disabled={deleting !== null}
                  >
                    Cancelar
                  </button>
                  <button
                    className="btn-danger"
                    onClick={confirmDelete}
                    disabled={deleting !== null}
                  >
                    {deleting ? (
                      <>
                        <LoadingSpinner size="sm" text="Eliminando..." />
                      </>
                    ) : (
                      "Eliminar"
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <style jsx>{`
        .delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 2000;
          padding: var(--spacing-md);
          backdrop-filter: blur(5px);
        }

        .delete-modal {
          background: var(--glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-lg);
          padding: var(--spacing-lg);
          max-width: 400px;
          width: 100%;
          text-align: center;
          box-shadow: var(--shadow-lg);
          animation: slideUp 0.3s ease-out;
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .delete-modal-icon {
          width: 80px;
          height: 80px;
          margin: 0 auto 1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(244, 67, 54, 0.2);
          border: 2px solid rgba(244, 67, 54, 0.3);
          border-radius: 50%;
          color: #f44336;
        }

        .delete-modal-content {
          margin-bottom: 1rem;
        }

        .delete-modal-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
        }

        .btn-danger {
          background: linear-gradient(135deg, #f44336, #d32f2f);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 0.4rem;
        }

        .btn-danger:hover:not(:disabled) {
          background: linear-gradient(135deg, #d32f2f, #b71c1c);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(244, 67, 54, 0.3);
        }

        .btn-danger:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          background: transparent;
          color: var(--text);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.75rem 1.5rem;
          border-radius: var(--radius-sm);
          font-size: 0.9rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .btn-secondary:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .upload-section {
          background: var(--glass);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: var(--radius-lg);
          padding: 1rem;
          margin-bottom: 1rem;
          flex-shrink: 0;
        }

        .upload-controls {
          display: flex;
          gap: 0.75rem;
          align-items: center;
        }

        .upload-controls input[type="file"] {
          flex: 1;
          padding: 0.5rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          color: var(--text);
          font-size: 0.85rem;
        }

        .upload-button {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          padding: 0.6rem 1rem;
          background: var(--primary);
          color: var(--secondary);
          border: none;
          border-radius: var(--radius-sm);
          font-size: 0.85rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .upload-button:hover:not(:disabled) {
          background: var(--primary-dark, #5a0332);
        }

        .upload-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .admin-photos-grid {
          flex: 1;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
          overflow-y: auto;
          padding-bottom: 0.5rem;
        }

        .admin-photo-card {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .admin-photo-image-container {
          position: relative;
          width: 100%;
          aspect-ratio: 1;
          border-radius: var(--radius-md);
          overflow: hidden;
        }

        .admin-photo-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .delete-button {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 32px;
          height: 32px;
          background: rgba(244, 67, 54, 0.9);
          border: none;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
        }

        .delete-button:hover:not(:disabled) {
          background: #d32f2f;
          transform: scale(1.1);
        }

        .delete-button:disabled {
          background: rgba(158, 158, 158, 0.9);
          cursor: not-allowed;
        }

        .delete-button svg {
          color: white;
        }

        .admin-photo-info {
          display: flex;
          justify-content: center;
        }

        .admin-photo-likes {
          font-size: 0.7rem;
          color: var(--text-light);
        }

        @media (max-width: 400px) {
          .admin-photos-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
}
