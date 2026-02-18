/**
 * Centralized TypeScript type definitions for PicWedding app
 */

import type { QueryDocumentSnapshot, DocumentData } from "firebase/firestore";

/**
 * Photo interface representing a photo document from Firestore
 */
export interface Photo {
  id: string;
  url: string;
  fecha: any;
  likes: number;
}

/**
 * Upload status for image upload operations
 */
export interface UploadStatus {
  type: "success" | "error";
  message: string;
}

/**
 * Re-export Firebase types for convenience
 */
export type { QueryDocumentSnapshot, DocumentData };
