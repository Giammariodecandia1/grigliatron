/**
 * imageCompressor.js — Compressione client-side delle immagini scontrini.
 *
 * Riduce automaticamente le immagini sopra la soglia (default 5MB)
 * ridimensionando e riducendo la qualità JPEG progressivamente.
 * Zero dipendenze esterne — usa Canvas API del browser.
 *
 * Firebase Storage Rules limitano a 5MB per ricevute, ma le foto
 * da smartphone moderni possono arrivare a 8-15MB.
 */

const MAX_SIZE_BYTES = 4.5 * 1024 * 1024; // 4.5MB target (margine di sicurezza vs 5MB limit)
const MAX_DIMENSION = 1920; // Max larghezza o altezza in px
const QUALITY_STEPS = [0.85, 0.7, 0.55, 0.4, 0.3]; // Qualità JPEG progressive
const MIN_DIMENSION = 800; // Non scendere sotto questa risoluzione

/**
 * Comprimi un'immagine File sotto la soglia massima.
 *
 * @param {File} file - File immagine originale
 * @param {Function} [onProgress] - Callback (message: string) per aggiornare la UI
 * @returns {Promise<{blob: Blob, compressed: boolean, originalSize: number, finalSize: number}>}
 */
export async function compressImage(file, onProgress = () => {}) {
  const originalSize = file.size;

  // Se è già sotto la soglia e non è troppo grande, non comprimere
  if (originalSize <= MAX_SIZE_BYTES) {
    onProgress('Immagine già ottimizzata ✅');
    return {
      blob: file,
      compressed: false,
      originalSize,
      finalSize: originalSize,
    };
  }

  onProgress('Caricamento immagine...');

  // Carica immagine in un elemento Image
  const img = await loadImage(file);

  // Calcola dimensioni ridotte mantenendo aspect ratio
  let { width, height } = calculateDimensions(img.width, img.height, MAX_DIMENSION);

  // Prova con qualità progressive fino a stare sotto la soglia
  for (let qi = 0; qi < QUALITY_STEPS.length; qi++) {
    const quality = QUALITY_STEPS[qi];
    onProgress(`Compressione... (qualità ${Math.round(quality * 100)}%, ${width}×${height}px)`);

    const blob = await canvasToBlob(img, width, height, quality);

    if (blob.size <= MAX_SIZE_BYTES) {
      onProgress(`Compresso: ${formatBytes(originalSize)} → ${formatBytes(blob.size)} ✅`);
      return {
        blob,
        compressed: true,
        originalSize,
        finalSize: blob.size,
      };
    }

    // Se non basta, riduci anche le dimensioni per il prossimo tentativo
    if (qi < QUALITY_STEPS.length - 1) {
      const scaleFactor = 0.75;
      width = Math.max(MIN_DIMENSION, Math.round(width * scaleFactor));
      height = Math.max(MIN_DIMENSION, Math.round(height * scaleFactor));
    }
  }

  // Ultimo tentativo con dimensioni molto ridotte
  width = MIN_DIMENSION;
  height = Math.round(MIN_DIMENSION * (img.height / img.width));
  onProgress(`Compressione finale (${width}×${height}px)...`);

  const finalBlob = await canvasToBlob(img, width, height, 0.3);
  onProgress(`Compresso: ${formatBytes(originalSize)} → ${formatBytes(finalBlob.size)} ✅`);

  return {
    blob: finalBlob,
    compressed: true,
    originalSize,
    finalSize: finalBlob.size,
  };
}

/**
 * Carica un File in un elemento Image, gestendo orientamento EXIF.
 */
function loadImage(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(img.src);
      reject(new Error('Impossibile caricare l\'immagine'));
    };
    // createObjectURL è più efficiente di FileReader per immagini grandi
    img.src = URL.createObjectURL(file);
  });
}

/**
 * Calcola nuove dimensioni mantenendo l'aspect ratio.
 */
function calculateDimensions(origWidth, origHeight, maxDim) {
  if (origWidth <= maxDim && origHeight <= maxDim) {
    return { width: origWidth, height: origHeight };
  }

  const ratio = origWidth / origHeight;
  if (origWidth > origHeight) {
    return { width: maxDim, height: Math.round(maxDim / ratio) };
  } else {
    return { width: Math.round(maxDim * ratio), height: maxDim };
  }
}

/**
 * Disegna l'immagine su canvas e converte in Blob JPEG.
 */
function canvasToBlob(img, width, height, quality) {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    // Background bianco (per trasparenze PNG)
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Disegna l'immagine ridimensionata
    ctx.drawImage(img, 0, 0, width, height);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Errore nella conversione dell\'immagine'));
        }
      },
      'image/jpeg',
      quality
    );
  });
}

/**
 * Formatta bytes in formato leggibile.
 */
function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
