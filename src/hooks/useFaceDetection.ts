/**
 * useFaceDetection Hook
 *
 * Real-time face detection using face-api.js SSD MobileNet v1
 * (much more accurate than TinyFaceDetector, works in ALL browsers)
 *
 * - Draws rectangles around all detected faces when 2+ faces
 * - Flags when 2+ faces are detected
 * - Auto-captures flagged screenshots and sends to backend
 *
 * Required model files in public/models/:
 *   - ssd_mobilenetv1_model-weights_manifest.json
 *   - ssd_mobilenetv1_model-shard1
 *   - ssd_mobilenetv1_model-shard2
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface FaceDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  interviewId: number | null;
  enabled: boolean;
  intervalMs?: number;
  apiBaseUrl?: string;
}

interface FaceDetectionState {
  faceCount: number;
  multipleFacesDetected: boolean;
  totalFlags: number;
  isModelLoaded: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  error: string | null;
}

export function useFaceDetection({
  videoRef,
  interviewId,
  enabled,
  intervalMs = 2500,
  apiBaseUrl = '',
}: FaceDetectionOptions): FaceDetectionState {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceCount, setFaceCount] = useState(0);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const [totalFlags, setTotalFlags] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUploadingRef = useRef(false);
  const consecutiveMultiRef = useRef(0);
  const lastFlagTimeRef = useRef(0);

  // -- Load SSD MobileNet model (more accurate than TinyFaceDetector) --
  useEffect(() => {
    let cancelled = false;

    const loadModel = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try SSD MobileNet first (more accurate)
        try {
          await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
          if (!cancelled) {
            setIsModelLoaded(true);
            setIsLoading(false);
            console.log('\u2705 Face detection model loaded (SSD MobileNet v1)');
          }
          return;
        } catch (ssdErr) {
          console.warn('SSD MobileNet failed to load, trying TinyFaceDetector...', ssdErr);
        }

        // Fallback to TinyFaceDetector
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        if (!cancelled) {
          setIsModelLoaded(true);
          setIsLoading(false);
          console.log('\u2705 Face detection model loaded (TinyFaceDetector fallback)');
        }
      } catch (err) {
        if (!cancelled) {
          console.error('\u274c Failed to load face detection model:', err);
          setError('Face detection model failed to load');
          setIsLoading(false);
        }
      }
    };

    loadModel();
    return () => { cancelled = true; };
  }, []);

  // -- Upload flagged screenshot --
  const uploadFlaggedScreenshot = useCallback(async (
    video: HTMLVideoElement,
    detections: faceapi.FaceDetection[],
  ) => {
    if (isUploadingRef.current || !interviewId) return;
    isUploadingRef.current = true;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);

      ctx.strokeStyle = '#ff0000';
      ctx.lineWidth = 3;
      ctx.font = '16px Arial';
      ctx.fillStyle = '#ff0000';

      const displaySize = { width: video.videoWidth, height: video.videoHeight };
      const resized = faceapi.resizeResults(detections, displaySize);

      resized.forEach((det, i) => {
        const box = det.box;
        ctx.strokeRect(box.x, box.y, box.width, box.height);
        ctx.fillText(`Face ${i + 1}`, box.x, box.y - 5);
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      );
      if (!blob) return;

      const fd = new FormData();
      fd.append('webcam_image', blob, `flagged_multiface_${Date.now()}.jpg`);
      fd.append('interview', interviewId.toString());
      fd.append('screenshot_number', '0');
      fd.append('is_flagged', 'true');
      fd.append('flag_reason', `Multiple faces detected: ${detections.length} faces`);
      fd.append('face_count', detections.length.toString());

      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
      const baseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || '';

      await fetch(`${baseUrl}/api/interview-screenshots/upload/`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: fd,
      });

      console.log(`\ud83d\udcf8 Flagged screenshot uploaded: ${detections.length} faces`);
    } catch (err) {
      console.error('Failed to upload flagged screenshot:', err);
    } finally {
      isUploadingRef.current = false;
    }
  }, [interviewId, apiBaseUrl]);

  // -- Detection loop --
  useEffect(() => {
    if (!enabled || !isModelLoaded) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (canvasRef.current) {
        const ctx = canvasRef.current.getContext('2d');
        if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
      setFaceCount(0);
      setMultipleFacesDetected(false);
      return;
    }

    const detect = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !video.videoWidth || video.paused || video.ended) return;

      try {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Use whichever model loaded successfully
        let detections: faceapi.FaceDetection[];

        if (faceapi.nets.ssdMobilenetv1.isLoaded) {
          // SSD MobileNet - more accurate, detects smaller/angled faces
          detections = await faceapi.detectAllFaces(
            video,
            new faceapi.SsdMobilenetv1Options({
              minConfidence: 0.3,  // Low threshold to catch distant faces
            })
          );
        } else {
          // TinyFaceDetector fallback
          detections = await faceapi.detectAllFaces(
            video,
            new faceapi.TinyFaceDetectorOptions({
              inputSize: 512,
              scoreThreshold: 0.15,
            })
          );
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const displaySize = { width: canvas.width, height: canvas.height };
        const resized = faceapi.resizeResults(detections, displaySize);

        const count = detections.length;

        const modelName = faceapi.nets.ssdMobilenetv1.isLoaded ? 'SSD' : 'Tiny';
        console.log(`\ud83d\udd0d Face detection: ${count} face(s) found [${modelName}]`);

        setFaceCount(count);

        // Draw rectangles only when 2+ faces
        if (count > 1) {
          resized.forEach((det, i) => {
            const box = det.box;

            // Red rectangle with glow
            ctx.strokeStyle = '#ef4444';
            ctx.lineWidth = 3;
            ctx.shadowColor = '#ef4444';
            ctx.shadowBlur = 8;
            ctx.strokeRect(box.x, box.y, box.width, box.height);
            ctx.shadowBlur = 0;

            // Label background
            ctx.fillStyle = 'rgba(239, 68, 68, 0.85)';
            const labelWidth = 70;
            const labelHeight = 22;
            ctx.fillRect(box.x, box.y - labelHeight, labelWidth, labelHeight);

            // Label text
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Arial';
            ctx.fillText(`Face ${i + 1}`, box.x + 6, box.y - 6);
          });
        }

        // Handle multiple faces
        if (count > 1) {
          consecutiveMultiRef.current += 1;
          setMultipleFacesDetected(true);

          const now = Date.now();
          if (
            consecutiveMultiRef.current >= 2 &&
            now - lastFlagTimeRef.current > 30000
          ) {
            lastFlagTimeRef.current = now;
            setTotalFlags(prev => prev + 1);
            console.log(`\u26a0\ufe0f Multiple faces confirmed: ${count} faces detected`);
            uploadFlaggedScreenshot(video, detections);
          }
        } else {
          consecutiveMultiRef.current = 0;
          setMultipleFacesDetected(false);
        }
      } catch (err) {
        console.warn('Face detection error:', err);
      }
    };

    detect();
    intervalRef.current = setInterval(detect, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, isModelLoaded, videoRef, intervalMs, uploadFlaggedScreenshot]);

  return {
    faceCount,
    multipleFacesDetected,
    totalFlags,
    isModelLoaded,
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    isLoading,
    error,
  };
}