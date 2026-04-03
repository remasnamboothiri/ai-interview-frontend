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
    { key: 'browser', label: 'Browser', description: 'WebRTC, AudioContext, WASM', icon: Monitor, status: 'pending', detail: '' },
    { key: 'internet', label: 'Internet', description: 'Backend API reachable', icon: Wifi, status: 'pending', detail: '' },
    { key: 'camera', label: 'Camera', description: 'Video stream active', icon: Video, status: 'pending', detail: '' },
    { key: 'microphone', label: 'Microphone', description: 'Audio input detected', icon: Mic, status: 'pending', detail: '' },
    { key: 'tts', label: 'AI Voice (TTS)', description: 'Text-to-speech works', icon: Volume2, status: 'pending', detail: '' },
    { key: 'stt', label: 'Speech Recognition', description: 'Deepgram connection', icon: AudioLines, status: 'pending', detail: '' },
    { key: 'vad', label: 'Voice Detection', description: 'Silero neural network', icon: Brain, status: 'pending', detail: '' },
  ]);

  const updateCheck = useCallback((key: string, status: CheckStatus, detail: string) => {
    setChecks(prev => prev.map(c => c.key === key ? { ...c, status, detail } : c));
  }, []);

  useEffect(() => {
    if (!uuid) return;
    const checkStatus = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        const resp = await fetch(`${baseUrl}/api/interviews/by-uuid/${uuid}/`);
        if (resp.ok) {
          const data = await resp.json();
          if (data.status === 'completed') { navigate('/interview/already-completed', { replace: true }); return; }
        }
      } catch (e) {}
      setStatusChecked(true);
    };
    checkStatus();
  }, [uuid, navigate]);

  useEffect(() => { if (statusChecked && !isRunning) runAllChecks(); }, [statusChecked]);

  useEffect(() => {
    return () => {
      if (micIntervalRef.current) clearInterval(micIntervalRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };
  }, []);

  const runAllChecks = async () => {
    setIsRunning(true);
    setChecks(prev => prev.map(c => ({ ...c, status: 'pending', detail: '' })));
    await checkBrowser(); await checkInternet(); await checkCamera();
    await checkMicrophone(); await checkTTS(); await checkSTT(); await checkVAD();
    setCurrentCheck(''); setIsRunning(false);
  };

  const checkBrowser = async () => {
    setCurrentCheck('browser'); updateCheck('browser', 'checking', 'Checking...'); await sleep(400);
    const issues: string[] = [];
    if (!navigator.mediaDevices?.getUserMedia) issues.push('No getUserMedia');
    if (!window.AudioContext && !(window as any).webkitAudioContext) issues.push('No AudioContext');
    if (!window.MediaRecorder) issues.push('No MediaRecorder');
    if (typeof WebAssembly === 'undefined') issues.push('No WebAssembly');
    if (!window.WebSocket) issues.push('No WebSocket');
    if (issues.length === 0) updateCheck('browser', 'success', 'All features supported');
    else if (issues.length <= 1) updateCheck('browser', 'warning', `Missing: ${issues.join(', ')}`);
    else updateCheck('browser', 'error', `Missing: ${issues.join(', ')}`);
  };

  const checkInternet = async () => {
    setCurrentCheck('internet'); updateCheck('internet', 'checking', 'Connecting...');
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const start = Date.now();
      const resp = await fetch(`${baseUrl}/api/interviews/by-uuid/${uuid}/`);
      const latency = Date.now() - start;
      if (resp.ok || resp.status === 404) {
        if (latency < 500) updateCheck('internet', 'success', `${latency}ms latency`);
        else if (latency < 2000) updateCheck('internet', 'warning', `Slow (${latency}ms)`);
        else updateCheck('internet', 'warning', `Very slow (${latency}ms)`);
      } else updateCheck('internet', 'error', `Server error: ${resp.status}`);
    } catch { updateCheck('internet', 'error', 'Cannot reach server'); }
  };

  const checkCamera = async () => {
    setCurrentCheck('camera'); updateCheck('camera', 'checking', 'Requesting access...');
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: { ideal: 1280 }, height: { ideal: 720 } } });
      if (videoRef.current) videoRef.current.srcObject = stream;
      const vt = stream.getVideoTracks()[0]; const s = vt.getSettings();
      streamRef.current = stream;
      updateCheck('camera', 'success', `${s.width || '?'}x${s.height || '?'}`);
    } catch (e: any) {
      if (e.name === 'NotAllowedError') updateCheck('camera', 'error', 'Permission denied');
      else if (e.name === 'NotFoundError') updateCheck('camera', 'error', 'No camera found');
      else updateCheck('camera', 'error', e.message);
    }
  };

  const checkMicrophone = async () => {
  setCurrentCheck('microphone'); updateCheck('microphone', 'checking', 'Speak now to test...');
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } 
    });
      const audioTrack = stream.getAudioTracks()[0];
      updateCheck('microphone', 'checking', `${audioTrack.label} — speak now...`);
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx(); const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser(); analyser.fftSize = 512; source.connect(analyser);
      let maxVol = 0, frames = 0; const dataArray = new Uint8Array(analyser.fftSize);
      await new Promise<void>((resolve) => {
        micIntervalRef.current = setInterval(() => {
          analyser.getByteTimeDomainData(dataArray);
          let sum = 0;
          for (let i = 0; i < dataArray.length; i++) { const val = (dataArray[i] - 128) / 128; sum += val * val; }
          const vol = Math.sqrt(sum / dataArray.length);
          if (vol > maxVol) maxVol = vol; setMicLevel(vol); frames++;
          if (frames >= 80) { clearInterval(micIntervalRef.current!); micIntervalRef.current = null; resolve(); }
        }, 50);
      });
      source.disconnect(); try { ctx.close(); } catch {} stream.getTracks().forEach(t => t.stop()); setMicLevel(0);
      if (maxVol >= 0.01) updateCheck('microphone', 'success', `Audio detected (peak: ${(maxVol * 100).toFixed(0)}%)`);
      else updateCheck('microphone', 'warning', 'No audio detected — mic muted?');
    } catch (e: any) {
      if (e.name === 'NotAllowedError') updateCheck('microphone', 'error', 'Permission denied');
      else if (e.name === 'NotFoundError') updateCheck('microphone', 'error', 'No microphone found');
      else updateCheck('microphone', 'error', e.message);
    }
  };

  const checkTTS = async () => {
    setCurrentCheck('tts'); updateCheck('tts', 'checking', 'Testing AI voice...');
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const token = localStorage.getItem('access_token') || localStorage.getItem('token') || '';
      const start = Date.now();
      const resp = await fetch(`${baseUrl}/api/speech/tts/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ text: 'System check complete. Audio is working.' }),
      });
      const latency = Date.now() - start;
      if (!resp.ok) { updateCheck('tts', 'error', `Server error: ${resp.status}`); return; }
      const blob = await resp.blob();
      if (blob.size < 100) { updateCheck('tts', 'error', 'Empty audio'); return; }
      const url = URL.createObjectURL(blob); const audio = new Audio(url);
      let played = false;
await new Promise<void>((resolve) => {
  audio.onended = () => { played = true; URL.revokeObjectURL(url); resolve(); };
  audio.onerror = () => { URL.revokeObjectURL(url); resolve(); };
  audio.play().catch(() => resolve());
  setTimeout(resolve, 8000);
});
if (played || blob.size > 1000) {
  updateCheck('tts', 'success', `Working (${latency}ms)`);
} else {
  updateCheck('tts', 'warning', `Audio generated but may not have played`);
}
    } catch (e: any) { updateCheck('tts', 'error', e.message); }
  };

  const checkSTT = async () => {
    setCurrentCheck('stt'); updateCheck('stt', 'checking', 'Connecting to Deepgram...');
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const tokenResp = await fetch(`${baseUrl}/api/speech/stt-token/`);
      if (!tokenResp.ok) { updateCheck('stt', 'error', `Token failed: ${tokenResp.status}`); return; }
      const { key } = await tokenResp.json();
      if (!key) { updateCheck('stt', 'error', 'No API key configured'); return; }
      const ws = new WebSocket(`wss://api.deepgram.com/v1/listen?model=nova-3&language=en`, ['token', key]);
      await new Promise<void>((resolve) => {
        const timeout = setTimeout(() => { ws.close(); updateCheck('stt', 'error', 'Connection timeout'); resolve(); }, 10000);
        ws.onopen = () => { clearTimeout(timeout); ws.close(); updateCheck('stt', 'success', 'Deepgram connected'); resolve(); };
        ws.onerror = () => { clearTimeout(timeout); updateCheck('stt', 'error', 'Connection failed — use Chrome or Edge'); resolve(); };
      });
    } catch (e: any) { updateCheck('stt', 'error', e.message); }
  };

  const checkVAD = async () => {
    setCurrentCheck('vad'); updateCheck('vad', 'checking', 'Loading neural network...');
    try {
      if (!(window as any).ort) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/ort.wasm.min.js';
          s.onload = () => resolve(); s.onerror = () => reject(new Error('ONNX failed')); document.head.appendChild(s);
        });
      }
      if (!(window as any).__vadLoaded) {
        await new Promise<void>((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/bundle.min.js';
          s.onload = () => { (window as any).__vadLoaded = true; resolve(); };
          s.onerror = () => reject(new Error('VAD library failed')); document.head.appendChild(s);
        });
      }
      const MicVAD = (window as any).vad?.MicVAD;
      if (!MicVAD) { updateCheck('vad', 'warning', 'Will use fallback interrupt'); return; }
      updateCheck('vad', 'checking', 'Initializing model...');
      const testVad = await MicVAD.new({
        onnxWASMBasePath: 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/',
        baseAssetPath: 'https://cdn.jsdelivr.net/npm/@ricky0123/vad-web@0.0.29/dist/',
        positiveSpeechThreshold: 0.75, onSpeechStart: () => {}, onSpeechEnd: () => {},
      });
      try { testVad.destroy(); } catch {}
      updateCheck('vad', 'success', 'Silero VAD loaded');
    } catch (e: any) { updateCheck('vad', 'warning', `${e.message} — will use fallback`); }
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
      case 'pending': return <div className="w-4 h-4 rounded-full border-2 border-neutral-300" />;
      case 'checking': return <Loader2 className="w-4 h-4 text-primary-600 animate-spin" />;
      case 'success': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'error': return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusBg = (status: CheckStatus) => {
    switch (status) {
      case 'success': return 'bg-green-50 border-green-200';
      case 'warning': return 'bg-amber-50 border-amber-200';
      case 'error': return 'bg-red-50 border-red-200';
      case 'checking': return 'bg-primary-50 border-primary-200';
      default: return 'bg-white border-neutral-200';
    }
  };

  if (!statusChecked) {
    return (
      <div className="h-screen bg-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-white flex flex-col overflow-hidden">
      {/* Header - compact */}
      <div className="text-center pt-5 pb-2 px-4 flex-shrink-0">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-primary-50 border border-primary-200 rounded-full text-primary-700 text-xs font-medium mb-2">
          <Monitor className="w-3 h-3" />
          Pre-Interview Check
        </div>
        <h1 className="text-xl sm:text-2xl font-bold text-secondary">System Check</h1>
        <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">Testing your devices and AI systems before the interview</p>
      </div>

      {/* Main content - fills remaining space */}
      <div className="flex-1 max-w-5xl w-full mx-auto px-4 pb-4 flex flex-col min-h-0">
        <div className="flex-1 grid sm:grid-cols-[1fr_220px] gap-4 min-h-0">
          {/* Left: Checks list */}
          <div className="space-y-1.5 overflow-y-auto">
            {checks.map((check) => (
              <div key={check.key} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border transition-all duration-300 ${getStatusBg(check.status)}`}>
                <div className="w-7 h-7 rounded-md bg-white border border-neutral-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                  <check.icon className="w-3.5 h-3.5 text-neutral-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-xs text-secondary">{check.label}</span>
                  <p className="text-[10px] text-neutral-500 truncate leading-tight">
                    {check.status === 'pending' ? check.description : check.detail || check.description}
                  </p>
                  {check.key === 'microphone' && check.status === 'checking' && (
                    <div className="mt-1 flex items-center gap-1.5">
                      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-100" style={{ width: `${Math.min(micLevel * 500, 100)}%` }} />
                      </div>
                      <span className="text-[9px] text-neutral-400 w-6 text-right">{(micLevel * 100).toFixed(0)}%</span>
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0">{getStatusIcon(check.status)}</div>
              </div>
            ))}
          </div>

          {/* Right: Camera + Summary + Tips */}
          <div className="flex flex-col gap-3 min-h-0">
            {/* Camera preview */}
            <div className="relative aspect-[4/3] bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 flex-shrink-0">
              <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover" style={{ transform: 'scaleX(-1)' }} />
              {checks.find(c => c.key === 'camera')?.status !== 'success' && (
                <div className="absolute inset-0 flex items-center justify-center bg-neutral-100">
                  <div className="text-center">
                    <Video className="w-6 h-6 text-neutral-400 mx-auto mb-1" />
                    <p className="text-neutral-400 text-[10px]">Camera preview</p>
                  </div>
                </div>
              )}
              <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 bg-black/40 backdrop-blur-sm rounded text-[9px] text-white/80">Preview</div>
            </div>

            {/* Summary */}
            {allDone && (
              <div className={`p-2.5 rounded-lg border ${errorCount === 0 ? 'bg-green-50 border-green-200' : errorCount <= 1 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex items-center gap-1.5 mb-0.5">
                  {errorCount === 0 ? <CheckCircle className="w-3.5 h-3.5 text-green-600" /> : <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                  <span className="font-semibold text-xs text-secondary">{errorCount === 0 ? 'All Systems Ready' : `${errorCount} issue${errorCount > 1 ? 's' : ''}`}</span>
                </div>
                <p className="text-[10px] text-neutral-500">
                  {passedCount} passed{warningCount > 0 ? `, ${warningCount} warning${warningCount > 1 ? 's' : ''}` : ''}{errorCount > 0 ? `, ${errorCount} failed` : ''}
                </p>
              </div>
            )}

            {isRunning && (
              <div className="flex items-center gap-1.5 text-primary-600 text-[11px]">
                <Loader2 className="w-3 h-3 animate-spin" />
                <span>Testing {currentCheck}...</span>
              </div>
            )}

            {/* Tips */}
            <div className="p-2.5 bg-neutral-50 border border-neutral-200 rounded-lg flex-shrink-0">
              <p className="text-[10px] text-neutral-500 font-medium mb-1">Tips:</p>
              <ul className="text-[10px] text-neutral-400 space-y-0.5 leading-tight">
                <li>• Use headphones for best experience</li>
                <li>• Ensure good lighting</li>
                <li>• Use Chrome or Edge</li>
                <li>• Quiet environment recommended</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom buttons */}
        <div className="flex items-center gap-3 pt-3 flex-shrink-0 border-t border-neutral-100 mt-2">
          <button
            onClick={() => {
              if (streamRef.current) { streamRef.current.getTracks().forEach(t => t.stop()); streamRef.current = null; }
              navigate(`/interview/waiting-room/${uuid}`);
            }}
            disabled={!canProceed}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary-600 hover:bg-primary-700 disabled:bg-neutral-300 disabled:text-neutral-500 text-white rounded-lg text-sm font-semibold transition-colors shadow-sm"
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
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-neutral-50 disabled:opacity-50 text-neutral-600 border border-neutral-200 rounded-lg text-sm font-medium transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRunning ? 'animate-spin' : ''}`} />
            Run Again
          </button>
        </div>
      </div>
    </div>
  );
};