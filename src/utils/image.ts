const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/**
 * Reads an image file, downscales it so the longest edge is at most `maxEdge`,
 * and returns a JPEG data URL. Keeps localStorage usage small for uploaded IDs
 * and product photos.
 */
export async function fileToDataUrl(
  file: File,
  maxEdge = 1200,
  quality = 0.82
): Promise<string> {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file (JPG, PNG, or WEBP).');
  }
  if (file.size > MAX_SOURCE_BYTES) {
    throw new Error('Image is larger than 10MB. Please choose a smaller file.');
  }

  const objectUrl = URL.createObjectURL(file);
  try {
    const image = await loadImage(objectUrl);
    const scale = Math.min(1, maxEdge / Math.max(image.width, image.height));
    const width = Math.max(1, Math.round(image.width * scale));
    const height = Math.max(1, Math.round(image.height * scale));

    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Your browser could not process this image.');
    }
    context.drawImage(image, 0, 0, width, height);
    return canvas.toDataURL('image/jpeg', quality);
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('The selected file could not be read as an image.'));
    image.src = src;
  });
}

/** Rough decoded size of a data URL in bytes, used to warn before storage fills up. */
export function dataUrlBytes(dataUrl: string): number {
  const commaIndex = dataUrl.indexOf(',');
  if (commaIndex === -1) return 0;
  return Math.floor(((dataUrl.length - commaIndex - 1) * 3) / 4);
}
