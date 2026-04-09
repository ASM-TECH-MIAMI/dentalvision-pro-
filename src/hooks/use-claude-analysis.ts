'use client';

import { useState, useCallback } from 'react';

interface DentalAnalysis {
  summary: string;
  facial_analysis: {
    symmetry_score: number;
    symmetry_notes: string;
    profile_type: string;
    lip_line: string;
    smile_line: string;
  };
  dental_observations: Array<{
    tooth_region: string;
    observation: string;
    severity: string;
  }>;
  shade_assessment: {
    estimated_current_shade: string;
    recommended_target_shade: string;
    notes: string;
  };
  treatment_suggestions: Array<{
    procedure: string;
    teeth: string;
    rationale: string;
    priority: string;
  }>;
  smile_design_notes: string;
  confidence: number;
}

interface TreatmentNarrative {
  narrative: string;
  headline: string;
  estimated_procedures: number;
  complexity: string;
}

export function useClaudeAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dentalAnalysis, setDentalAnalysis] = useState<DentalAnalysis | null>(null);
  const [treatmentNarrative, setTreatmentNarrative] = useState<TreatmentNarrative | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeDentalPhoto = useCallback(async (imageDataUrl: string): Promise<DentalAnalysis | null> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl, analysisType: 'dental-analysis' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setDentalAnalysis(json.data);
      return json.data;
    } catch (err: any) {
      setError(err.message || 'Analysis failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const generateTreatmentNarrative = useCallback(async (imageDataUrl: string): Promise<TreatmentNarrative | null> => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageDataUrl, analysisType: 'treatment-narrative' }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setTreatmentNarrative(json.data);
      return json.data;
    } catch (err: any) {
      setError(err.message || 'Narrative generation failed');
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const reset = useCallback(() => {
    setDentalAnalysis(null);
    setTreatmentNarrative(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  return {
    isAnalyzing,
    dentalAnalysis,
    treatmentNarrative,
    error,
    analyzeDentalPhoto,
    generateTreatmentNarrative,
    reset,
  };
}
