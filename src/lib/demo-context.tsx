'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import type {
  Patient,
  Case,
  CapturePhoto,
  AnalysisResult,
  DemoUser,
} from '@/lib/types';
import { mockPatients, mockUser, mockAnalysisResults } from '@/lib/mock-data';

// ---------------------------------------------------------------------------
// Context shape
// ---------------------------------------------------------------------------

interface DemoContextValue {
  // Auth
  isAuthenticated: boolean;
  currentUser: DemoUser;
  login: () => void;
  logout: () => void;

  // Patients & cases
  patients: Patient[];
  addPatient: (patient: Patient) => void;
  getPatientById: (id: string) => Patient | undefined;
  getCaseById: (caseId: string) => { case_: Case; patient: Patient } | undefined;

  // Captured photos — keyed by caseId
  capturedPhotos: Record<string, CapturePhoto[]>;
  saveCapturedPhoto: (caseId: string, photo: CapturePhoto) => void;

  // Analysis results — keyed by caseId
  analysisResults: Record<string, AnalysisResult>;
  saveAnalysisResult: (caseId: string, result: AnalysisResult) => void;
}

const DemoContext = createContext<DemoContextValue | null>(null);

// ---------------------------------------------------------------------------
// Local-storage helpers
// ---------------------------------------------------------------------------

const LS_AUTH_KEY = 'dv-pro:isAuthenticated';
const LS_PHOTOS_KEY = 'dv-pro:capturedPhotos';

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DemoProvider({ children }: { children: ReactNode }) {
  // --- Auth ----------------------------------------------------------------
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() =>
    readFromStorage<boolean>(LS_AUTH_KEY, false),
  );

  useEffect(() => {
    localStorage.setItem(LS_AUTH_KEY, JSON.stringify(isAuthenticated));
  }, [isAuthenticated]);

  const login = useCallback(() => {
    setIsAuthenticated(true);
  }, []);

  const logout = useCallback(() => {
    setIsAuthenticated(false);
    localStorage.removeItem(LS_AUTH_KEY);
  }, []);

  // --- Patients ------------------------------------------------------------
  const [patients, setPatients] = useState<Patient[]>(mockPatients);

  const addPatient = useCallback((patient: Patient) => {
    setPatients((prev) => [...prev, patient]);
  }, []);

  const getPatientById = useCallback(
    (id: string) => patients.find((p) => p.id === id),
    [patients],
  );

  const getCaseById = useCallback(
    (caseId: string) => {
      for (const patient of patients) {
        // Cases live on the patient objects that are loaded alongside the
        // mock data (see mock-data.ts). We walk every patient looking for a
        // matching case across all associated case arrays.
        // Because Patient does not carry cases directly in the type, the
        // cases are tracked separately (photos / analysis keyed by caseId).
        // However some pages may attach a `cases` property via mock data.
        const patientWithCases = patient as Patient & { cases?: Case[] };
        const found = patientWithCases.cases?.find((c) => c.id === caseId);
        if (found) {
          return { case_: found, patient };
        }
      }
      return undefined;
    },
    [patients],
  );

  // --- Captured photos (persisted) -----------------------------------------
  const [capturedPhotos, setCapturedPhotos] = useState<
    Record<string, CapturePhoto[]>
  >(() => readFromStorage<Record<string, CapturePhoto[]>>(LS_PHOTOS_KEY, {}));

  useEffect(() => {
    localStorage.setItem(LS_PHOTOS_KEY, JSON.stringify(capturedPhotos));
  }, [capturedPhotos]);

  const saveCapturedPhoto = useCallback(
    (caseId: string, photo: CapturePhoto) => {
      setCapturedPhotos((prev) => ({
        ...prev,
        [caseId]: [...(prev[caseId] ?? []), photo],
      }));
    },
    [],
  );

  // --- Analysis results (in-memory, seeded from mock data) -----------------
  const [analysisResults, setAnalysisResults] =
    useState<Record<string, AnalysisResult>>(mockAnalysisResults);

  const saveAnalysisResult = useCallback(
    (caseId: string, result: AnalysisResult) => {
      setAnalysisResults((prev) => ({ ...prev, [caseId]: result }));
    },
    [],
  );

  // --- Value ---------------------------------------------------------------
  const value: DemoContextValue = {
    isAuthenticated,
    currentUser: mockUser,
    login,
    logout,
    patients,
    addPatient,
    getPatientById,
    getCaseById,
    capturedPhotos,
    saveCapturedPhoto,
    analysisResults,
    saveAnalysisResult,
  };

  return <DemoContext.Provider value={value}>{children}</DemoContext.Provider>;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useDemoContext(): DemoContextValue {
  const ctx = useContext(DemoContext);
  if (!ctx) {
    throw new Error('useDemoContext must be used within a <DemoProvider>');
  }
  return ctx;
}
