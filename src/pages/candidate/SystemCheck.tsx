import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  CheckCircle, XCircle, Video, Mic, Wifi, Monitor, Volume2,
  Brain, AudioLines, RefreshCw, ArrowRight, AlertTriangle, Loader2
} from 'lucide-react';

type CheckStatus = 'pending' | 'checking' | 'success' | 'warning' | 'error';

interface CheckItem {
  key: string;
  label: string;
  description: string;
  icon: any;
  status: CheckStatus;
  detail: string;
}

export const SystemCheck = () => {
  const { uuid } = useParams<{ uuid: string }>();
  const navigate = useNavigate();
  const [statusChecked, setStatusChecked] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [currentCheck, setCurrentCheck] = useState('');
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [micLevel, setMicLevel] = useState(0);
  const micIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [checks, setChecks] = useState<CheckItem[]>([
    { key: 'browser', label: 'Browser Compatibility', description: 'WebRTC, AudioContext, WASM support', icon: Monitor, status: 'pending', detail: '' },
    { key: 'internet', label: 'Internet Connection', description: 'Backend API reachable', icon: Wifi, status: 'pending', detail: '' },
    { key: 'camera', label: 'Camera Access', description: 'Video stream active', icon: Video, status: 'pending', detail: '' },
    { key: 'microphone', label: 'Microphone Access', description: 'Audio input level detected', icon: Mic, status: 'pending', detail: '' },
    { key: 'tts', label: 'AI Voice (TTS)', description: 'Text-to-speech audio plays', icon: Volume2, status: 'pending', detail: '' },
    { key: 'stt', label: 'Speech Recognition (STT)', description: 'Deepgram connection works', icon: AudioLines, status: 'pending', detail: '' },
    { key: 'vad', label: 'Voice Activity Detection', description: 'Silero neural network loads', icon: Brain, status: 'pending', detail: '' },
  ]);

  const updateCheck = useCallback((key: string, status: CheckStatus, detail: string) => {
    setChecks(prev => prev.map(c => c.key === key ? { ...c, status, detail } : c));
  }, []);

  // Check interview status first
  useEffect(() => {
    if (!uuid) return;
    const checkStatus = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const resp = await fetch(`${baseUrl}/api/interviews/by-uuid/${uuid}/`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.status === 'completed') {
            navigate('/interview/already-completed', { replace: true });
            return;
          }
        }
      } catch (e) {}
      setStatusChecked(true);
    };
    checkStatus();
  }, [uuid, navigate]);

  // Auto-run checks when page loads
  useEffect(() => {
    if (statusChecked && !isRunning) {
      runAllChecks();
    }
  }, [statusChecked]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  const runAllChecks = async () => {
    setIsRunning(true);
    setChecks(prev => prev.map(c => ({ ...c, status: 'pending', detail: '' })));

    await checkBrowser();
    await checkInternet();
    await checkCamera();
    await checkMicrophone();
    await checkTTS();
    await checkSTT();
    await checkVAD();

    setCurrentCheck('');
    setIsRunning(false);
  };

  // ── 1. Browser Compatibility ─────────────────────────────
  const checkBrowser = async () => {
    setCurrentCheck('browser');
    updateCheck('browser', 'checking', 'Checking browser features...');
    await sleep(500);

    const issues: string[] = [];
    if (!navigator.mediaDevices?.getUserMedia) issues.push('No getUserMedia');
    if (!window.AudioContext && !(window as any).webkitAudioContext) issues.push('No AudioContext');
    if (!window.MediaRecorder) issues.push('No MediaRecorder');
    if (typeof WebAssembly === 'undefined') issues.push('No WebAssembly');
    if (!window.WebSocket) issues.push('No WebSocket');

    if (issues.length === 0) {
      updateCheck('browser', 'success', 'All features supported');
    } else if (issues.length <= 1) {
      updateCheck('browser', 'warning', `Missing: ${issues.join(', ')}`);
    } else {
      updateCheck('browser', 'error', `Missing: ${issues.join(', ')}`);
    }
  };

  // ── 2. Internet Connection ───────────────────────────────
  const checkInternet = async () => {
    setCurrentCheck('internet');
    updateCheck('internet', 'checking', 'Connecting to server...');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const start = Date.now();
      const resp = await fetch(`${baseUrl}/api/interviews/by-uuid/${uuid}/`);
      const latency = Date.now() - start;

      if (resp.ok || resp.status === 404) {
        if (latency < 500) updateCheck('internet', 'success', `Connected (${latency}ms latency)`);
        else if (latency < 2000) updateCheck('internet', 'warning', `Slow connection (${latency}ms) — may affect audio`);
        else updateCheck('internet', 'warning', `Very slow (${latency}ms) — interview may lag`);
      } else {
        updateCheck('internet', 'error', `Server error: ${resp.status}`);
      }
    } catch (e) {
      updateCheck('internet', 'error', 'Cannot reach server — check your connection');
    }
  };

  // ── 3. Camera ────────────────────────────────────────────
  const checkCamera = async () => {
    setCurrentCheck('camera');
    updateCheck('camera', 'checking', 'Requesting camera access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 } },
      });

      if (videoRef.current) videoRef.current.srcObject = stream;
      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      streamRef.current = stream;

      updateCheck('camera', 'success', `${videoTrack.label} (${settings.width || '?'}x${settings.height || '?'})`);
    } catch (e: any) {
      if (e.name === 'NotAllowedError') updateCheck('camera', 'error', 'Camera permission denied — click the lock icon in your browser');
      else if (e.name === 'NotFoundError') updateCheck('camera', 'error', 'No camera found — please connect a webcam');
      else updateCheck('camera', 'error', `Camera error: ${e.message}`);
    }
  };

  // ── 4. Microphone ────────────────────────────────────────
  const checkMicrophone = async () => {
    setCurrentCheck('microphone');
    updateCheck('microphone', 'checking', 'Requesting microphone access...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      });

      const audioTrack = stream.getAudioTracks()[0];
      updateCheck('microphone', 'checking', `${audioTrack.label} — speak now to test...`);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);

      let maxVol = 0;
      let frames = 0;
      const dataArray = new Uint8Array(analyser.fftSize);

      await new Promise<void>((resolve) => {
        micIntervalRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) {
            const val = (dataArray[i] - 128) / 128;
            sum += val * val;
          }
          const vol = Math.sqrt(sum / dataArray.length);
          if (vol > maxVol) maxVol = vol;
          setMicLevel(vol);
          frames++;

          if (frames >= 80) {
            clearInterval(micIntervalRef.current!);
            micIntervalRef.current = null;
            resolve();
          }
        }, 50);
      });

      source.disconnect();
      try { ctx.close(); } catch (e) {}
      stream.getTracks().forEach(t => t.stop());
      setMicLevel(0);

      if (maxVol >= 0.01) {
        updateCheck('microphone', 'success', `${audioTrack.label} — audio detected (peak: ${(maxVol * 100).toFixed(0)}%)`);
      } else {
        updateCheck('microphone', 'warning', `${audioTrack.label} — no audio detected. Is your mic muted?`);
      }
    } catch (e: any) {
      if (e.name === 'NotAllowedError') updateCheck('microphone', 'error', 'Microphone permission denied — click the lock icon');
      else if (e.name === 'NotFoundError') updateCheck('microphone', 'error', 'No microphone found');
      else updateCheck('microphone', 'error', `Mic error: ${e.message}`);
    }
  };

  // ── 5. TTS ───────────────────────────────────────────────
  const checkTTS = async () => {
    setCurrentCheck('tts');
    updateCheck('tts', 'checking', 'Testing AI voice...');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';

      const start = Date.now();
      const resp = await fetch(`${baseUrl}/api/speech/tts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          text: 'System check complete. Audio is working.',
          voice: 'en-US-AriaNeural',
          rate: '+0%',
          pitch: '+0Hz',
        }),
      });

      const latency = Date.now() - start;

      if (!resp.ok) {
        updateCheck('tts', 'error', `TTS server error: ${resp.status}`);
        return;
      }

      const blob = await resp.blob();
      if (blob.size < 100) {
        updateCheck('tts', 'error', 'TTS returned empty audio');
        return;
      }

      // Play a short clip to verify audio output
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);

      await new Promise<void>((resolve) => {
        audio.onended = () => { URL.revokeObjectURL(url); resolve(); };
        audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
        audio.play().catch(() => resolve());
        setTimeout(resolve, 8000);
      });

      updateCheck('tts', 'success', `AI voice working (${latency}ms, ${(blob.size / 1024).toFixed(0)}KB)`);
    } catch (e: any) {
      updateCheck('tts', 'error', `TTS failed: ${e.message}`);
    }
  };

  // ── 6. STT ───────────────────────────────────────────────
  const checkSTT = async () => {
    setCurrentCheck('stt');
    updateCheck('stt', 'checking', 'Connecting to Deepgram...');

    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const tokenResp = await fetch(`${baseUrl}/api/speech/stt-token/`);

      if (!tokenResp.ok) {
        updateCheck('stt', 'error', `STT token failed: ${tokenResp.status}`);
        return;
      }

      const { key } = await tokenResp.json();
      if (!key) {
        updateCheck('stt', 'error', 'No Deepgram API key configured');
        return;
      }

      const ws = new WebSocket(
        `wss://api.deepgram.com/v1/listen?model=nova-2&language=en`,
        ['token', key]
      );

      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => {
          ws.close();
          updateCheck('stt', 'error', 'Deepgram connection timeout (10s)');
          resolve();
        }, 10000);

        ws.onopen = () => {
          clearTimeout(timeout);
          ws.close();
          updateCheck('stt', 'success', 'Deepgram connected — speech recognition ready');
          resolve();
        };

        ws.onerror = () => {
          clearTimeout(timeout);
          updateCheck('stt', 'error', 'Deepgram WebSocket connection failed');
          resolve();
        };
      });
    } catch (e: any) {
      updateCheck('stt', 'error', `STT check failed: ${e.message}`);
    }
  };

  // ── 7. VAD (Silero) ──────────────────────────────────────
  const checkVAD = async () => {
    setCurrentCheck('vad');
    updateCheck('vad', 'checking', 'Loading Silero neural network...');

    try {
      if (!(window as any).ort) {
        updateCheck('vad', 'checking', 'Loading ONNX Runtime...');
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.wasm.min.js';
          s.onload = () => resolve();
          s.onerror = () => reject(new Error('ONNX Runtime failed to load'));
          document.head.appendChild(s);
        });
      }

      if (!(window as any).__vadLoaded) {
        updateCheck('vad', 'checking', 'Loading VAD model...');
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/bundle.min.js';
          s.onload = () => { (window as any).__vadLoaded = true; resolve(); };
          s.onerror = () => reject(new Error('VAD library failed to load'));
          document.head.appendChild(s);
        });
      }

      const MicVAD = (window as any).vad?.MicVAD;
      if (!MicVAD) {
        updateCheck('vad', 'warning', 'VAD library not available — will use fallback interrupt');
        return;
      }

      updateCheck('vad', 'checking', 'Initializing VAD model...');

      const testVad = await MicVAD.new({
        onnxWASMBasePath: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/',
        baseAssetPath: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/',
        positiveSpeechThreshold: 0.75,
        onSpeechStart: () => {},
        onSpeechEnd: () => {},
      });

      try { testVad.destroy(); } catch (e) {}

      updateCheck('vad', 'success', 'Silero VAD loaded — neural interrupt ready');
    } catch (e: any) {
      updateCheck('vad', 'warning', `VAD unavailable: ${e.message} — will use fallback`);
    }
  };

  const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

  const passedCount = checks.filter(c => c.status === 'success').length;
  const warningCount = checks.filter(c => c.status === 'warning').length;
  const errorCount = checks.filter(c => c.status === 'error').length;
  const allDone = checks.every(c => c.status !== 'pending' && c.status !== 'checking');
  const canProceed = allDone && errorCount <= 1
    && checks.find(c => c.key === 'camera')?.status !== 'error'
    && checks.find(c => c.key === 'microphone')?.status !== 'error';

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'pending': return <div className="w-5 h-5 rounded-full border-2 border-white/20" />;
      case 'checking': return <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />;
      case 'success': return <CheckCircle className="w-5 h-5 text-emerald-400" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-400" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-400" />;
    }
  };

  const getStatusBg = (status: CheckStatus) => {
    switch (status) {
      case 'success': return 'bg-emerald-500/5 border-emerald-500/20';
      case 'warning': return 'bg-amber-500/5 border-amber-500/20';
      case 'error': return 'bg-red-500/5 border-red-500/20';
      case 'checking': return 'bg-violet-500/5 border-violet-500/20';
      default: return 'bg-white/[0.02] border-white/5';
    }
  };

  if (!statusChecked) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-300 text-xs font-medium mb-4">
            <Monitor className="w-3.5 h-3.5" />
            Pre-Interview Check
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">System Check</h1>
          <p className="text-neutral-400 text-sm sm:text-base max-w-md mx-auto">
            Testing your camera, microphone, and AI systems to ensure a smooth interview experience
          </p>
        </div>

        <div className="grid sm:grid-cols-[1fr_280px] gap-6">
          {/* Checks list */}
          <div className="space-y-2.5">
            {checks.map((check) => (
              <div
                key={check.key}
                className={`flex items-center gap-3 p-3.5 rounded-xl border transition-all duration-300 ${getStatusBg(check.status)}`}
              >
                <div className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0">
                  <check.icon className="w-4 h-4 text-neutral-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm">{check.label}</span>
                  <p className="text-xs text-neutral-500 mt-0.5 truncate">
                    {check.status === 'pending' ? check.description : check.detail || check.description}
                  </p>
                  {check.key === 'microphone' && check.status === 'checking' && (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-100"
                          style={{ width: `${Math.min(micLevel * 500, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-neutral-500 w-8 text-right">{(micLevel * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">{getStatusIcon(check.status)}</div>
              </div>
            ))}
          </div>

          {/* Camera preview + summary */}
          <div className="space-y-4">
            <div className="relative aspect-[4/3] bg-[#12121a] rounded-xl overflow-hidden border border-white/5">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              {checks.find(c => c.key === 'camera')?.status !== 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-[#12121a]">
                  <div className="text-center">
                    <Video className="w-8 h-8 text-neutral-600 mx-auto mb-2" />
                    <p className="text-neutral-500 text-xs">Camera preview</p>
                  </div>
                </div>
              )}
              <div className="absolute top-2 left-2 px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-[10px] text-white/80">Preview</div>
            </div>

            {allDone && (
              <div className={`p-4 rounded-xl border ${errorCount === 0 ? 'bg-emerald-500/5 border-emerald-500/20' : errorCount <= 1 ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                <div className="flex items-center gap-2 mb-2">
                  {errorCount === 0 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertTriangle className="w-4 h-4 text-amber-400" />}
                  <span className="font-medium text-sm">{errorCount === 0 ? 'All Systems Ready' : `${errorCount} issue${errorCount > 1 ? 's' : ''} found`}</span>
                </div>
                <p className="text-xs text-neutral-400">
                  {passedCount} passed{warningCount > 0 ? `, ${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}{errorCount > 0 ? `, ${errorCount} failed` : ''}
                </p>
              </div>
            )}

            {isRunning && (
              <div className="flex items-center gap-2 text-violet-300 text-xs">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Testing {currentCheck}...</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-8 sm:mt-10">
          <button
            onClick={() => {
              if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
              navigate(`/interview/waiting-room/${uuid}`);
            }}
            disabled={!canProceed}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-violet-600 to-blue-600 hover:from-violet-500 hover:to-blue-500 disabled:from-neutral-700 disabled:to-neutral-700 disabled:text-neutral-500 text-white rounded-xl text-sm font-semibold transition-all shadow-lg shadow-violet-600/20 disabled:shadow-none"
          >
            {canProceed ? (
              <><span>Continue to Waiting Room</span><ArrowRight className="w-4 h-4" /></>
            ) : allDone ? (
              'Fix issues to continue'
            ) : (
              <><Loader2 className="w-4 h-4 animate-spin" /><span>Running checks...</span></>
            )}
          </button>

          <button
            onClick={() => {
              if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
              if (videoRef.current) videoRef.current.srcObject = null;
              runAllChecks();
            }}
            disabled={isRunning}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-white/5 hover:bg-white/10 disabled:opacity-50 text-neutral-300 rounded-xl text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            Run Again
          </button>

         
        </div>

        {/* Tips */}
        <div className="mt-8 p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <p className="text-xs text-neutral-500 font-medium mb-2">Tips for best experience:</p>
          <ul className="text-xs text-neutral-600 space-y-1">
            <li>• Use headphones to prevent AI voice from triggering your microphone</li>
            <li>• Ensure good lighting for face detection accuracy</li>
            <li>• Use Chrome or Edge for best compatibility</li>
            <li>• Close other tabs using your camera or microphone</li>
            <li>• Find a quiet environment with stable internet</li>
          </ul>
        </div>
      </div>
    </div>
  );
};