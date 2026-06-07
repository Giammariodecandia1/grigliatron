import { compressImage } from '../utils/imageCompressor';

/**
 * Servizio per caricare immagini su Cloudinary in modalità unsigned.
 * Completamente slegato da Firebase Storage per azzerare il setup tecnico.
 */

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(CLOUD_NAME && UPLOAD_PRESET);

/**
 * Carica un file immagine su Cloudinary.
 * Prima di inviarla, comprime aggressivamente l'immagine usando il compressor locale.
 * 
 * @param {File} file - Il file immagine da caricare
 * @param {Function} onProgress - Callback opzionale per aggiornare lo stato UI
 * @returns {Promise<{url: string, publicId: string, width: number, height: number, format: string, bytes: number} | null>}
 */
export async function uploadImageToCloudinary(file, onProgress = () => {}) {
  if (!file) return null;
  if (!isCloudinaryConfigured) {
    console.warn("Cloudinary non configurato. Salta upload.");
    return null;
  }

  try {
    onProgress('Preparazione...');
    
    // Comprimi immagine prima dell'upload (usa la nostra utility < 500KB)
    const result = await compressImage(file, onProgress);
    const uploadBlob = result.blob;

    onProgress('Upload su Cloudinary...');

    // Cloudinary Unsigned Upload API
    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;
    
    const formData = new FormData();
    formData.append('file', uploadBlob, file.name);
    formData.append('upload_preset', UPLOAD_PRESET);

    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Errore durante upload Cloudinary');
    }

    const data = await response.json();

    onProgress('');

    return {
      url: data.secure_url,
      publicId: data.public_id,
      width: data.width,
      height: data.height,
      format: data.format,
      bytes: data.bytes
    };
  } catch (error) {
    console.error("Cloudinary upload failed:", error);
    throw error;
  }
}
