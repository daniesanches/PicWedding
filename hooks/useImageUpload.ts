"use client";

import { useState } from "react";
import imageCompression from "browser-image-compression";
import { uploadToImgBB } from "@/lib/imgbb";
import type { UploadStatus } from "@/types";

/**
 * Custom hook for handling image upload functionality
 * @returns Object containing upload state and handler functions
 */
export function useImageUpload() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<UploadStatus | null>(null);

  const [isFull, setIsFull] = useState(
    process.env.NEXT_PUBLIC_IS_FULL === "true",
  );

  /**
   * Handles file selection and generates preview
   * @param file Selected file
   */
  const handleFileChange = (file: File) => {
    if (isFull) return;
    setSelectedFile(file);
    setStatus(null);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  /**
   * Uploads the selected file to ImgBB with compression
   */
  const handleUpload = async () => {
    if (!selectedFile || isFull) return;

    setUploading(true);
    setStatus(null);

    try {
      // Compress the image
      const compressionOptions = {
        maxSizeMB: 2,
        maxWidthOrHeight: 1920,
        useWebWorker: true,
      };

      const compressedFile = await imageCompression(
        selectedFile,
        compressionOptions,
      );

      // Upload compressed file
      const result = await uploadToImgBB(compressedFile);

      if (result.success) {
        setStatus({
          type: "success",
          message: "✨ ¡Foto compartida!",
        });
        reset();
      } else {
        throw new Error("Error en la subida");
      }
    } catch (error: any) {
      console.error(error);
      const errorMessage = error?.message?.toLowerCase() || "";

      // Check for quota/limit errors
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("bandwidth") ||
        errorMessage.includes("limit") ||
        errorMessage.includes("storage")
      ) {
        setIsFull(true);
        setStatus(null); // Clear status to show full screen
        return;
      }

      setStatus({
        type: "error",
        message: "Error. Intenta de nuevo",
      });
    } finally {
      setUploading(false);
    }
  };

  /**
   * Resets the upload state
   */
  const reset = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
  };

  return {
    selectedFile,
    previewUrl,
    uploading,
    status,
    isFull,
    handleFileChange,
    handleUpload,
    reset,
  };
}
