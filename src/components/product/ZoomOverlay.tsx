import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface ZoomOverlayProps {
  images: string[];
  /** Photo shown first. */
  initialIndex?: number;
  alt: string;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

interface Transform {
  scale: number;
  x: number;
  y: number;
}

interface PinchState {
  startDistance: number;
  startScale: number;
  /** Image-space point under the pinch midpoint; it stays under the fingers while zooming. */
  anchor: Point;
}

interface DragState {
  start: Point;
  origin: Point;
  moved: boolean;
}

const MIN_SCALE = 1;
const MAX_SCALE = 4;
const DOUBLE_TAP_SCALE = 2;
const DOUBLE_TAP_MS = 300;
const TAP_SLOP_PX = 10;
const CLOSE_SWIPE_PX = 90;
const SWITCH_SWIPE_PX = 60;
const IDENTITY: Transform = { scale: 1, x: 0, y: 0 };

const controlClass =
  'w-10 h-10 rounded-full bg-white/95 text-zinc-950 border border-zinc-200/80 shadow-md flex items-center justify-center hover:scale-105 transition-all';

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function distance(a: Point, b: Point): number {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function midpoint(a: Point, b: Point): Point {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

/**
 * Fullscreen photo viewer with pinch zoom. Gestures are handled with Pointer
 * Events so one code path covers touch, mouse, and pen: up to two pointers are
 * tracked, the scale stays between 1 and 4, panning is allowed once zoomed,
 * a double tap toggles 1x and 2x, and a swipe down at 1x closes the viewer.
 */
export const ZoomOverlay: React.FC<ZoomOverlayProps> = ({ images, initialIndex = 0, alt, onClose }) => {
  const lastIndex = Math.max(0, images.length - 1);
  const hasMany = images.length > 1;
  const [index, setIndex] = useState(() => clamp(initialIndex, 0, lastIndex));
  const [isZoomed, setIsZoomed] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const transformRef = useRef<Transform>(IDENTITY);
  const pointersRef = useRef(new Map<number, Point>());
  const pinchRef = useRef<PinchState | null>(null);
  const dragRef = useRef<DragState | null>(null);
  const lastTapRef = useRef(0);

  const apply = useCallback((next: Transform, animate: boolean) => {
    transformRef.current = next;
    const image = imageRef.current;
    if (image) {
      image.style.transition = animate ? 'transform 220ms ease-out' : 'none';
      image.style.transform = `translate3d(${next.x}px, ${next.y}px, 0) scale(${next.scale})`;
    }
    setIsZoomed(next.scale > 1);
  }, []);

  const step = useCallback(
    (delta: number) => {
      if (!hasMany) return;
      setIndex((current) => clamp(current + delta, 0, lastIndex));
      apply(IDENTITY, false);
    },
    [apply, hasMany, lastIndex]
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') step(1);
      else if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose, step]);

  const stageCenter = (): Point => {
    const rect = stageRef.current?.getBoundingClientRect();
    return rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : { x: 0, y: 0 };
  };

  /** Stops the photo from being panned past its own edges once zoomed. */
  const withinBounds = (next: Transform): Transform => {
    const stage = stageRef.current;
    const image = imageRef.current;
    if (!stage || !image) return next;
    const naturalWidth = image.naturalWidth || image.clientWidth || 1;
    const naturalHeight = image.naturalHeight || image.clientHeight || 1;
    const fit = Math.min(image.clientWidth / naturalWidth, image.clientHeight / naturalHeight) || 1;
    const maxX = Math.max(0, (naturalWidth * fit * next.scale - stage.clientWidth) / 2);
    const maxY = Math.max(0, (naturalHeight * fit * next.scale - stage.clientHeight) / 2);
    return { scale: next.scale, x: clamp(next.x, -maxX, maxX), y: clamp(next.y, -maxY, maxY) };
  };

  /** Zooms so the photo point under `point` stays under it. */
  const zoomTo = (point: Point, scale: number): Transform => {
    const current = transformRef.current;
    const center = stageCenter();
    const anchorX = (point.x - center.x - current.x) / current.scale;
    const anchorY = (point.y - center.y - current.y) / current.scale;
    return withinBounds({ scale, x: point.x - center.x - scale * anchorX, y: point.y - center.y - scale * anchorY });
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (imageRef.current) imageRef.current.style.transition = 'none';

    const points = [...pointersRef.current.values()];
    const current = transformRef.current;
    if (points.length === 2) {
      const center = stageCenter();
      const mid = midpoint(points[0], points[1]);
      pinchRef.current = {
        startDistance: Math.max(1, distance(points[0], points[1])),
        startScale: current.scale,
        anchor: { x: (mid.x - center.x - current.x) / current.scale, y: (mid.y - center.y - current.y) / current.scale },
      };
      dragRef.current = null;
    } else if (points.length === 1) {
      dragRef.current = { start: { x: event.clientX, y: event.clientY }, origin: { x: current.x, y: current.y }, moved: false };
    }
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    const points = [...pointersRef.current.values()];

    const pinch = pinchRef.current;
    if (pinch && points.length >= 2) {
      const scale = clamp(pinch.startScale * (distance(points[0], points[1]) / pinch.startDistance), MIN_SCALE, MAX_SCALE);
      const mid = midpoint(points[0], points[1]);
      const center = stageCenter();
      apply(withinBounds({ scale, x: mid.x - center.x - scale * pinch.anchor.x, y: mid.y - center.y - scale * pinch.anchor.y }), false);
      return;
    }

    const drag = dragRef.current;
    if (!drag || points.length !== 1) return;
    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;
    if (!drag.moved && Math.hypot(dx, dy) > TAP_SLOP_PX) drag.moved = true;
    if (!drag.moved) return;

    const current = transformRef.current;
    if (current.scale > 1) {
      apply(withinBounds({ scale: current.scale, x: drag.origin.x + dx, y: drag.origin.y + dy }), false);
    } else {
      // At 1x the photo follows the finger so a swipe down (close) or across (next photo) reads as a gesture.
      apply({ scale: 1, x: dx, y: dy }, false);
    }
  };

  const finishPointer = (event: React.PointerEvent<HTMLDivElement>, cancelled: boolean) => {
    if (!pointersRef.current.has(event.pointerId)) return;
    pointersRef.current.delete(event.pointerId);
    const remaining = [...pointersRef.current.values()];
    const current = transformRef.current;

    if (pinchRef.current) {
      if (remaining.length >= 2) return;
      pinchRef.current = null;
      const settled = current.scale <= 1 ? IDENTITY : withinBounds(current);
      apply(settled, true);
      // A finger still down keeps panning from where the pinch left off, and never counts as a tap.
      dragRef.current = remaining.length === 1 ? { start: remaining[0], origin: { x: settled.x, y: settled.y }, moved: true } : null;
      return;
    }

    const drag = dragRef.current;
    dragRef.current = null;
    if (!drag) return;
    if (cancelled) {
      apply(current.scale > 1 ? withinBounds(current) : IDENTITY, true);
      return;
    }

    if (!drag.moved) {
      const now = performance.now();
      if (now - lastTapRef.current < DOUBLE_TAP_MS) {
        lastTapRef.current = 0;
        apply(current.scale > 1 ? IDENTITY : zoomTo({ x: event.clientX, y: event.clientY }, DOUBLE_TAP_SCALE), true);
      } else {
        lastTapRef.current = now;
      }
      return;
    }

    if (current.scale > 1) return;
    const dx = event.clientX - drag.start.x;
    const dy = event.clientY - drag.start.y;
    if (dy > CLOSE_SWIPE_PX && dy > Math.abs(dx)) {
      onClose();
      return;
    }
    if (hasMany && Math.abs(dx) > SWITCH_SWIPE_PX && Math.abs(dx) > Math.abs(dy)) {
      step(dx < 0 ? 1 : -1);
      return;
    }
    apply(IDENTITY, true);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${alt} photo viewer`}
      className="fixed inset-0 z-[70] bg-black font-sans select-none"
    >
      <div
        ref={stageRef}
        className="absolute inset-0 flex items-center justify-center overflow-hidden"
        style={{ touchAction: 'none', cursor: isZoomed ? 'grab' : 'zoom-in' }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={(event) => finishPointer(event, false)}
        onPointerCancel={(event) => finishPointer(event, true)}
      >
        <img
          ref={imageRef}
          src={images[index]}
          alt={`${alt}, photo ${index + 1} of ${images.length}`}
          draggable={false}
          className="max-w-full max-h-full object-contain will-change-transform"
          style={{ transformOrigin: 'center' }}
        />
      </div>

      <button type="button" onClick={onClose} aria-label="Close photo viewer" className={`absolute top-4 right-4 z-10 ${controlClass}`}>
        <X className="w-5 h-5" />
      </button>

      {hasMany && (
        <>
          <div className="absolute top-4 left-4 z-10 bg-white/95 text-zinc-950 border border-zinc-200/80 shadow-md text-[11px] font-semibold px-3 py-2 rounded-full">
            {index + 1} / {images.length}
          </div>
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={index === 0}
            aria-label="Previous photo"
            className={`absolute left-3 top-1/2 -translate-y-1/2 z-10 disabled:opacity-30 disabled:hover:scale-100 ${controlClass}`}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={index === lastIndex}
            aria-label="Next photo"
            className={`absolute right-3 top-1/2 -translate-y-1/2 z-10 disabled:opacity-30 disabled:hover:scale-100 ${controlClass}`}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}

      <p className="absolute bottom-0 inset-x-0 text-center text-[11px] font-medium text-zinc-400 px-4 py-3 sheet-safe pointer-events-none">
        {isZoomed ? 'Drag to pan. Double tap to reset.' : 'Pinch to zoom. Double tap for 2x. Swipe down to close.'}
      </p>
    </div>
  );
};
