'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Check, ChevronRight, Loader2, Sparkles, Upload, ImageIcon } from 'lucide-react';
import { useWebcam } from '@/hooks/use-webcam';
import { useFaceAnalysis } from '@/hooks/use-face-analysis';
import { useDemoContext } from '@/lib/demo-context';
import { cn, generateId } from '@/lib/utils';
import type { CapturePhotoType } from '@/lib/types';

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

const STEP_TYPES: CapturePhotoType[] = [
  'frontal-smile',
  'frontal-rest',
  'left-profile',
  'right-profile',
  'retracted',
];

const STEP_LABELS = [
  'Frontal \u2014 Smile',
  'Frontal \u2014 At Rest',
  'Left Profile',
  'Right Profile',
  'Retracted View',
];

const STEP_INSTRUCTIONS = [
  'Smile naturally and look directly at the camera',
  'Relax your face, lips together, look at camera',
  'Turn your head to show your left profile',
  'Turn your head to show your right profile',
  'Pull lips back to fully expose teeth',
];

type Mode = 'capture' | 'analyzing' | 'complete';
type InputMode = 'camera' | 'upload';

// ---------------------------------------------------------------------------
// SVG Overlay Guides
// ---------------------------------------------------------------------------

function FaceGuideOverlay({ stepIndex }: { stepIndex: number }) {
  const isProfile = stepIndex === 2 || stepIndex === 3;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 640 360"
      preserveAspectRatio="xMidYMid slice"
    >
      {/* Crosshair lines */}
      <line
        x1="320" y1="140" x2="320" y2="220"
        stroke="white" strokeWidth="0.5" opacity="0.2"
      />
      <line
        x1="280" y1="180" x2="360" y2="180"
        stroke="white" strokeWidth="0.5" opacity="0.2"
      />

      {/* Corner brackets — gold L-shapes */}
      {/* Top-left */}
      <path d="M 60,40 L 60,70" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M 60,40 L 90,40" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />
      {/* Top-right */}
      <path d="M 580,40 L 580,70" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M 580,40 L 550,40" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />
      {/* Bottom-left */}
      <path d="M 60,320 L 60,290" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M 60,320 L 90,320" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />
      {/* Bottom-right */}
      <path d="M 580,320 L 580,290" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />
      <path d="M 580,320 L 550,320" stroke="#C4A265" strokeWidth="2" fill="none" opacity="0.7" />

      {isProfile ? (
        /* Profile silhouette guide — curved line */
        <path
          d={
            stepIndex === 2
              ? 'M 360,80 C 340,100 320,130 310,160 C 300,190 310,220 320,240 C 330,260 340,270 350,290'
              : 'M 280,80 C 300,100 320,130 330,160 C 340,190 330,220 320,240 C 310,260 300,270 290,290'
          }
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="6 4"
          fill="none"
          opacity="0.3"
        />
      ) : (
        /* Oval face guide */
        <ellipse
          cx="320"
          cy="175"
          rx="100"
          ry="130"
          stroke="white"
          strokeWidth="1.5"
          strokeDasharray="8 4"
          fill="none"
          opacity="0.25"
        />
      )}
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Scan Line Animation (used in analyzing mode)
// ---------------------------------------------------------------------------

function ScanLineAnimation() {
  return (
    <motion.div
      className="absolute left-0 right-0 h-[2px] bg-brand-gold z-10"
      initial={{ top: '0%' }}
      animate={{ top: ['0%', '100%', '0%'] }}
      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
    >
      {/* Glow trail below the scan line */}
      <div className="absolute left-0 right-0 top-0 h-16 bg-gradient-to-b from-brand-gold/20 to-transparent" />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Flash Animation (on capture)
// ---------------------------------------------------------------------------

function CaptureFlash({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 bg-white z-30 rounded-[14px]"
      initial={{ opacity: 0.9 }}
      animate={{ opacity: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      onAnimationComplete={onComplete}
    />
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function CaptureWizardPage() {
  const params = useParams();
  const router = useRouter();
  const caseId = params.caseId as string;

  const { videoRef, isReady, error, startCamera, stopCamera, captureFrame } =
    useWebcam();
  const {
    isAnalyzing,
    progress,
    stepLabel,
    totalSteps: analysisTotalSteps,
    currentStep: analysisCurrentStep,
    result: analysisResult,
    runAnalysis,
  } = useFaceAnalysis();
  const { saveCapturedPhoto, saveAnalysisResult } = useDemoContext();

  const [mode, setMode] = useState<Mode>('capture');
  const [inputMode, setInputMode] = useState<InputMode>('upload');
  const [currentStep, setCurrentStep] = useState(0);
  const [capturedImages, setCapturedImages] = useState<(string | null)[]>([
    null,
    null,
    null,
    null,
    null,
  ]);
  const [showFlash, setShowFlash] = useState(false);
  const isCapturing = useRef(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ---- Camera lifecycle ---------------------------------------------------

  useEffect(() => {
    if (inputMode === 'camera') {
      startCamera();
    }
    return () => {
      stopCamera();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputMode]);

  // ---- Switch input mode --------------------------------------------------

  const switchInputMode = useCallback((newMode: InputMode) => {
    if (newMode === 'upload') {
      stopCamera();
    }
    setInputMode(newMode);
  }, [stopCamera]);

  // ---- Upload handler -----------------------------------------------------

  const handleUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      if (!dataUrl) return;

      // Save to context
      saveCapturedPhoto(caseId, {
        id: generateId('photo'),
        type: STEP_TYPES[currentStep],
        imageUrl: dataUrl,
        capturedAt: new Date().toISOString(),
      });

      // Store locally for thumbnails
      setCapturedImages((prev) => {
        const next = [...prev];
        next[currentStep] = dataUrl;
        return next;
      });

      // Flash then advance
      setShowFlash(true);
    };
    reader.readAsDataURL(file);

    // Reset file input so same file can be re-selected
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [saveCapturedPhoto, caseId, currentStep]);

  // ---- Capture handler ----------------------------------------------------

  const handleCapture = useCallback(() => {
    if (isCapturing.current || !isReady) return;
    isCapturing.current = true;

    const dataUrl = captureFrame();
    if (!dataUrl) {
      isCapturing.current = false;
      return;
    }

    // Save to context
    saveCapturedPhoto(caseId, {
      id: generateId('photo'),
      type: STEP_TYPES[currentStep],
      imageUrl: dataUrl,
      capturedAt: new Date().toISOString(),
    });

    // Store locally for thumbnails
    setCapturedImages((prev) => {
      const next = [...prev];
      next[currentStep] = dataUrl;
      return next;
    });

    // Flash
    setShowFlash(true);
  }, [isReady, captureFrame, saveCapturedPhoto, caseId, currentStep]);

  const handleFlashComplete = useCallback(() => {
    setShowFlash(false);
    isCapturing.current = false;

    if (currentStep < STEP_TYPES.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      // All photos captured — begin analysis
      stopCamera();
      setMode('analyzing');
    }
  }, [currentStep, stopCamera]);

  // ---- Analysis trigger ---------------------------------------------------

  useEffect(() => {
    if (mode !== 'analyzing') return;

    // Use the first frontal smile image for AI analysis
    const imageForAnalysis = capturedImages[0] ?? capturedImages.find((img) => img !== null);
    if (!imageForAnalysis) return;

    runAnalysis(imageForAnalysis).then((result) => {
      saveAnalysisResult(caseId, result);
      setMode('complete');
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode]);

  // ---- Auto-navigate on complete ------------------------------------------

  useEffect(() => {
    if (mode !== 'complete') return;
    const timer = setTimeout(() => {
      router.push(`/workspace/${caseId}`);
    }, 2000);
    return () => clearTimeout(timer);
  }, [mode, caseId, router]);

  // ---- First captured image (for analysis screen) -------------------------

  const firstCapturedImage = capturedImages.find((img) => img !== null) ?? null;

  // ========================================================================
  // RENDER
  // ========================================================================

  return (
    <div className="bg-brand-black min-h-screen flex flex-col text-white select-none">
      <AnimatePresence mode="wait">
        {/* ============================================================== */}
        {/* CAPTURE MODE                                                    */}
        {/* ============================================================== */}
        {mode === 'capture' && (
          <motion.div
            key="capture"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col flex-1"
          >
            {/* ---- Top bar ------------------------------------------------- */}
            <header className="flex items-center justify-between px-6 py-5">
              <h1 className="font-serif text-brand-gold text-sm uppercase tracking-widest">
                Capture Wizard
              </h1>
              <div className="flex items-center gap-3">
                <span className="text-brand-mid-gray text-sm">
                  Step {currentStep + 1} of 5
                </span>
                <div className="flex items-center gap-1.5">
                  {STEP_TYPES.map((_, idx) => (
                    <div
                      key={idx}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors duration-300',
                        idx < currentStep
                          ? 'bg-brand-gold'
                          : idx === currentStep
                            ? 'bg-brand-gold-light'
                            : 'bg-brand-warm-gray',
                      )}
                    />
                  ))}
                </div>
              </div>
            </header>

            {/* ---- Main content ------------------------------------------- */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 pb-6">
              {/* ---- Input mode toggle ----------------------------------- */}
              <div className="mb-6 flex items-center gap-1 p-1 rounded-full bg-brand-warm-gray/40">
                <button
                  onClick={() => switchInputMode('upload')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    inputMode === 'upload'
                      ? 'bg-brand-gold text-brand-black'
                      : 'text-brand-mid-gray hover:text-white',
                  )}
                >
                  <Upload className="w-4 h-4" />
                  Upload
                </button>
                <button
                  onClick={() => switchInputMode('camera')}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-all duration-200',
                    inputMode === 'camera'
                      ? 'bg-brand-gold text-brand-black'
                      : 'text-brand-mid-gray hover:text-white',
                  )}
                >
                  <Camera className="w-4 h-4" />
                  Camera
                </button>
              </div>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
              />

              {/* ========== UPLOAD MODE ========== */}
              {inputMode === 'upload' && (
                <>
                  <div
                    className="relative max-w-2xl w-full mx-auto aspect-video rounded-[14px] overflow-hidden bg-brand-charcoal border-2 border-dashed border-brand-warm-gray/60 hover:border-brand-gold/50 transition-colors cursor-pointer group"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files[0];
                      if (file && file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          const dataUrl = event.target?.result as string;
                          if (!dataUrl) return;
                          saveCapturedPhoto(caseId, {
                            id: generateId('photo'),
                            type: STEP_TYPES[currentStep],
                            imageUrl: dataUrl,
                            capturedAt: new Date().toISOString(),
                          });
                          setCapturedImages((prev) => {
                            const next = [...prev];
                            next[currentStep] = dataUrl;
                            return next;
                          });
                          setShowFlash(true);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  >
                    {/* Preview of current step's uploaded image */}
                    {capturedImages[currentStep] ? (
                      <>
                        <img
                          src={capturedImages[currentStep]!}
                          alt={STEP_LABELS[currentStep]}
                          className="absolute inset-0 w-full h-full object-contain bg-brand-black"
                        />
                        <div className="absolute inset-0 bg-brand-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-center space-y-2">
                            <Upload className="w-8 h-8 text-brand-gold mx-auto" />
                            <p className="text-white text-sm font-medium">Replace photo</p>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-brand-warm-gray/30 flex items-center justify-center group-hover:bg-brand-gold/10 transition-colors">
                          <ImageIcon className="w-10 h-10 text-brand-mid-gray group-hover:text-brand-gold transition-colors" />
                        </div>
                        <div className="text-center">
                          <p className="text-white font-medium">
                            Click to upload or drag & drop
                          </p>
                          <p className="text-brand-mid-gray text-sm mt-1">
                            JPG, PNG, HEIC up to 20MB
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Face guide overlay (shown when no image) */}
                    {!capturedImages[currentStep] && (
                      <FaceGuideOverlay stepIndex={currentStep} />
                    )}

                    {/* Capture flash */}
                    {showFlash && (
                      <CaptureFlash onComplete={handleFlashComplete} />
                    )}
                  </div>

                  {/* ---- Step info & upload button ----------------------- */}
                  <div className="mt-6 flex flex-col items-center gap-3">
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                        className="text-center"
                      >
                        <h2 className="text-xl font-serif text-white">
                          {STEP_LABELS[currentStep]}
                        </h2>
                        <p className="text-brand-mid-gray text-sm mt-1">
                          {STEP_INSTRUCTIONS[currentStep]}
                        </p>
                      </motion.div>
                    </AnimatePresence>

                    {/* Upload button */}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'mt-4 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
                        'bg-brand-gold hover:bg-brand-gold-light hover:scale-105 active:scale-95',
                        'ring-4 ring-brand-gold/20',
                      )}
                      aria-label="Upload photo"
                    >
                      <Upload className="w-7 h-7 text-brand-black" />
                    </button>

                    <p className="text-brand-mid-gray/50 text-xs mt-1">
                      {capturedImages[currentStep] ? 'Tap to replace' : 'Tap to upload photo'}
                    </p>
                  </div>
                </>
              )}

              {/* ========== CAMERA MODE ========== */}
              {inputMode === 'camera' && (
                <>
                  {/* Error state */}
                  {error && (
                    <div className="max-w-md text-center space-y-4">
                      <div className="w-20 h-20 rounded-full bg-brand-warm-gray/60 flex items-center justify-center mx-auto">
                        <Camera className="w-8 h-8 text-brand-mid-gray" />
                      </div>
                      <h2 className="font-serif text-brand-gold text-xl">
                        Camera Access Required
                      </h2>
                      <p className="text-brand-mid-gray text-sm leading-relaxed">
                        {error}
                      </p>
                      <p className="text-brand-mid-gray/70 text-xs leading-relaxed">
                        Please allow camera access in your browser settings, then
                        reload this page. On most browsers, click the camera icon in
                        the address bar.
                      </p>
                      <button
                        onClick={() => startCamera()}
                        className="mt-4 px-6 py-2.5 bg-brand-gold text-brand-black rounded-full text-sm font-medium hover:bg-brand-gold-light transition-colors"
                      >
                        Try Again
                      </button>
                    </div>
                  )}

                  {/* Webcam feed */}
                  {!error && (
                    <>
                      <div className="relative max-w-2xl w-full mx-auto aspect-video rounded-[14px] overflow-hidden bg-brand-charcoal">
                        <video
                          ref={videoRef as React.RefObject<HTMLVideoElement>}
                          autoPlay
                          playsInline
                          muted
                          className="absolute inset-0 w-full h-full object-cover"
                          style={{ transform: 'scaleX(-1)' }}
                        />

                        {/* Loading state while camera initializes */}
                        {!isReady && (
                          <div className="absolute inset-0 flex items-center justify-center bg-brand-charcoal z-20">
                            <div className="text-center space-y-3">
                              <Loader2 className="w-8 h-8 text-brand-gold animate-spin mx-auto" />
                              <p className="text-brand-mid-gray text-sm">
                                Initializing camera...
                              </p>
                            </div>
                          </div>
                        )}

                        {/* SVG overlay guides */}
                        <FaceGuideOverlay stepIndex={currentStep} />

                        {/* Bottom gradient overlay */}
                        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-brand-black/80 to-transparent pointer-events-none" />

                        {/* Capture flash */}
                        {showFlash && (
                          <CaptureFlash onComplete={handleFlashComplete} />
                        )}
                      </div>

                      {/* ---- Step info & capture button ----------------------- */}
                      <div className="mt-6 flex flex-col items-center gap-3">
                        <AnimatePresence mode="wait">
                          <motion.div
                            key={currentStep}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -8 }}
                            transition={{ duration: 0.2 }}
                            className="text-center"
                          >
                            <h2 className="text-xl font-serif text-white">
                              {STEP_LABELS[currentStep]}
                            </h2>
                            <p className="text-brand-mid-gray text-sm mt-1">
                              {STEP_INSTRUCTIONS[currentStep]}
                            </p>
                          </motion.div>
                        </AnimatePresence>

                        {/* Large capture button */}
                        <button
                          onClick={handleCapture}
                          disabled={!isReady || isCapturing.current}
                          className={cn(
                            'mt-4 w-16 h-16 rounded-full flex items-center justify-center transition-all duration-200',
                            'bg-brand-gold hover:bg-brand-gold-light hover:scale-105 active:scale-95',
                            'disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100',
                            'ring-4 ring-brand-gold/20',
                          )}
                          aria-label="Capture photo"
                        >
                          <Camera className="w-7 h-7 text-brand-black" />
                        </button>

                        {/* Step hint */}
                        <p className="text-brand-mid-gray/50 text-xs mt-1">
                          Tap to capture
                        </p>
                      </div>
                    </>
                  )}
                </>
              )}

              {/* ---- Thumbnail strip ---------------------------------- */}
              <div className="mt-8 flex items-center gap-3">
                {STEP_TYPES.map((type, idx) => (
                  <button
                    key={type}
                    onClick={() => {
                      if (capturedImages[idx] || idx <= currentStep) {
                        setCurrentStep(idx);
                      }
                    }}
                    className={cn(
                      'relative w-16 h-12 rounded-lg overflow-hidden border-2 transition-all duration-300',
                      idx === currentStep
                        ? 'border-brand-gold'
                        : capturedImages[idx]
                          ? 'border-brand-gold/40 hover:border-brand-gold/70 cursor-pointer'
                          : 'border-brand-warm-gray/50',
                      !capturedImages[idx] && 'bg-brand-warm-gray/30',
                    )}
                  >
                    {capturedImages[idx] ? (
                      <>
                        <img
                          src={capturedImages[idx]!}
                          alt={STEP_LABELS[idx]}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-brand-black/40">
                          <Check className="w-4 h-4 text-brand-gold" />
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-brand-mid-gray/50 text-[10px] font-medium">
                          {idx + 1}
                        </span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* ANALYZING MODE                                                  */}
        {/* ============================================================== */}
        {mode === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            <motion.h2
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="font-serif text-brand-gold text-3xl uppercase tracking-[0.2em] mb-10"
            >
              Analyzing
            </motion.h2>

            {/* Captured photo with scan line */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="relative w-96 max-w-full aspect-video rounded-[14px] overflow-hidden"
            >
              {firstCapturedImage && (
                <img
                  src={firstCapturedImage}
                  alt="Captured photo being analyzed"
                  className="w-full h-full object-cover"
                />
              )}
              <ScanLineAnimation />
              {/* Dark overlay to make scan line stand out */}
              <div className="absolute inset-0 bg-brand-black/30 pointer-events-none" />
            </motion.div>

            {/* Analysis progress info */}
            <div className="mt-8 w-96 max-w-full space-y-4">
              <AnimatePresence mode="wait">
                <motion.p
                  key={stepLabel}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.25 }}
                  className="text-white text-center text-sm"
                >
                  {stepLabel}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="h-1.5 bg-brand-warm-gray rounded-full overflow-hidden">
                <div
                  className="h-full bg-brand-gold rounded-full"
                  style={{
                    width: `${progress}%`,
                    transition: 'width 500ms ease-out',
                  }}
                />
              </div>

              <p className="text-brand-mid-gray text-sm text-center">
                Step {analysisCurrentStep + 1} of {analysisTotalSteps}
              </p>
            </div>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* COMPLETE MODE                                                   */}
        {/* ============================================================== */}
        {mode === 'complete' && (
          <motion.div
            key="complete"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex-1 flex flex-col items-center justify-center px-4"
          >
            {/* Animated check icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15,
                delay: 0.1,
              }}
              className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mb-6"
            >
              <Check className="w-10 h-10 text-emerald-400" />
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="font-serif text-brand-gold text-2xl mb-3"
            >
              Analysis Complete
            </motion.h2>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-brand-mid-gray text-sm"
            >
              {analysisResult
                ? `${analysisResult.facialLandmarks.length} landmarks \u00B7 ${analysisResult.teethRegions.length} teeth detected \u00B7 Shade: ${analysisResult.shadeMatch.overall}`
                : '478 landmarks \u00B7 12 teeth detected \u00B7 Shade: A2'}
            </motion.p>

            {/* Sparkles icon */}
            <motion.div
              initial={{ opacity: 0, rotate: -30 }}
              animate={{ opacity: 1, rotate: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-5"
            >
              <Sparkles className="w-6 h-6 text-brand-gold animate-pulse" />
            </motion.div>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-brand-mid-gray/50 text-xs mt-6"
            >
              Redirecting to workspace...
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
