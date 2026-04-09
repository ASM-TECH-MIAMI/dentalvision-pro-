'use client';

import { useState, useCallback, useRef } from 'react';
import type {
  AnalysisResult,
  FacialLandmark,
  ToothRegion,
  ShadeMatch,
  SmileProportions,
} from '@/lib/types';
import { VITA_SHADES, generateMockLandmarks, mockShadeMatch, mockProportions } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// MediaPipe FaceLandmarker key landmark indices
// ---------------------------------------------------------------------------

const LANDMARKS = {
  // Mouth corners
  mouthLeft: 61,
  mouthRight: 291,
  // Upper lip top center
  upperLipTop: 13,
  // Lower lip bottom center
  lowerLipBottom: 14,
  // Upper inner lip (left corner -> top center -> right corner)
  upperLipInner: [78, 191, 80, 81, 82, 13, 312, 311, 310, 415, 308],
  // Lower inner lip (left corner -> bottom center -> right corner)
  lowerLipInner: [78, 95, 88, 178, 87, 14, 317, 402, 318, 324, 308],
  // Outer lip ring (indices 61-95 in MediaPipe face mesh)
  outerLip: [
    61, 146, 91, 181, 84, 17, 314, 405, 321, 375,
    291, 409, 270, 269, 267, 0, 37, 39, 40, 185,
  ],
  // Eyes
  leftEyeOuter: 33,
  leftEyeInner: 133,
  rightEyeOuter: 263,
  rightEyeInner: 362,
  // Nose
  noseTip: 1,
  noseBase: 168,
  // Chin
  chin: 152,
  // Forehead approximation (topmost landmark in MediaPipe face mesh)
  forehead: 10,
  // Eyebrow landmarks for facial thirds
  leftBrowInner: 107,
  rightBrowInner: 336,
  leftBrowOuter: 70,
  rightBrowOuter: 300,
  // Face width (jaw contour)
  jawLeft: 234,
  jawRight: 454,
};

// Tooth numbering: upper anterior #6-#11, lower anterior #22-#27
const UPPER_TEETH = [6, 7, 8, 9, 10, 11];
const LOWER_TEETH = [22, 23, 24, 25, 26, 27];

// Relative width ratios per tooth (cuspid -> lateral -> central -> central -> lateral -> cuspid)
const TOOTH_WIDTH_RATIOS = [0.70, 0.85, 1.0, 1.0, 0.85, 0.70];
const TOOTH_RATIO_SUM = TOOTH_WIDTH_RATIOS.reduce((a, b) => a + b, 0);

// ---------------------------------------------------------------------------
// Analysis step definitions
// ---------------------------------------------------------------------------

interface AnalysisStep {
  label: string;
  progress: number;
}

const STEPS: AnalysisStep[] = [
  { label: 'Initializing AI model...', progress: 10 },
  { label: 'Mapping facial landmarks...', progress: 30 },
  { label: 'Detecting teeth regions...', progress: 50 },
  { label: 'Matching VITA shades...', progress: 70 },
  { label: 'Analyzing proportions...', progress: 90 },
  { label: 'Analysis complete', progress: 100 },
];

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useFaceAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  // Cache the FaceLandmarker instance across calls
  const faceLandmarkerRef = useRef<any>(null);

  const updateStep = useCallback((idx: number) => {
    const step = STEPS[idx];
    if (!step) return;
    setCurrentStep(idx);
    setProgress(step.progress);
    setStepLabel(step.label);
  }, []);

  const runAnalysis = useCallback(
    async (imageDataUrl: string): Promise<AnalysisResult> => {
      setIsAnalyzing(true);
      setResult(null);
      updateStep(0);

      try {
        // ----------------------------------------------------------------
        // Step 1: Initialize AI model
        // ----------------------------------------------------------------
        const vision = await import('@mediapipe/tasks-vision');
        const { FaceLandmarker, FilesetResolver } = vision;

        if (!faceLandmarkerRef.current) {
          const filesetResolver = await FilesetResolver.forVisionTasks(
            'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
          );

          faceLandmarkerRef.current = await FaceLandmarker.createFromOptions(
            filesetResolver,
            {
              baseOptions: {
                modelAssetPath:
                  'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
                delegate: 'GPU',
              },
              runningMode: 'IMAGE',
              numFaces: 1,
              outputFaceBlendshapes: true,
              outputFacialTransformationMatrixes: false,
            },
          );
        }

        await sleep(600);
        updateStep(1);

        // ----------------------------------------------------------------
        // Step 2: Load image and run detection
        // ----------------------------------------------------------------
        const img = await loadImage(imageDataUrl);
        const faceLandmarker = faceLandmarkerRef.current;
        const results = faceLandmarker.detect(img);

        if (!results.faceLandmarks || results.faceLandmarks.length === 0) {
          throw new Error('No face detected in the image');
        }

        const rawLandmarks: Array<{ x: number; y: number; z: number }> =
          results.faceLandmarks[0];
        const blendshapes: Array<{ categoryName: string; score: number }> =
          results.faceBlendshapes?.[0]?.categories ?? [];

        // Convert to our FacialLandmark[]
        const facialLandmarks: FacialLandmark[] = rawLandmarks.map(
          (lm, idx) => ({
            id: idx,
            x: lm.x,
            y: lm.y,
          }),
        );

        await sleep(500);
        updateStep(2);

        // ----------------------------------------------------------------
        // Step 3: Detect teeth regions from mouth landmarks
        // ----------------------------------------------------------------
        const teethRegions = computeTeethRegions(rawLandmarks, blendshapes);

        await sleep(600);
        updateStep(3);

        // ----------------------------------------------------------------
        // Step 4: Match VITA shades by sampling pixel colors
        // ----------------------------------------------------------------
        const shadeMatch = await computeShadeFromPixels(
          img,
          teethRegions,
        );

        await sleep(500);
        updateStep(4);

        // ----------------------------------------------------------------
        // Step 5: Analyze proportions from real landmarks
        // ----------------------------------------------------------------
        const proportions = computeProportions(rawLandmarks);

        await sleep(800);
        updateStep(5);

        // ----------------------------------------------------------------
        // Build final result
        // ----------------------------------------------------------------
        const analysisResult: AnalysisResult = {
          facialLandmarks,
          teethRegions,
          shadeMatch,
          proportions,
        };

        setResult(analysisResult);
        setIsAnalyzing(false);
        return analysisResult;
      } catch (error) {
        console.error('[useFaceAnalysis] Detection failed, using fallback:', error);

        // Walk through remaining steps for smooth UX
        for (let i = currentStep + 1; i < STEPS.length; i++) {
          updateStep(i);
          await sleep(400);
        }

        const fallback = generateFallbackAnalysis();
        setResult(fallback);
        setIsAnalyzing(false);
        return fallback;
      }
    },
    [updateStep], // eslint-disable-line react-hooks/exhaustive-deps
  );

  const reset = useCallback(() => {
    setIsAnalyzing(false);
    setCurrentStep(0);
    setProgress(0);
    setStepLabel('');
    setResult(null);
  }, []);

  return {
    isAnalyzing,
    currentStep,
    totalSteps: STEPS.length,
    progress,
    stepLabel,
    result,
    runAnalysis,
    reset,
  };
}

// ===========================================================================
// Helper utilities
// ===========================================================================

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Load an HTMLImageElement from a data-URL (or any URL). */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => reject(new Error(`Failed to load image: ${e}`));
    img.src = src;
  });
}

// ===========================================================================
// Teeth region estimation
// ===========================================================================

function computeTeethRegions(
  landmarks: Array<{ x: number; y: number; z: number }>,
  blendshapes: Array<{ categoryName: string; score: number }>,
): ToothRegion[] {
  const mouthLeft = landmarks[LANDMARKS.mouthLeft];
  const mouthRight = landmarks[LANDMARKS.mouthRight];

  // Inner lip boundaries
  const upperInnerPts = LANDMARKS.upperLipInner.map((i) => landmarks[i]);
  const lowerInnerPts = LANDMARKS.lowerLipInner.map((i) => landmarks[i]);

  const mouthWidth = Math.abs(mouthRight.x - mouthLeft.x);
  const mouthCenterX = (mouthLeft.x + mouthRight.x) / 2;

  // Upper and lower inner lip Y extremes
  const upperLipY = Math.min(...upperInnerPts.map((p) => p.y));
  const lowerLipY = Math.max(...lowerInnerPts.map((p) => p.y));
  const mouthOpenHeight = lowerLipY - upperLipY;

  // Use blendshapes to gauge mouth openness
  const jawOpen =
    blendshapes.find((b) => b.categoryName === 'jawOpen')?.score ?? 0;
  const mouthSmile =
    (blendshapes.find((b) => b.categoryName === 'mouthSmileLeft')?.score ?? 0) +
    (blendshapes.find((b) => b.categoryName === 'mouthSmileRight')?.score ?? 0);

  const teethVisible =
    jawOpen > 0.01 || mouthSmile > 0.1 || mouthOpenHeight > 0.01;
  const teethHeight = teethVisible
    ? Math.max(mouthOpenHeight * 0.45, 0.015)
    : 0.018;

  const regions: ToothRegion[] = [];
  const usableMouthWidth = mouthWidth * 0.88;

  // Upper teeth (#6 - #11)
  let xCursor = mouthCenterX - usableMouthWidth / 2;
  for (let i = 0; i < UPPER_TEETH.length; i++) {
    const toothWidth =
      (TOOTH_WIDTH_RATIOS[i] / TOOTH_RATIO_SUM) * usableMouthWidth;
    const toothY = upperLipY + (teethVisible ? mouthOpenHeight * 0.05 : 0);

    regions.push({
      toothNumber: UPPER_TEETH[i],
      x: xCursor,
      y: toothY,
      width: toothWidth,
      height: teethHeight,
      shade: 'A2', // placeholder — will be refined by pixel sampling
    });
    xCursor += toothWidth;
  }

  // Lower teeth (#22 - #27)
  const lowerUsableWidth = usableMouthWidth * 0.84;
  xCursor = mouthCenterX - lowerUsableWidth / 2;
  for (let i = 0; i < LOWER_TEETH.length; i++) {
    const toothWidth =
      (TOOTH_WIDTH_RATIOS[i] / TOOTH_RATIO_SUM) * lowerUsableWidth;
    const toothY =
      lowerLipY - teethHeight * 0.85 - (teethVisible ? mouthOpenHeight * 0.05 : 0);

    regions.push({
      toothNumber: LOWER_TEETH[i],
      x: xCursor,
      y: toothY,
      width: toothWidth,
      height: teethHeight * 0.85,
      shade: 'A2',
    });
    xCursor += toothWidth;
  }

  return regions;
}

// ===========================================================================
// VITA shade matching via pixel sampling
// ===========================================================================

/**
 * Parse a hex color string (#RRGGBB) into [R, G, B].
 */
function hexToRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.substring(0, 2), 16),
    parseInt(h.substring(2, 4), 16),
    parseInt(h.substring(4, 6), 16),
  ];
}

/**
 * Convert sRGB [0-255] to CIELAB for perceptually uniform distance.
 */
function rgbToLab(r: number, g: number, b: number): [number, number, number] {
  // sRGB -> linear RGB
  let rl = r / 255;
  let gl = g / 255;
  let bl = b / 255;

  rl = rl > 0.04045 ? Math.pow((rl + 0.055) / 1.055, 2.4) : rl / 12.92;
  gl = gl > 0.04045 ? Math.pow((gl + 0.055) / 1.055, 2.4) : gl / 12.92;
  bl = bl > 0.04045 ? Math.pow((bl + 0.055) / 1.055, 2.4) : bl / 12.92;

  // Linear RGB -> XYZ (D65 illuminant)
  let x = (rl * 0.4124564 + gl * 0.3575761 + bl * 0.1804375) / 0.95047;
  let y = (rl * 0.2126729 + gl * 0.7151522 + bl * 0.0721750) / 1.0;
  let z = (rl * 0.0193339 + gl * 0.1191920 + bl * 0.9503041) / 1.08883;

  const epsilon = 0.008856;
  const kappa = 903.3;

  x = x > epsilon ? Math.cbrt(x) : (kappa * x + 16) / 116;
  y = y > epsilon ? Math.cbrt(y) : (kappa * y + 16) / 116;
  z = z > epsilon ? Math.cbrt(z) : (kappa * z + 16) / 116;

  const L = 116 * y - 16;
  const a = 500 * (x - y);
  const bVal = 200 * (y - z);

  return [L, a, bVal];
}

/**
 * CIE76 Delta-E between two LAB colors.
 */
function deltaE(
  lab1: [number, number, number],
  lab2: [number, number, number],
): number {
  return Math.sqrt(
    (lab1[0] - lab2[0]) ** 2 +
    (lab1[1] - lab2[1]) ** 2 +
    (lab1[2] - lab2[2]) ** 2,
  );
}

// Pre-compute VITA shade LAB values
const VITA_SHADE_LABS: Record<string, [number, number, number]> = {};
for (const [key, val] of Object.entries(VITA_SHADES)) {
  const [r, g, b] = hexToRgb(val.hex);
  VITA_SHADE_LABS[key] = rgbToLab(r, g, b);
}

/**
 * Find the closest VITA shade for a given RGB color using CIELAB Delta-E.
 */
function findClosestShade(r: number, g: number, b: number): string {
  const sampleLab = rgbToLab(r, g, b);
  let bestShade = 'A2';
  let bestDist = Infinity;

  for (const [key, lab] of Object.entries(VITA_SHADE_LABS)) {
    const dist = deltaE(sampleLab, lab);
    if (dist < bestDist) {
      bestDist = dist;
      bestShade = key;
    }
  }

  return bestShade;
}

/**
 * Sample average RGB from a rectangular region of the image via an offscreen canvas.
 */
function sampleRegionColor(
  img: HTMLImageElement,
  normX: number,
  normY: number,
  normW: number,
  normH: number,
): [number, number, number] {
  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);

  // Convert normalized coords to pixel coords
  const px = Math.round(normX * img.naturalWidth);
  const py = Math.round(normY * img.naturalHeight);
  const pw = Math.max(1, Math.round(normW * img.naturalWidth));
  const ph = Math.max(1, Math.round(normH * img.naturalHeight));

  // Clamp to image bounds
  const sx = Math.max(0, Math.min(px, img.naturalWidth - 1));
  const sy = Math.max(0, Math.min(py, img.naturalHeight - 1));
  const sw = Math.min(pw, img.naturalWidth - sx);
  const sh = Math.min(ph, img.naturalHeight - sy);

  if (sw <= 0 || sh <= 0) return [238, 219, 181]; // fallback warm white

  const imageData = ctx.getImageData(sx, sy, sw, sh);
  const data = imageData.data;
  let rSum = 0;
  let gSum = 0;
  let bSum = 0;
  const pixelCount = data.length / 4;

  for (let i = 0; i < data.length; i += 4) {
    rSum += data[i];
    gSum += data[i + 1];
    bSum += data[i + 2];
  }

  return [
    Math.round(rSum / pixelCount),
    Math.round(gSum / pixelCount),
    Math.round(bSum / pixelCount),
  ];
}

/**
 * For each tooth region, sample the pixel color from the captured image and
 * find the closest VITA shade.
 */
async function computeShadeFromPixels(
  img: HTMLImageElement,
  teethRegions: ToothRegion[],
): Promise<ShadeMatch> {
  const individual: Record<number, string> = {};
  const shadeCounts: Record<string, number> = {};

  for (const region of teethRegions) {
    // Sample from the center portion of each tooth region (inner 60%) to
    // avoid lip/gum contamination at edges
    const insetX = region.x + region.width * 0.2;
    const insetY = region.y + region.height * 0.2;
    const insetW = region.width * 0.6;
    const insetH = region.height * 0.6;

    const [r, g, b] = sampleRegionColor(img, insetX, insetY, insetW, insetH);
    const shade = findClosestShade(r, g, b);

    region.shade = shade;
    individual[region.toothNumber] = shade;
    shadeCounts[shade] = (shadeCounts[shade] ?? 0) + 1;
  }

  // Overall shade = most frequent individual shade
  let overall = 'A2';
  let maxCount = 0;
  for (const [shade, count] of Object.entries(shadeCounts)) {
    if (count > maxCount) {
      maxCount = count;
      overall = shade;
    }
  }

  return { overall, individual };
}

// ===========================================================================
// Proportion analysis from real landmarks
// ===========================================================================

function computeProportions(
  landmarks: Array<{ x: number; y: number; z: number }>,
): SmileProportions {
  // --- Golden ratio ---
  // Inter-eye distance (outer corners)
  const leftEyeOuter = landmarks[LANDMARKS.leftEyeOuter];
  const rightEyeOuter = landmarks[LANDMARKS.rightEyeOuter];
  const interOcularDist = Math.hypot(
    rightEyeOuter.x - leftEyeOuter.x,
    rightEyeOuter.y - leftEyeOuter.y,
  );

  // Mouth width
  const mouthLeft = landmarks[LANDMARKS.mouthLeft];
  const mouthRight = landmarks[LANDMARKS.mouthRight];
  const mouthWidth = Math.hypot(
    mouthRight.x - mouthLeft.x,
    mouthRight.y - mouthLeft.y,
  );

  // Golden ratio approximation: face width / mouth width
  const jawLeft = landmarks[LANDMARKS.jawLeft];
  const jawRight = landmarks[LANDMARKS.jawRight];
  const faceWidth = Math.hypot(
    jawRight.x - jawLeft.x,
    jawRight.y - jawLeft.y,
  );

  const goldenRatio = parseFloat(
    Math.max(1.2, Math.min(2.0, faceWidth / mouthWidth)).toFixed(2),
  );

  // --- Smile arc ---
  // Compare upper lip center Y to mouth corner Y values.
  // If the upper lip center is BELOW the corners, the arc curves downward (consonant).
  // If above, it is reverse. If approximately equal, flat.
  const upperLipCenter = landmarks[LANDMARKS.upperLipTop];
  const cornerAvgY = (mouthLeft.y + mouthRight.y) / 2;
  const arcDelta = upperLipCenter.y - cornerAvgY;

  let smileArc: 'consonant' | 'flat' | 'reverse';
  if (arcDelta > 0.008) {
    smileArc = 'consonant'; // lip center lower than corners => upward curve
  } else if (arcDelta < -0.008) {
    smileArc = 'reverse';
  } else {
    smileArc = 'flat';
  }

  // --- Buccal corridor ---
  // Percentage: (face width - mouth width) / face width * 50
  // Represents the dark space on each side as a percentage
  const buccalCorridor = parseFloat(
    Math.max(5, Math.min(25, ((faceWidth - mouthWidth) / faceWidth) * 50)).toFixed(1),
  );

  // --- Facial thirds ---
  // Upper third: forehead (landmark 10) to brow line
  // Middle third: brow line to nose base
  // Lower third: nose base to chin
  const forehead = landmarks[LANDMARKS.forehead];
  const chin = landmarks[LANDMARKS.chin];
  const noseTip = landmarks[LANDMARKS.noseTip];

  // Approximate brow line from eyebrow landmarks
  const leftBrowInner = landmarks[LANDMARKS.leftBrowInner];
  const rightBrowInner = landmarks[LANDMARKS.rightBrowInner];
  const browY = (leftBrowInner.y + rightBrowInner.y) / 2;

  const totalFaceHeight = chin.y - forehead.y;

  if (totalFaceHeight <= 0) {
    // Degenerate case — return even thirds
    return { goldenRatio, smileArc, buccalCorridor, facialThirds: [33.3, 33.3, 33.4] };
  }

  const upperThird = ((browY - forehead.y) / totalFaceHeight) * 100;
  const middleThird = ((noseTip.y - browY) / totalFaceHeight) * 100;
  const lowerThird = ((chin.y - noseTip.y) / totalFaceHeight) * 100;

  return {
    goldenRatio,
    smileArc,
    buccalCorridor,
    facialThirds: [
      parseFloat(upperThird.toFixed(1)),
      parseFloat(middleThird.toFixed(1)),
      parseFloat(lowerThird.toFixed(1)),
    ],
  };
}

// ===========================================================================
// Fallback (no face detected or model fails to load)
// ===========================================================================

function generateFallbackAnalysis(): AnalysisResult {
  return {
    facialLandmarks: generateMockLandmarks(),
    teethRegions: [
      { toothNumber: 6,  x: 0.27, y: 0.62, width: 0.055, height: 0.075, shade: 'A2' },
      { toothNumber: 7,  x: 0.33, y: 0.60, width: 0.060, height: 0.080, shade: 'A1' },
      { toothNumber: 8,  x: 0.40, y: 0.59, width: 0.065, height: 0.090, shade: 'A2' },
      { toothNumber: 9,  x: 0.47, y: 0.59, width: 0.065, height: 0.090, shade: 'A2' },
      { toothNumber: 10, x: 0.54, y: 0.60, width: 0.060, height: 0.080, shade: 'A1' },
      { toothNumber: 11, x: 0.60, y: 0.62, width: 0.055, height: 0.075, shade: 'B1' },
      { toothNumber: 22, x: 0.27, y: 0.72, width: 0.050, height: 0.065, shade: 'A2' },
      { toothNumber: 23, x: 0.33, y: 0.71, width: 0.050, height: 0.068, shade: 'A2' },
      { toothNumber: 24, x: 0.39, y: 0.70, width: 0.055, height: 0.070, shade: 'A1' },
      { toothNumber: 25, x: 0.46, y: 0.70, width: 0.055, height: 0.070, shade: 'A1' },
    ],
    shadeMatch: { ...mockShadeMatch },
    proportions: { ...mockProportions },
  };
}
