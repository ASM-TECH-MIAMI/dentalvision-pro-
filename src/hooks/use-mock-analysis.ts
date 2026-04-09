'use client';

import { useState, useCallback } from 'react';
import type { AnalysisResult } from '@/lib/types';
import { generateMockLandmarks, generateMockTeethRegions, mockShadeMatch, mockProportions } from '@/lib/mock-data';

interface AnalysisStep {
  label: string;
  progress: number;
  duration: number;
}

const ANALYSIS_STEPS: AnalysisStep[] = [
  { label: 'Mapping facial landmarks...', progress: 20, duration: 1500 },
  { label: 'Detecting teeth regions...', progress: 45, duration: 1500 },
  { label: 'Matching VITA shades...', progress: 70, duration: 1200 },
  { label: 'Analyzing proportions...', progress: 90, duration: 1000 },
  { label: 'Analysis complete', progress: 100, duration: 800 },
];

export function useMockAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [stepLabel, setStepLabel] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const runAnalysis = useCallback((): Promise<AnalysisResult> => {
    return new Promise((resolve) => {
      setIsAnalyzing(true);
      setCurrentStep(0);
      setProgress(0);
      setResult(null);

      let stepIndex = 0;

      const advanceStep = () => {
        if (stepIndex >= ANALYSIS_STEPS.length) {
          const analysisResult: AnalysisResult = {
            facialLandmarks: generateMockLandmarks(),
            teethRegions: generateMockTeethRegions(),
            shadeMatch: mockShadeMatch,
            proportions: mockProportions,
          };
          setResult(analysisResult);
          setIsAnalyzing(false);
          resolve(analysisResult);
          return;
        }

        const step = ANALYSIS_STEPS[stepIndex];
        setCurrentStep(stepIndex);
        setStepLabel(step.label);
        setProgress(step.progress);
        stepIndex++;

        setTimeout(advanceStep, step.duration);
      };

      advanceStep();
    });
  }, []);

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
    totalSteps: ANALYSIS_STEPS.length,
    progress,
    stepLabel,
    result,
    runAnalysis,
    reset,
  };
}
