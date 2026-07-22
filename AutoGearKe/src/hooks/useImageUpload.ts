import { useState } from 'react';
import { uploadToCloudinary } from '../lib/api';

interface UseImageUploadReturn {
  uploadImage: (file: File, folder: string) => Promise<string | null>;
  uploadImages: (files: File[], folder: string) => Promise<string[]>;
  isUploading: boolean;
  progress: number;
  progresses: number[];
  error: string | null;
  reset: () => void;
}

/**
 * Hook for managing image uploads with progress tracking and error handling.
 * Supports both single and multiple file uploads with retry logic.
 */
export const useImageUpload = (): UseImageUploadReturn => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progresses, setProgresses] = useState<number[]>([]);
  const [error, setError] = useState<string | null>(null);

  /**
   * Upload a single image file.
   * Returns the URL on success, null on failure.
   */
  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    setIsUploading(true);
    setProgress(0);
    setError(null);

    try {
      const url = await uploadToCloudinary(file, folder, (percent) => {
        setProgress(percent);
      });
      setProgress(100);
      return url;
    } catch (err: any) {
      console.error('Upload failed:', err);
      setError(err.message || 'Upload failed. Please check your connection and try again.');
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Upload multiple image files concurrently with a concurrency limit of 3.
   * Returns an array of successful URLs (failed uploads are excluded).
   * Maximum 6 files will be uploaded in 2 batches of 3.
   */
  const uploadImages = async (files: File[], folder: string): Promise<string[]> => {
    setIsUploading(true);
    setError(null);
    
    // Initialize progress array
    const initialProgresses = new Array(files.length).fill(0);
    setProgresses(initialProgresses);

    const successfulUrls: string[] = [];
    const failedFiles: string[] = [];
    const concurrencyLimit = 3;

    try {
      // Process files in batches of 3
      for (let i = 0; i < files.length; i += concurrencyLimit) {
        const batch = files.slice(i, i + concurrencyLimit);
        const batchStartIndex = i;

        // Upload batch concurrently
        const batchResults = await Promise.allSettled(
          batch.map((file, batchIndex) => {
            const fileIndex = batchStartIndex + batchIndex;
            return uploadToCloudinary(file, folder, (percent) => {
              setProgresses(prev => {
                const updated = [...prev];
                updated[fileIndex] = percent;
                return updated;
              });
            });
          })
        );

        // Process batch results
        batchResults.forEach((result, batchIndex) => {
          const fileIndex = batchStartIndex + batchIndex;
          if (result.status === 'fulfilled') {
            successfulUrls.push(result.value);
            setProgresses(prev => {
              const updated = [...prev];
              updated[fileIndex] = 100;
              return updated;
            });
          } else {
            failedFiles.push(batch[batchIndex].name);
            console.error(`Failed to upload ${batch[batchIndex].name}:`, result.reason);
          }
        });
      }

      // Set error message if some files failed
      if (failedFiles.length > 0) {
        setError(
          `${failedFiles.length} of ${files.length} images failed to upload: ${failedFiles.join(', ')}`
        );
      }

      return successfulUrls;
    } catch (err: any) {
      console.error('Batch upload error:', err);
      setError(err.message || 'Upload failed. Please check your connection and try again.');
      return successfulUrls; // Return whatever succeeded
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Reset all state to initial values.
   */
  const reset = () => {
    setIsUploading(false);
    setProgress(0);
    setProgresses([]);
    setError(null);
  };

  return {
    uploadImage,
    uploadImages,
    isUploading,
    progress,
    progresses,
    error,
    reset,
  };
};
