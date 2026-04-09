'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Camera,
  CameraOff,
  Monitor,
  Sparkles,
  Phone,
  ArrowLeft,
  Video,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWebcam } from '@/hooks/use-webcam';
import { useDemoContext } from '@/lib/demo-context';
import { DevIndicator } from '@/components/ui/dev-indicator';
import { mockCases, mockPatients } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

export default function ConsultPage() {
  const params = useParams<{ caseId: string }>();
  const router = useRouter();
  const caseId = params.caseId;

  const { capturedPhotos, saveCapturedPhoto } = useDemoContext();

  // Resolve data
  const caseData = mockCases.find((c) => c.id === caseId);
  const patient = mockPatients.find((p) => p.id === caseData?.patientId);

  // Webcam
  const { videoRef, isReady, error, startCamera, stopCamera, captureFrame } =
    useWebcam();

  // Controls
  const [micOn, setMicOn] = useState(true);
  const [cameraOn, setCameraOn] = useState(true);
  const [aiOverlay, setAiOverlay] = useState(true);
  const [notes, setNotes] = useState('');

  // Capture flash
  const [showFlash, setShowFlash] = useState(false);

  // Notification
  const [notification, setNotification] = useState<string | null>(null);

  // Timer
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Simulated live stats
  const [stats, setStats] = useState({
    landmarks: 478,
    teethVisible: 8,
    shade: 'A2',
    confidence: 94,
  });

  // Start camera + timer on mount
  useEffect(() => {
    startCamera();
    timerRef.current = setInterval(() => {
      setElapsed((s) => s + 1);
    }, 1000);
    return () => {
      stopCamera();
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fluctuate stats
  useEffect(() => {
    if (!aiOverlay) return;
    const interval = setInterval(() => {
      setStats({
        landmarks: 475 + Math.floor(Math.random() * 4),
        teethVisible: 7 + Math.floor(Math.random() * 3),
        shade: 'A2',
        confidence: 91 + Math.floor(Math.random() * 6),
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [aiOverlay]);

  // Format timer
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60)
      .toString()
      .padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // Handle capture
  const handleCapture = useCallback(() => {
    const dataUrl = captureFrame();
    if (dataUrl) {
      saveCapturedPhoto(caseId, {
        id: `ph-consult-${Date.now()}`,
        type: 'frontal-smile',
        imageUrl: dataUrl,
        capturedAt: new Date().toISOString(),
      });
      setShowFlash(true);
      setTimeout(() => setShowFlash(false), 400);
    }
  }, [captureFrame, caseId, saveCapturedPhoto]);

  // Show notification
  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 2500);
  };

  return (
    <div className="min-h-screen bg-brand-black flex flex-col">
      <DevIndicator file="src/app/consult/[caseId]/page.tsx" section="Consultation" />
      {/* ---- Main layout ------------------------------------------------ */}
      <div className="flex flex-1 overflow-hidden">
        {/* ---- Video area (left) --------------------------------------- */}
        <div className="flex-1 relative flex items-center justify-center p-4">
          {/* Main video */}
          <div
            className={cn(
              'relative w-full h-full rounded-[14px] overflow-hidden bg-brand-charcoal transition-all',
              showFlash && 'ring-4 ring-brand-gold',
            )}
          >
            {error ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <CameraOff className="w-12 h-12 text-brand-warm-gray/50 mb-3" />
                <p className="text-brand-mid-gray text-sm">
                  Camera not available
                </p>
                <p className="text-brand-warm-gray text-xs mt-1">{error}</p>
              </div>
            ) : !isReady ? (
              <div className="w-full h-full flex flex-col items-center justify-center">
                <Video className="w-12 h-12 text-brand-warm-gray/40 mb-3 animate-pulse" />
                <p className="text-brand-mid-gray text-sm">
                  Waiting for patient...
                </p>
              </div>
            ) : null}

            <video
              ref={videoRef as React.RefObject<HTMLVideoElement>}
              autoPlay
              playsInline
              muted
              className={cn(
                'w-full h-full object-cover',
                (!isReady || error) && 'hidden',
              )}
              style={{ transform: 'scaleX(-1)' }}
            />

            {/* Patient name overlay */}
            {patient && (
              <div className="absolute top-4 left-4 bg-brand-black/50 backdrop-blur-sm px-3 py-1.5 rounded-full">
                <span className="text-brand-cream text-xs font-sans">
                  {patient.firstName} {patient.lastName}
                </span>
              </div>
            )}
          </div>

          {/* Self-view (bottom-right) */}
          <div className="absolute bottom-8 right-8 w-48 aspect-video rounded-[14px] overflow-hidden border-2 border-brand-warm-gray/30 bg-brand-charcoal shadow-xl">
            {isReady && !error ? (
              <video
                ref={(el) => {
                  // Mirror the same stream to self-view
                  if (el && videoRef.current?.srcObject) {
                    el.srcObject = videoRef.current.srcObject;
                  }
                }}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
                style={{ transform: 'scaleX(-1)' }}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-brand-mid-gray text-[10px]">You</span>
              </div>
            )}
            <div className="absolute bottom-1 left-2">
              <span className="text-white text-[9px] bg-brand-black/50 px-1.5 py-0.5 rounded font-sans">
                Dr. Saleh
              </span>
            </div>
          </div>

          {/* Notification toast */}
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="absolute top-6 left-1/2 -translate-x-1/2 bg-brand-charcoal border border-brand-gold/30 text-brand-cream text-sm px-4 py-2 rounded-full shadow-lg"
            >
              {notification}
            </motion.div>
          )}
        </div>

        {/* ---- Right sidebar ------------------------------------------- */}
        <div className="w-80 bg-brand-charcoal border-l border-brand-warm-gray/20 flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-brand-warm-gray/20">
            <h2 className="font-serif text-brand-gold text-sm uppercase tracking-wider">
              AI Overlay
            </h2>
            <div className="flex items-center gap-2 mt-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400" />
              </span>
              <span className="text-emerald-400 text-xs font-sans">
                Live Analysis
              </span>
            </div>
          </div>

          {/* Stats */}
          <div className="p-5 space-y-4 flex-1 overflow-y-auto">
            {[
              { label: 'Landmarks Detected', value: `${stats.landmarks}` },
              { label: 'Teeth Visible', value: `${stats.teethVisible}` },
              { label: 'Current Shade', value: stats.shade },
              { label: 'Smile Confidence', value: `${stats.confidence}%` },
            ].map((stat) => (
              <div
                key={stat.label}
                className="flex items-center justify-between py-2 border-b border-brand-warm-gray/10"
              >
                <span className="text-brand-mid-gray text-sm">
                  {stat.label}
                </span>
                <span className="text-brand-cream font-mono text-sm">
                  {stat.value}
                </span>
              </div>
            ))}

            {/* Action buttons */}
            <div className="space-y-2 pt-2">
              <Button className="w-full" onClick={handleCapture}>
                Capture Frame
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => showNotification('Analysis queued')}
              >
                Run Analysis
              </Button>
            </div>

            {/* Notes textarea */}
            <div className="pt-4">
              <label className="text-brand-mid-gray text-[10px] uppercase tracking-widest block mb-2">
                Session Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes during consultation..."
                rows={6}
                className="w-full bg-brand-warm-gray border border-brand-warm-gray text-brand-cream text-sm rounded-[10px] p-3 placeholder:text-brand-mid-gray/60 resize-none focus:outline-none focus:ring-1 focus:ring-brand-gold"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ---- Bottom control bar ----------------------------------------- */}
      <div className="h-16 bg-brand-charcoal/80 backdrop-blur-sm border-t border-brand-warm-gray/20 flex items-center justify-center px-6 shrink-0">
        <div className="flex items-center gap-4">
          {/* Mic toggle */}
          <button
            onClick={() => setMicOn((v) => !v)}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center transition-colors',
              micOn
                ? 'bg-brand-warm-gray text-brand-cream'
                : 'bg-red-500 text-white',
            )}
          >
            {micOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
          </button>

          {/* Camera toggle */}
          <button
            onClick={() => setCameraOn((v) => !v)}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center transition-colors',
              cameraOn
                ? 'bg-brand-warm-gray text-brand-cream'
                : 'bg-red-500 text-white',
            )}
          >
            {cameraOn ? (
              <Camera className="w-5 h-5" />
            ) : (
              <CameraOff className="w-5 h-5" />
            )}
          </button>

          {/* Screen share */}
          <button className="w-11 h-11 rounded-full bg-brand-warm-gray text-brand-cream flex items-center justify-center hover:bg-brand-mid-gray transition-colors">
            <Monitor className="w-5 h-5" />
          </button>

          {/* AI Overlay toggle */}
          <button
            onClick={() => setAiOverlay((v) => !v)}
            className={cn(
              'w-11 h-11 rounded-full flex items-center justify-center transition-colors',
              aiOverlay
                ? 'bg-brand-gold text-brand-black'
                : 'bg-brand-warm-gray text-brand-cream',
            )}
          >
            <Sparkles className="w-5 h-5" />
          </button>

          {/* Spacer */}
          <div className="w-px h-7 bg-brand-warm-gray/30 mx-2" />

          {/* End call */}
          <button
            onClick={() => router.push('/dashboard')}
            className="w-11 h-11 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <Phone className="w-5 h-5 rotate-[135deg]" />
          </button>
        </div>

        {/* Timer */}
        <div className="absolute right-6 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-brand-cream font-mono text-sm">
            {formatTime(elapsed)}
          </span>
        </div>
      </div>
    </div>
  );
}
