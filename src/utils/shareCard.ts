import type { Product, Seller } from '../types/fashion';

/**
 * Renders a 1080x1920 story card for a piece (photo on top, title, price,
 * seller line, Habi wordmark) on a canvas, then shares or downloads it.
 */

const WIDTH = 1080;
const HEIGHT = 1920;
const IMAGE_HEIGHT = 1350;
const MARGIN = 72;
const TITLE_LINE_HEIGHT = 68;
const IMAGE_TIMEOUT_MS = 10000;

const SANS = '"Plus Jakarta Sans", system-ui, -apple-system, "Segoe UI", sans-serif';
const SERIF = '"Cooper BT", "Cooper Black", Fraunces, "Young Serif", Georgia, serif';

// Canvas pixels take literal colours; these mirror the zinc scale used in the UI.
const COLOR_BACKGROUND = '#09090b';
const COLOR_FALLBACK_BLOCK = '#27272a';
const COLOR_TEXT = '#fafafa';
const COLOR_MUTED = '#a1a1aa';

function loadImage(src: string | undefined): Promise<HTMLImageElement | null> {
  if (!src) return Promise.resolve(null);
  return new Promise((resolve) => {
    const image = new Image();
    let settled = false;
    const finish = (result: HTMLImageElement | null) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      resolve(result);
    };
    const timer = window.setTimeout(() => finish(null), IMAGE_TIMEOUT_MS);
    // Unsplash sends CORS headers and uploads are data URLs, so the canvas stays exportable.
    image.crossOrigin = 'anonymous';
    image.onload = () => finish(image);
    image.onerror = () => finish(null);
    image.src = src;
  });
}

function drawCover(
  ctx: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  const sourceWidth = image.naturalWidth || image.width;
  const sourceHeight = image.naturalHeight || image.height;
  if (!sourceWidth || !sourceHeight) return;
  const scale = Math.max(width / sourceWidth, height / sourceHeight);
  const cropWidth = width / scale;
  const cropHeight = height / scale;
  const cropX = (sourceWidth - cropWidth) / 2;
  const cropY = (sourceHeight - cropHeight) / 2;
  ctx.drawImage(image, cropX, cropY, cropWidth, cropHeight, x, y, width, height);
}

function ellipsize(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string {
  if (ctx.measureText(text).width <= maxWidth) return text;
  let end = text.length;
  while (end > 0 && ctx.measureText(`${text.slice(0, end).trimEnd()}...`).width > maxWidth) end -= 1;
  return `${text.slice(0, end).trimEnd()}...`;
}

/** Greedy word wrap capped at `maxLines`; overflow is folded into the last line and ellipsized. */
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number, maxLines: number): string[] {
  const words = text.trim().split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (!current || ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length === 0) return [''];
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = `${kept[maxLines - 1]} ${lines.slice(maxLines).join(' ')}`;
    return kept.map((line) => ellipsize(ctx, line, maxWidth));
  }
  return lines.map((line) => ellipsize(ctx, line, maxWidth));
}

function canvasToBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Could not export the share card.'));
    }, 'image/png');
  });
}

export async function renderShareCard(product: Product, seller: Seller | null): Promise<Blob> {
  const canvas = document.createElement('canvas');
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas is not available in this browser.');

  // Web fonts must be resolved before measureText or the wrap is computed with a fallback face.
  if (document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // Falls back to system fonts.
    }
  }

  ctx.fillStyle = COLOR_BACKGROUND;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  const image = await loadImage(product.images[0]);
  if (image) {
    drawCover(ctx, image, 0, 0, WIDTH, IMAGE_HEIGHT);
  } else {
    ctx.fillStyle = COLOR_FALLBACK_BLOCK;
    ctx.fillRect(0, 0, WIDTH, IMAGE_HEIGHT);
  }

  const textWidth = WIDTH - MARGIN * 2;
  let y = IMAGE_HEIGHT + 88;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  ctx.fillStyle = COLOR_TEXT;
  ctx.font = `bold 56px ${SANS}`;
  for (const line of wrapText(ctx, product.name, textWidth, 2)) {
    ctx.fillText(line, MARGIN, y);
    y += TITLE_LINE_HEIGHT;
  }

  y += 20;
  ctx.font = `bold 64px ${SANS}`;
  ctx.fillText(`₱${product.price.toLocaleString()}`, MARGIN, y);
  y += 88;

  const handle = seller?.handle ?? product.sellerHandle;
  const location = seller?.location.district || seller?.location.city || product.location;
  ctx.font = `36px ${SANS}`;
  ctx.fillStyle = COLOR_MUTED;
  ctx.fillText(ellipsize(ctx, `@${handle} • ${location}`, textWidth), MARGIN, y);

  ctx.textAlign = 'right';
  ctx.textBaseline = 'alphabetic';
  ctx.fillStyle = COLOR_TEXT;
  ctx.font = `bold 72px ${SERIF}`;
  ctx.fillText('Habi', WIDTH - MARGIN, HEIGHT - 128);
  ctx.font = `30px ${SANS}`;
  ctx.fillStyle = COLOR_MUTED;
  ctx.fillText('habi davao', WIDTH - MARGIN, HEIGHT - MARGIN);

  return canvasToBlob(canvas);
}

/**
 * Hands the card to the native share sheet when files are supported, otherwise
 * downloads it. Rejects with an AbortError when the person dismisses the sheet.
 */
export async function shareProductImage(product: Product, seller: Seller | null): Promise<'shared' | 'downloaded'> {
  const blob = await renderShareCard(product, seller);
  const fileName = `habi-${product.id}.png`;
  const file = new File([blob], fileName, { type: 'image/png' });

  if (typeof navigator.share === 'function' && navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: product.name, text: `Found on Habi: ${product.name}` });
    return 'shared';
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  return 'downloaded';
}
