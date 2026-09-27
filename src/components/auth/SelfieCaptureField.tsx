import React, { useEffect, useRef, useState } from 'react';
import { Camera, RefreshCw, ScanFace, Trash2, Upload, X } from 'lucide-react';
import type { SelfieCapture } from '../../types/auth';
import { fileToDataUrl } from '../../utils/image';
import { Button, labelClass } from '../common/FormControls';

/**
 * Gestures made with the free hand while holding the ID. A random one per attempt
 * means an old photo or someone else's picture will not show the right gesture.
 */
const SELFIE_CHALLENGES = [
  'give a thumbs up',
  'make a peace sign',
  'hold up three fingers',
  'touch your chin',
  'show an open palm',
  'point at the ID',
];

const MAX_EDGE = 1000;
const QUALITY = 0.82;

function pickChallenge(exclude?: string): string {
  const options = SELFIE_CHALLENGES.filter((challenge) => challenge !== exclude);
  return options[Math.floor(Math.random() * options.length)];
}

function instructionFor(challenge: string): string {
  return `Hold the ID next to your face and ${challenge} with your free hand.`;
}

function cameraErrorMessage(err: unknown): string {
  const name = err instanceof DOMException ? err.name : '';
  if (name === 'NotAllowedError') return 'Camera access was blocked. Allow the camera in your browser settings and try again.';
  if (name === 'NotFoundError' || name === 'OverconstrainedError') return 'No front camera was found on this device.';
  if (name === 'NotReadableError') return 'Another app is using the camera. Close it and try again.';
  return 'The camera could not start.';
}

type CameraState = 'idle' | 'starting' | 'live' | 'unavailable';

interface SelfieCaptureFieldProps {
  label: string;
  value: SelfieCapture | null;
  onChange: (value: SelfieCapture | null) => void;
  error?: string | null;
  required?: boolean;
}

export const SelfieCaptureField: React.FC<SelfieCaptureFieldProps> = ({ label, value, onChange, error, required }) => {
  const fileRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mountedRef = useRef(true);
  const [challenge, setChallenge] = useState(() => value?.challenge ?? pickChallenge());
  const [camera, setCamera] = useState<CameraState>('idle');
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [cameraMessage, setCameraMessage] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setIsVideoReady(false);
  };

  // Turn the camera off when the applicant leaves the step mid-capture.
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (camera !== 'live' || !video || !streamRef.current) return;
    video.srcObject = streamRef.current;
    video.play().catch(() => undefined);
    // Keep the gesture instruction on screen; the frame is taller than the empty state on phones.
    video.parentElement?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [camera]);

  const openCamera = async () => {
    setLocalError(null);
    // A retake gets a different gesture than the selfie on file.
    if (value) setChallenge(pickChallenge(value.challenge));

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraMessage(
        window.isSecureContext
          ? 'This browser cannot open the camera.'
          : 'The camera only works on a secure (https) address.'
      );
      setCamera('unavailable');
      return;
    }

    setCamera('starting');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      setCamera('live');
    } catch (err) {
      if (!mountedRef.current) return;
      setCameraMessage(cameraErrorMessage(err));
      setCamera('unavailable');
    }
  };

  const cancelCamera = () => {
    stopStream();
    setCamera('idle');
  };

  const takeSelfie = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const scale = Math.min(1, MAX_EDGE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(video.videoWidth * scale);
    canvas.height = Math.round(video.videoHeight * scale);
    const context = canvas.getContext('2d');
    if (!context) {
      setLocalError('Your browser could not process the camera image.');
      return;
    }
    // The preview is mirrored like a mirror; the saved frame is not, so the ID text reads normally.
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    onChange({
      imageDataUrl: canvas.toDataURL('image/jpeg', QUALITY),
      challenge,
      method: 'live-camera',
      capturedAt: new Date().toISOString(),
    });
    stopStream();
    setCamera('idle');
  };

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setIsBusy(true);
    setLocalError(null);
    try {
      onChange({
        imageDataUrl: await fileToDataUrl(file, MAX_EDGE, QUALITY),
        challenge,
        method: 'upload',
        capturedAt: new Date().toISOString(),
      });
      setCamera('idle');
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : 'Could not read that image.');
    } finally {
      setIsBusy(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const shownError = error || localError;
  const frameClass = 'relative aspect-[3/4] sm:aspect-[4/3] max-h-[70vh] bg-black rounded-xl sm:rounded-2xl overflow-hidden border border-zinc-200';

  return (
    <div className="space-y-1.5">
      <span className={labelClass}>
        {label}
        {required && <span className="text-zinc-400"> *</span>}
      </span>

      {camera === 'live' ? (
        <div className="space-y-2">
          <div className={frameClass}>
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              onLoadedMetadata={() => setIsVideoReady(true)}
              aria-label="Live camera preview"
              className="w-full h-full object-contain -scale-x-100"
            />
            {!isVideoReady && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/80">
                Starting camera...
              </div>
            )}
            <div className="absolute top-2 inset-x-2 rounded-lg bg-black/65 text-white text-[11px] sm:text-xs font-semibold px-3 py-2 text-center leading-snug">
              {instructionFor(challenge)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="button" variant="secondary" onClick={cancelCamera} className="shrink-0">
              <X className="w-4 h-4" />
              <span>Cancel</span>
            </Button>
            <Button type="button" onClick={takeSelfie} disabled={!isVideoReady} className="flex-1">
              <Camera className="w-4 h-4" />
              <span>Take Selfie</span>
            </Button>
          </div>
        </div>
      ) : camera === 'unavailable' ? (
        <div className="border border-amber-200 bg-amber-50 rounded-xl sm:rounded-2xl p-4 space-y-3">
          <div className="space-y-1 text-xs leading-relaxed">
            <p className="font-semibold text-amber-900">{cameraMessage}</p>
            <p className="text-amber-900/90">
              You can upload a selfie instead. {instructionFor(challenge)} Uploaded selfies get a closer
              admin review, so approval may take longer.
            </p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />
          <div className="flex flex-col sm:flex-row gap-2">
            <Button type="button" variant="secondary" onClick={openCamera}>
              <RefreshCw className="w-4 h-4" />
              <span>Try Camera Again</span>
            </Button>
            <Button type="button" onClick={() => fileRef.current?.click()} loading={isBusy} className="flex-1">
              <Upload className="w-4 h-4" />
              <span>Upload Selfie Instead</span>
            </Button>
          </div>
          {value && (
            <button
              type="button"
              onClick={() => setCamera('idle')}
              className="text-[11px] font-semibold text-amber-900 underline underline-offset-4"
            >
              Keep the current selfie
            </button>
          )}
        </div>
      ) : value ? (
        <div className="space-y-1.5">
          <div className={frameClass}>
            <img src={value.imageDataUrl} alt="Your selfie holding the ID" className="w-full h-full object-contain" />
            <div className="absolute bottom-2 right-2 flex items-center gap-1.5">
              <button
                type="button"
                onClick={openCamera}
                className="px-3 py-1.5 bg-white/95 text-zinc-950 rounded-full text-[11px] font-semibold shadow-md border border-zinc-200 hover:bg-white"
              >
                {camera === 'starting' ? 'Opening camera...' : 'Retake'}
              </button>
              <button
                type="button"
                onClick={() => onChange(null)}
                aria-label="Remove selfie"
                className="w-8 h-8 bg-white/95 text-zinc-950 rounded-full flex items-center justify-center shadow-md border border-zinc-200 hover:bg-white"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <p className="text-[11px] text-zinc-500">
            Requested gesture: {value.challenge}.{' '}
            {value.method === 'live-camera' ? 'Taken with the live camera.' : 'Uploaded file, flagged for closer review.'}
          </p>
        </div>
      ) : (
        <div
          className={`border-2 border-dashed rounded-xl sm:rounded-2xl p-4 space-y-3 ${
            shownError ? 'border-red-300 bg-red-50/40' : 'border-zinc-300 bg-zinc-50'
          }`}
        >
          <div className="flex items-start gap-3">
            <ScanFace className="w-6 h-6 text-zinc-500 shrink-0" />
            <div className="space-y-1 text-xs leading-relaxed">
              <p className="font-semibold text-zinc-900">{instructionFor(challenge)}</p>
              <p className="text-zinc-600">
                Use the same ID as the photo above. Keep your whole face and the whole ID in frame, in good
                light, with no sunglasses, cap, or face mask.
              </p>
            </div>
          </div>
          <Button type="button" onClick={openCamera} loading={camera === 'starting'} className="w-full">
            <Camera className="w-4 h-4" />
            <span>Open Camera</span>
          </Button>
        </div>
      )}

      {shownError ? (
        <p className="text-[11px] text-red-600 font-medium">{shownError}</p>
      ) : (
        <p className="text-[11px] text-zinc-500">Only Habi admins see this selfie. It is never shown to buyers.</p>
      )}
    </div>
  );
};
