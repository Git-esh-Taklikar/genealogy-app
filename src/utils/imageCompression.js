import imageCompression from 'browser-image-compression';

/**
 * Compress an avatar image to max 35KB WebP.
 * @param {File} file - The image file to compress.
 * @returns {Promise<File>} - Compressed image file.
 */
export async function compressAvatar(file) {
  const options = {
    maxSizeMB: 0.035,
    maxWidthOrHeight: 400,
    useWebWorker: true,
    fileType: 'image/webp',
  };
  const compressed = await imageCompression(file, options);
  return compressed;
}

/**
 * Compress a general upload image (more lenient size).
 * @param {File} file - The image file to compress.
 * @returns {Promise<File>} - Compressed image file.
 */
export async function compressImage(file) {
  const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  };
  const compressed = await imageCompression(file, options);
  return compressed;
}

/**
 * Read a file as a data URL for preview.
 * @param {File} file - The file to read.
 * @returns {Promise<string>} - Data URL string.
 */
export function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

