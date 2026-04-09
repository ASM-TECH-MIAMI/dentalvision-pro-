// DentalVision Pro - Type Definitions
// All data is mock/simulated for demo purposes

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  dateOfBirth: string;
  createdAt: string;
  notes: string;
}

export type CaseStatus =
  | 'consultation'
  | 'capture'
  | 'analysis'
  | 'design'
  | 'treatment'
  | 'complete';

export type TreatmentType =
  | 'veneers'
  | 'whitening'
  | 'implants'
  | 'crowns'
  | 'bonding';

export interface Case {
  id: string;
  patientId: string;
  status: CaseStatus;
  treatment: TreatmentType;
  createdAt: string;
  updatedAt: string;
  photos: CapturePhoto[];
  analysis: AnalysisResult | null;
  treatmentPlan: TreatmentPlan | null;
  shade: string;
}

export type CapturePhotoType =
  | 'frontal-smile'
  | 'frontal-rest'
  | 'left-profile'
  | 'right-profile'
  | 'retracted';

export interface CapturePhoto {
  id: string;
  type: CapturePhotoType;
  imageUrl: string;
  capturedAt: string;
}

export interface FacialLandmark {
  x: number;
  y: number;
  id: number;
}

export interface ToothRegion {
  toothNumber: number;
  x: number;
  y: number;
  width: number;
  height: number;
  shade: string;
}

export interface ShadeMatch {
  overall: string;
  individual: Record<number, string>;
}

export interface SmileProportions {
  goldenRatio: number;
  smileArc: 'consonant' | 'flat' | 'reverse';
  buccalCorridor: number;
  facialThirds: [number, number, number];
}

export interface AnalysisResult {
  facialLandmarks: FacialLandmark[];
  teethRegions: ToothRegion[];
  shadeMatch: ShadeMatch;
  proportions: SmileProportions;
}

export interface Procedure {
  code: string;
  tooth: string;
  description: string;
  fee: number;
  category: string;
}

export interface TreatmentPlan {
  id: string;
  procedures: Procedure[];
  totalFee: number;
  estimatedVisits: number;
  notes: string;
  createdAt: string;
}

export interface ConsultSession {
  id: string;
  caseId: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  duration: number;
  startedAt: string;
  notes: string;
}

export type ActivityType =
  | 'case-created'
  | 'photos-captured'
  | 'analysis-complete'
  | 'design-updated'
  | 'treatment-started'
  | 'case-completed'
  | 'consultation-scheduled'
  | 'note-added';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  message: string;
  timestamp: string;
  patientId: string;
  caseId: string;
}

export interface DemoUser {
  id: string;
  name: string;
  email: string;
  practice: string;
  title: string;
  avatarUrl: string;
}

export interface DemoState {
  currentUser: DemoUser;
  patients: Patient[];
  isAuthenticated: boolean;
  capturedPhotos: Record<string, CapturePhoto[]>;
  analysisResults: Record<string, AnalysisResult>;
}
