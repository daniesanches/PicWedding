"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Header } from "@/components/Header";

export default function Home() {
  const router = useRouter();
  const {
    selectedFile,
    previewUrl,
    uploading,
    status,
    isFull,
    handleFileChange,
    handleUpload,
    reset,
  } = useImageUpload();

  useEffect(() => {
    // Prefetch the most likely next pages
    router.prefetch("/gallery");
    router.prefetch("/dashboard");
  }, [router]);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileChange(file);
    }
  };

  if (isFull) {
    return (
      <div className="container">
        <Header
          title="Dani & Luis"
          subtitle="Captura los momentos mágicos"
          rightAction={
            <Link
              href="/dashboard"
              className="dashboard-link"
              title="Top Favoritas"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </Link>
          }
        />

        <main
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            width: "100%",
            minHeight: 0,
            marginTop: "1rem",
            justifyContent: "center",
            alignItems: "center",
            padding: "2rem",
            textAlign: "center",
          }}
        >
          <div
            className="card"
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "2rem",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "1.5rem",
            }}
          >
            <div
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "50%",
                background: "rgba(255, 255, 255, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="40"
                height="40"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                style={{ opacity: 0.8 }}
              >
                <ellipse cx="12" cy="5" rx="9" ry="3" />
                <path d="M3 5V19A9 3 0 0 0 21 19V5" />
                <path d="M3 12A9 3 0 0 0 21 12" />
              </svg>
            </div>

            <div>
              <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>
                Estamos llenos
              </h2>
              <p style={{ color: "var(--text-light)", lineHeight: "1.6" }}>
                ¡Gracias por compartir tantos momentos! Hemos alcanzado el
                límite de fotos por hoy.
              </p>
            </div>

            <Link
              href="/gallery"
              className="btn"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                padding: "1rem",
              }}
            >
              Ver la Galería
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="container">
      <Header
        title="Dani & Luis"
        subtitle="Captura los momentos mágicos"
        rightAction={
          <Link
            href="/dashboard"
            className="dashboard-link"
            title="Top Favoritas"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </Link>
        }
      />

      <main
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          width: "100%",
          minHeight: 0,
          marginTop: "1rem",
        }}
      >
        <div
          className="card"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            marginTop: 0,
            padding: "1.25rem",
          }}
        >
          <h2
            style={{ marginBottom: "1rem", fontSize: "1.25rem", flexShrink: 0 }}
          >
            {selectedFile ? "Vista Previa" : "Comparte tu Foto"}
          </h2>

          <div
            className="preview-container"
            onClick={!selectedFile ? triggerCameraInput : undefined}
            style={{
              cursor: selectedFile ? "default" : "pointer",
              flex: 1,
              marginTop: 0,
              minHeight: 0,
            }}
          >
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  gap: "0.75rem",
                  padding: "1rem",
                }}
              >
                <svg
                  width="60"
                  height="60"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="animate-bounce"
                  style={{ color: "var(--primary)", opacity: 0.8 }}
                >
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <p
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: "500",
                    color: "var(--text-light)",
                  }}
                >
                  Tomar una foto
                </p>
              </div>
            )}
          </div>

          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            className="file-input"
          />

          <input
            type="file"
            ref={cameraInputRef}
            onChange={onFileInputChange}
            accept="image/*"
            capture="environment"
            className="file-input"
          />

          <div style={{ flexShrink: 0 }}>
            {!selectedFile ? (
              <button
                className="btn"
                onClick={triggerFileInput}
                style={{
                  marginTop: "1rem",
                  padding: "1rem 2rem",
                  fontSize: "1rem",
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
                <span>Cargar foto</span>
              </button>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                  marginTop: "1rem",
                }}
              >
                <button
                  className="btn"
                  onClick={handleUpload}
                  disabled={uploading}
                  style={{ padding: "1rem 2rem", fontSize: "1rem" }}
                >
                  {uploading ? (
                    <>
                      <div className="spinner" />
                      <span>Subiendo...</span>
                    </>
                  ) : (
                    <>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                      <span>Compartir</span>
                    </>
                  )}
                </button>
                <button
                  className="btn-secondary"
                  onClick={reset}
                  disabled={uploading}
                  style={{ padding: "0.75rem 1.5rem", fontSize: "0.95rem" }}
                >
                  Cancelar
                </button>
              </div>
            )}

            {status && (
              <div
                className={`status status-${status.type}`}
                style={{
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  fontSize: "0.9rem",
                }}
              >
                {status.message}
              </div>
            )}
          </div>
        </div>
      </main>

      <div
        className="nav-cards"
        style={{ flexShrink: 0, marginTop: "1rem", gap: "0.5rem" }}
      >
        <Link
          href="/gallery"
          className="nav-card"
          style={{ padding: "0.75rem 1rem", minHeight: "auto" }}
        >
          <div>
            <div className="nav-card-title" style={{ fontSize: "1rem" }}>
              Galería Completa
            </div>
            <div
              style={{
                fontSize: "0.8rem",
                color: "var(--text-light)",
                marginTop: "0.125rem",
              }}
            >
              Ver todas las fotos
            </div>
          </div>
          <svg
            className="nav-card-icon"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        </Link>
      </div>

      <footer
        style={{
          flexShrink: 0,
          paddingTop: "0.75rem",
          opacity: 0.5,
          fontSize: "0.75rem",
        }}
      >
        <p>Hecho con amor ❤️</p>
      </footer>
    </div>
  );
}
