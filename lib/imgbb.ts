export const IMGBB_API_KEY = "79c712ffb0f86eb56820b2cab98a33b3";
export const IMGBB_UPLOAD_URL = "https://api.imgbb.com/1/upload";

import { db } from "./firebase";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
  limit,
  getDocs,
  startAfter,
  updateDoc,
  doc,
  increment,
  getCountFromServer,
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  deleteDoc,
} from "firebase/firestore";
import type { Photo } from "@/types";

/**
 * Response type from ImgBB API
 */
interface ImgBBResponse {
  success: boolean;
  data: {
    url: string;
    [key: string]: any;
  };
}

/**
 * Uploads an image to ImgBB and saves it to Firestore.
 * @param file The image file to upload
 * @returns The response data from ImgBB API
 * @throws Error if upload fails or response is invalid
 */
export async function uploadToImgBB(file: File): Promise<ImgBBResponse> {
  const formData = new FormData();
  formData.append("image", file);

  const response = await fetch(`${IMGBB_UPLOAD_URL}?key=${IMGBB_API_KEY}`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData?.error?.message || "Error uploading image");
  }

  const data: ImgBBResponse = await response.json();

  // Save to Firestore
  try {
    await addDoc(collection(db, "fotos"), {
      url: data.data.url,
      fecha: serverTimestamp(),
      likes: 0,
    });
  } catch (error) {
    console.error("Error saving image to Firestore:", error);
    throw new Error("Failed to save image to database");
  }

  return data;
}

/**
 * Result type for getPhotos function
 */
interface GetPhotosResult {
  photos: Photo[];
  lastVisible: QueryDocumentSnapshot<DocumentData> | null;
  totalCount?: number;
}

/**
 * Fetches photos from the "fotos" collection with pagination support.
 * @param lastDoc The last document snapshot from the previous page (null for first page) - used for cursor pagination
 * @param pageSize The number of photos to fetch per page (default: 6)
 * @param getCount Whether to return total count (default: false)
 * @param pageNumber The page number for offset-based pagination (1-indexed)
 * @returns Object containing photos array, last visible document for pagination, and optional total count
 * @throws Error if fetch fails
 */
export async function getPhotos(
  lastDoc: QueryDocumentSnapshot<DocumentData> | null = null,
  pageSize: number = 100,
  getCount: boolean = false,
  pageNumber: number = 1,
): Promise<GetPhotosResult> {
  try {
    // Get total count if requested
    let totalCount = 0;
    if (getCount) {
      const countSnapshot = await getCountFromServer(collection(db, "fotos"));
      totalCount = countSnapshot.data().count;
    }

    let q;
    if (lastDoc) {
      q = query(
        collection(db, "fotos"),
        orderBy("fecha", "desc"),
        startAfter(lastDoc),
        limit(pageSize),
      );
    } else {
      q = query(
        collection(db, "fotos"),
        orderBy("fecha", "desc"),
        limit(pageSize),
      );
    }

    const querySnapshot = await getDocs(q);
    const photos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      url: doc.data().url,
      fecha: doc.data().fecha,
      likes: doc.data().likes || 0,
    })) as Photo[];

    const lastVisible =
      querySnapshot.docs[querySnapshot.docs.length - 1] || null;

    return { photos, lastVisible, totalCount };
  } catch (error) {
    console.error("Error fetching photos:", error);
    throw new Error("Failed to fetch photos from database");
  }
}

/**
 * Subscribes to real-time updates for photos collection
 * @param callback Function to call when photos change
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToPhotos(
  callback: (photos: Photo[]) => void,
): () => void {
  const q = query(
    collection(db, "fotos"),
    orderBy("fecha", "desc"),
    limit(100),
  );

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const photos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      url: doc.data().url,
      fecha: doc.data().fecha,
      likes: doc.data().likes || 0,
    })) as Photo[];

    callback(photos);
  });

  return unsubscribe;
}

/**
 * Toggles a like for a photo (increment or decrement).
 * @param photoId The ID of the photo document in Firestore
 * @param isIncrement Whether to add (true) or remove (false) a like
 * @throws Error if update fails
 */
export async function toggleLike(
  photoId: string,
  isIncrement: boolean,
): Promise<void> {
  try {
    const photoRef = doc(db, "fotos", photoId);
    await updateDoc(photoRef, {
      likes: increment(isIncrement ? 1 : -1),
    });
  } catch (error) {
    console.error("Error toggling like:", error);
    throw new Error("Failed to update like count");
  }
}

/**
 * Fetches top photos by likes count.
 * @param count Number of top photos to fetch (default: 10)
 * @returns Array of top photos sorted by likes descending
 */
export async function getTopPhotos(count: number = 10): Promise<Photo[]> {
  try {
    const q = query(
      collection(db, "fotos"),
      orderBy("likes", "desc"),
      limit(count),
    );

    const querySnapshot = await getDocs(q);
    const photos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      url: doc.data().url,
      fecha: doc.data().fecha,
      likes: doc.data().likes || 0,
    })) as Photo[];

    return photos;
  } catch (error) {
    console.error("Error fetching top photos:", error);
    throw new Error("Failed to fetch top photos from database");
  }
}

/**
 * Subscribes to real-time updates for top photos by likes.
 * @param callback Function to call when top photos change
 * @param count Number of top photos to track (default: 10)
 * @returns Unsubscribe function to stop listening
 */
export function subscribeToTopPhotos(
  callback: (photos: Photo[]) => void,
  count: number = 10,
): () => void {
  const q = query(collection(db, "fotos"), orderBy("likes", "desc"), limit(50));

  const unsubscribe = onSnapshot(q, (querySnapshot) => {
    const photos = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      url: doc.data().url,
      fecha: doc.data().fecha,
      likes: doc.data().likes || 0,
    })) as Photo[];

    // Take top N photos
    const topPhotos = photos.slice(0, count);

    callback(topPhotos);
  });

  return unsubscribe;
}

/**
 * Deletes a photo from Firestore.
 * Note: ImgBB doesn't provide a delete API for free accounts, so only Firestore document is deleted.
 * @param photoId The ID of the photo document in Firestore
 * @throws Error if deletion fails
 */
export async function deletePhoto(photoId: string): Promise<void> {
  try {
    const photoRef = doc(db, "fotos", photoId);
    await deleteDoc(photoRef);
  } catch (error) {
    console.error("Error deleting photo:", error);
    throw new Error("Failed to delete photo from database");
  }
}
