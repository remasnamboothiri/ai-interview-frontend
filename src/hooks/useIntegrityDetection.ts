/**
 * useIntegrityDetection Hook
 *
 * Client-side interview integrity monitoring:
 * 1. Face Detection    — face-api.js SSD MobileNet (2+ faces = cheating)
 * 2. Gaze Tracking     — face-api.js face landmarks (looking away detection)
 * 3. Phone Detection   — MediaPipe Object Detector (phone/laptop/book visible)
 *
 * MediaPipe uses WASM — no TensorFlow.js conflict with face-api.js.
 *
 * Required npm packages:
 *   npm install face-api.js @mediapipe/tasks-vision
 *
 * Required model files in public/models/:
 *   - ssd_mobilenetv1_model-weights_manifest.json + shards
 *   - face_landmark_68_model-weights_manifest.json + shard1
 *   (MediaPipe model auto-downloads from CDN)
 */

import { useRef, useCallback, useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';

interface IntegrityDetectionOptions {
  videoRef: React.RefObject<HTMLVideoElement>;
  interviewId: number | null;
  enabled: boolean;
  intervalMs?: number;
  apiBaseUrl?: string;
}

interface IntegrityDetectionState {
  faceCount: number;
  multipleFacesDetected: boolean;
  phoneDetected: boolean;
  lookingAway: boolean;
  totalFlags: number;
  isModelLoaded: boolean;
  canvasRef: React.RefObject<HTMLCanvasElement>;
  isLoading: boolean;
  error: string | null;
}

// Lazy-load MediaPipe Object Detector
let mediapipeDetectorPromise: Promise<any> | null = null;

async function loadMediaPipeDetector() {
  if (mediapipeDetectorPromise) return mediapipeDetectorPromise;

  mediapipeDetectorPromise = (async () => {
    try {
      const vision = await import('@mediapipe/tasks-vision');
      const { ObjectDetector, FilesetResolver } = vision;

      const wasmFileset = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const detector = await ObjectDetector.createFromOptions(wasmFileset, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite',
          delegate: 'GPU',
        },
        runningMode: 'IMAGE',
        maxResults: 5,
        scoreThreshold: 0.35,
      });

      console.log(':white_check_mark: MediaPipe Object Detector loaded (phone detection)');
      return detector;
    } catch (err) {
      console.warn(':warning: MediaPipe Object Detector failed to load, phone detection disabled:', err);
      mediapipeDetectorPromise = null;
      return null;
    }
  })();

  return mediapipeDetectorPromise;
}

export function useIntegrityDetection({
  videoRef,
  interviewId,
  enabled,
  intervalMs = 2500,
  apiBaseUrl = '',
}: IntegrityDetectionOptions): IntegrityDetectionState {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [faceCount, setFaceCount] = useState(0);
  const [multipleFacesDetected, setMultipleFacesDetected] = useState(false);
  const [phoneDetected, setPhoneDetected] = useState(false);
  const [lookingAway, setLookingAway] = useState(false);
  const [totalFlags, setTotalFlags] = useState(0);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isUploadingRef = useRef(false);
  const consecutiveMultiRef = useRef(0);
  const consecutivePhoneRef = useRef(0);
  const consecutiveGazeRef = useRef(0);
  const lastFlagTimeRef = useRef(0);
  const hasLandmarksRef = useRef(false);
  const detectionModeRef = useRef<'ssd' | 'tiny' | null>(null);
  const mediapipeRef = useRef<any>(null);

  // :white_check_mark: FIX: Track whether detection is currently running to prevent overlapping calls
  const isDetectingRef = useRef(false);

  // ── Load all models ──────────────────────────────────────
  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 1. Load face detection (SSD MobileNet → TinyFace fallback)
        try {
          await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
          detectionModeRef.current = 'ssd';
          console.log(':white_check_mark: Face detection loaded (SSD MobileNet v1)');
        } catch {
          console.warn('SSD MobileNet failed, trying TinyFaceDetector...');
          await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
          detectionModeRef.current = 'tiny';
          console.log(':white_check_mark: Face detection loaded (TinyFaceDetector fallback)');
        }

        // 2. Load face landmarks for gaze tracking
        try {
          await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
          hasLandmarksRef.current = true;
          console.log(':white_check_mark: Face landmarks loaded (gaze tracking)');
        } catch {
          console.warn(':warning: Face landmarks not loaded, gaze tracking disabled');
        }

        // 3. Load MediaPipe Object Detector for phone detection (async, non-blocking)
        loadMediaPipeDetector().then((detector) => {
          mediapipeRef.current = detector;
        });

        if (!cancelled) {
          setIsModelLoaded(true);
          setIsLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(':x: Failed to load detection models:', err);
          setError('Detection models failed to load');
          setIsLoading(false);
        }
      }
    };

    init();
    return () => { cancelled = true; };
  }, []);

  // ── Upload flagged screenshot with metadata ──────────────
  const uploadFlaggedScreenshot = useCallback(async (
    video: HTMLVideoElement,
    reason: string,
    metadata: Record<string, any>,
    boxes?: Array<{ x: number; y: number; width: number; height: number; label: string; color: string }>,
  ) => {
    if (isUploadingRef.current || !interviewId) return;

    const now = Date.now();
    if (now - lastFlagTimeRef.current < 30000) return; // Rate limit: 1 per 30s
    lastFlagTimeRef.current = now;
    isUploadingRef.current = true;

    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(video, 0, 0);

      // Draw detection boxes
      if (boxes) {
        boxes.forEach((box) => {
          ctx.strokeStyle = box.color;
          ctx.lineWidth = 3;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.fillStyle = box.color;
          ctx.font = 'bold 14px Arial';
          ctx.fillText(box.label, box.x + 2, box.y - 5);
        });
      }

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/jpeg', 0.85)
      );
      if (!blob) return;

      const fd = new FormData();
      fd.append('webcam_image', blob, `flagged_${Date.now()}.jpg`);
      fd.append('interview', interviewId.toString());
      fd.append('screenshot_number', '0');
      fd.append('is_flagged', 'true');
      fd.append('flag_reason', reason);
      fd.append('face_count', (metadata.face_count || 0).toString());

      if (metadata.phone_detected) {
        fd.append('issue_type', 'phone_detected');
      } else if (metadata.looking_away) {
        fd.append('issue_type', 'looking_away');
      } else if ((metadata.face_count || 0) > 1) {
        fd.append('issue_type', 'multiple_faces');
      }

      fd.append('metadata', JSON.stringify(metadata));

      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
      const baseUrl = apiBaseUrl || import.meta.env.VITE_API_BASE_URL || '';

      await fetch(`${baseUrl}/api/interview-screenshots/upload/`, {
        method: 'POST',
        headers: token ? { 'Authorization': `Bearer ${token}` } : {},
        body: fd,
      });

      setTotalFlags((prev) => prev + 1);
      console.log(`:camera_with_flash: Flagged screenshot uploaded: ${reason}`);
    } catch (err) {
      console.error('Failed to upload flagged screenshot:', err);
    } finally {
      isUploadingRef.current = false;
    }
  }, [interviewId, apiBaseUrl]);

  // ── Main detection loop ──────────────────────────────────
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
      setPhoneDetected(false);
      setLookingAway(false);
      return;
    }

    const detect = async () => {
      // :white_check_mark: FIX: Prevent overlapping detection calls
      if (isDetectingRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // :white_check_mark: FIX: Guard against missing elements or paused/ended video
      if (!video || !canvas || video.paused || video.ended) return;

      // :white_check_mark: FIX: If video dimensions aren't ready yet, retry after a short delay
      // instead of silently returning and missing the detection window
      if (!video.videoWidth || !video.videoHeight) {
        setTimeout(() => {
          if (!isDetectingRef.current) detect();
        }, 500);
        return;
      }

      isDetectingRef.current = true;

      try {
        // :white_check_mark: FIX: Use actual video dimensions for canvas to ensure correct scaling
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;

        canvas.width = videoWidth;
        canvas.height = videoHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) { isDetectingRef.current = false; return; }
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const allBoxes: Array<{ x: number; y: number; width: number; height: number; label: string; color: string }> = [];

        // ─── 1. FACE DETECTION + LANDMARKS ───────────────
        let faceResults: any[] = [];
        let hasLandmarkData = false;

        if (detectionModeRef.current === 'ssd') {
          if (hasLandmarksRef.current) {
            faceResults = await faceapi
              // :white_check_mark: FIX: Lowered minConfidence from 0.3 to 0.15 for better detection
              // in dark environments and side-on face angles
              .detectAllFaces(video, new faceapi.SsdMobilenetv1Options({ minConfidence: 0.15 }))
              .withFaceLandmarks();
            hasLandmarkData = true;
          } else {
            faceResults = await faceapi.detectAllFaces(
              video,
              new faceapi.SsdMobilenetv1Options({ minConfidence: 0.15 })
            );
          }
        } else if (detectionModeRef.current === 'tiny') {
          faceResults = await faceapi.detectAllFaces(
            video,
            // :white_check_mark: FIX: Lowered scoreThreshold from 0.15 to 0.10 for tiny detector fallback
            new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.10 })
          );
        }

        // :white_check_mark: FIX: Resize results using the actual video dimensions (not canvas display size)
        // This ensures bounding boxes are correctly scaled to the canvas
        const videoSize = { width: videoWidth, height: videoHeight };
        const resizedFaces = faceapi.resizeResults(faceResults, videoSize);
        const fCount = resizedFaces.length;

        setFaceCount(fCount);

        // Draw face boxes when 2+ faces
        if (fCount > 1) {
          resizedFaces.forEach((det: any, i: number) => {
            const box = det.detection ? det.detection.box : det.box;
            allBoxes.push({
              x: box.x, y: box.y, width: box.width, height: box.height,
              label: `Face ${i + 1}`, color: '#ef4444',
            });
          });
        }

        // ─── 2. GAZE TRACKING ────────────────────────────
        let isLookingAway = false;

        if (hasLandmarkData && fCount === 1) {
          const landmarks = resizedFaces[0]?.landmarks;
          if (landmarks) {
            const nose = landmarks.getNose();
            const leftEye = landmarks.getLeftEye();
            const rightEye = landmarks.getRightEye();
            const jaw = landmarks.getJawOutline();

            if (nose.length > 0 && leftEye.length > 0 && rightEye.length > 0 && jaw.length > 0) {
              const faceLeft = jaw[0].x;
              const faceRight = jaw[jaw.length - 1].x;
              const faceCenter = (faceLeft + faceRight) / 2;
              const noseTip = nose[3];
              const faceWidth = faceRight - faceLeft;
              const horizontalOffset = Math.abs(noseTip.x - faceCenter) / faceWidth;

              const eyeCenter = (leftEye[0].x + rightEye[3].x) / 2;
              const eyeOffset = Math.abs(eyeCenter - faceCenter) / faceWidth;

              if (horizontalOffset > 0.18 || eyeOffset > 0.15) {
                isLookingAway = true;
              }
            }
          }
        }

        setLookingAway(isLookingAway);

        // ─── 3. PHONE/OBJECT DETECTION (MediaPipe) ───────
        let isPhoneDetected = false;

        if (mediapipeRef.current) {
          try {
            const result = mediapipeRef.current.detect(video);
            const suspiciousClasses = ['cell phone', 'laptop', 'book', 'remote'];

            if (result?.detections) {
              for (const det of result.detections) {
                const category = det.categories?.[0];
                if (category && suspiciousClasses.includes(category.categoryName) && category.score > 0.35) {
                  isPhoneDetected = true;

                  const bbox = det.boundingBox;
                  if (bbox) {
                    // :white_check_mark: FIX: Scale bbox using actual video dimensions consistently
                    const scaleX = videoWidth / video.videoWidth;
                    const scaleY = videoHeight / video.videoHeight;
                    allBoxes.push({
                      x: bbox.originX * scaleX,
                      y: bbox.originY * scaleY,
                      width: bbox.width * scaleX,
                      height: bbox.height * scaleY,
                      label: `${category.categoryName} (${Math.round(category.score * 100)}%)`,
                      color: '#f59e0b', // Orange
                    });
                  }
                }
              }
            }
          } catch {
            // MediaPipe detection failed silently
          }
        }

        setPhoneDetected(isPhoneDetected);

        // ─── DRAW ALL BOXES ──────────────────────────────
        allBoxes.forEach((box) => {
          ctx.strokeStyle = box.color;
          ctx.lineWidth = 3;
          ctx.shadowColor = box.color;
          ctx.shadowBlur = 8;
          ctx.strokeRect(box.x, box.y, box.width, box.height);
          ctx.shadowBlur = 0;

          const labelWidth = ctx.measureText(box.label).width + 12;
          ctx.fillStyle = box.color + 'dd';
          ctx.fillRect(box.x, box.y - 22, labelWidth, 22);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 13px Arial';
          ctx.fillText(box.label, box.x + 6, box.y - 6);
        });

        // ─── GAZE INDICATOR ON CANVAS ────────────────────
        if (isLookingAway) {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.8)';
          ctx.fillRect(canvas.width / 2 - 80, 8, 160, 28);
          ctx.fillStyle = '#ffffff';
          ctx.font = 'bold 14px Arial';
          ctx.textAlign = 'center';
          ctx.fillText('⚠ Looking Away', canvas.width / 2, 26);
          ctx.textAlign = 'start';
        }

        // ─── LOG ─────────────────────────────────────────
        const mode = detectionModeRef.current === 'ssd' ? 'SSD' : 'Tiny';
        console.log(
          `:mag: Detection: ${fCount} face(s) [${mode}]` +
          `${isPhoneDetected ? ' | :iphone: Phone' : ''}` +
          `${isLookingAway ? ' | 👁 Looking away' : ''}`
        );

        // ─── FLAGGING: MULTIPLE FACES ────────────────────
        if (fCount > 1) {
          consecutiveMultiRef.current += 1;
          setMultipleFacesDetected(true);
          if (consecutiveMultiRef.current >= 2) {
            uploadFlaggedScreenshot(video,
              `Multiple faces detected: ${fCount} faces`,
              { face_count: fCount, phone_detected: isPhoneDetected, looking_away: isLookingAway },
              allBoxes,
            );
            consecutiveMultiRef.current = 0;
          }
        } else {
          consecutiveMultiRef.current = 0;
          setMultipleFacesDetected(false);
        }

        // ─── FLAGGING: PHONE ─────────────────────────────
        if (isPhoneDetected) {
          consecutivePhoneRef.current += 1;
          if (consecutivePhoneRef.current >= 2) {
            uploadFlaggedScreenshot(video,
              'Phone or device detected',
              { face_count: fCount, phone_detected: true, looking_away: isLookingAway },
              allBoxes,
            );
            consecutivePhoneRef.current = 0;
          }
        } else {
          consecutivePhoneRef.current = 0;
        }

        // ─── FLAGGING: LOOKING AWAY ──────────────────────
        if (isLookingAway) {
          consecutiveGazeRef.current += 1;
          if (consecutiveGazeRef.current >= 4) {
            uploadFlaggedScreenshot(video,
              'Candidate looking away from screen',
              { face_count: fCount, phone_detected: isPhoneDetected, looking_away: true },
              allBoxes,
            );
            consecutiveGazeRef.current = 0;
          }
        } else {
          consecutiveGazeRef.current = 0;
        }

      } catch (err) {
        console.warn('Detection error:', err);
      } finally {
        // :white_check_mark: FIX: Always release the detecting lock, even on error
        isDetectingRef.current = false;
      }
    };

    detect();
    intervalRef.current = setInterval(detect, intervalMs);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      // :white_check_mark: FIX: Release lock on cleanup
      isDetectingRef.current = false;
    };
  }, [enabled, isModelLoaded, videoRef, intervalMs, uploadFlaggedScreenshot]);

  return {
    faceCount,
    multipleFacesDetected,
    phoneDetected,
    lookingAway,
    totalFlags,
    isModelLoaded,
    canvasRef: canvasRef as React.RefObject<HTMLCanvasElement>,
    isLoading,
    error,
  };
}

// Backward compatibility
export const useFaceDetection = useIntegrityDetection;