// DentalVision Pro - Mock Data
// All data is simulated for demo purposes

import type {
  Patient,
  Case,
  AnalysisResult,
  TreatmentPlan,
  FacialLandmark,
  ActivityItem,
  DemoUser,
  ConsultSession,
} from './types';

// ---------------------------------------------------------------------------
// Current User
// ---------------------------------------------------------------------------

export const mockUser: DemoUser = {
  id: 'dr-001',
  name: 'Dr. Sam Saleh',
  email: 'dr.saleh@dentalvisual.pro',
  practice: 'Ora Dentistry Spa',
  title: 'Cosmetic & Restorative Dentist',
  avatarUrl: 'https://ui-avatars.com/api/?name=Sam+Saleh&background=1e293b&color=f8fafc&size=128',
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString();
}

function hoursAgo(n: number): string {
  const d = new Date();
  d.setHours(d.getHours() - n);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Patients
// ---------------------------------------------------------------------------

export const mockPatients: Patient[] = [
  {
    id: 'pat-001',
    firstName: 'Isabella',
    lastName: 'Marchetti',
    email: 'isabella.marchetti@gmail.com',
    phone: '(310) 555-8721',
    avatarUrl: 'https://ui-avatars.com/api/?name=Isabella+Marchetti&background=7c3aed&color=fff&size=128',
    dateOfBirth: '1992-06-14',
    createdAt: daysAgo(3),
    notes: 'Referred by Dr. Kourosh. Desires a brighter, more symmetrical smile. No allergies. Mild TMJ history.',
  },
  {
    id: 'pat-002',
    firstName: 'Jonathan',
    lastName: 'Cardenes',
    email: 'j.cardenes@outlook.com',
    phone: '(310) 555-3294',
    avatarUrl: 'https://ui-avatars.com/api/?name=Jonathan+Cardenes&background=0891b2&color=fff&size=128',
    dateOfBirth: '1985-11-02',
    createdAt: daysAgo(7),
    notes: 'Executive patient. Missing #19 and #30 — implant crowns planned. Prefers minimal chair time. Sedation candidate.',
  },
  {
    id: 'pat-003',
    firstName: 'Victoria',
    lastName: 'Chen',
    email: 'victoria.chen@icloud.com',
    phone: '(424) 555-6108',
    avatarUrl: 'https://ui-avatars.com/api/?name=Victoria+Chen&background=059669&color=fff&size=128',
    dateOfBirth: '1988-03-28',
    createdAt: daysAgo(21),
    notes: 'Completed treatment. Whitening + 4 upper anterior veneers. Extremely satisfied — agreed to before/after portfolio use.',
  },
  {
    id: 'pat-004',
    firstName: 'Alexander',
    lastName: 'Petrov',
    email: 'a.petrov@gmail.com',
    phone: '(310) 555-9473',
    avatarUrl: 'https://ui-avatars.com/api/?name=Alexander+Petrov&background=dc2626&color=fff&size=128',
    dateOfBirth: '1978-09-17',
    createdAt: daysAgo(0),
    notes: 'Initial consultation today. Interested in full upper veneers. Concerns about natural appearance. Works in entertainment.',
  },
];

// ---------------------------------------------------------------------------
// Analysis Result — Isabella Marchetti
// ---------------------------------------------------------------------------

export const isabellaAnalysis: AnalysisResult = {
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
  shadeMatch: {
    overall: 'A2',
    individual: {
      6: 'A2',
      7: 'A1',
      8: 'A2',
      9: 'A2',
      10: 'A1',
      11: 'B1',
      22: 'A2',
      23: 'A2',
      24: 'A1',
      25: 'A1',
    },
  },
  proportions: {
    goldenRatio: 1.58,
    smileArc: 'consonant',
    buccalCorridor: 12,
    facialThirds: [33.2, 33.5, 33.3],
  },
};

// ---------------------------------------------------------------------------
// Treatment Plan — Isabella Marchetti
// ---------------------------------------------------------------------------

export const isabellaTreatmentPlan: TreatmentPlan = {
  id: 'tp-001',
  procedures: [
    { code: 'D2740', tooth: '#6',  description: 'Porcelain Veneer — Upper Right Cuspid',        fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#7',  description: 'Porcelain Veneer — Upper Right Lateral Incisor', fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#8',  description: 'Porcelain Veneer — Upper Right Central Incisor', fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#9',  description: 'Porcelain Veneer — Upper Left Central Incisor',  fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#10', description: 'Porcelain Veneer — Upper Left Lateral Incisor',  fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#11', description: 'Porcelain Veneer — Upper Left Cuspid',           fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#22', description: 'Porcelain Veneer — Lower Left Cuspid',           fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#23', description: 'Porcelain Veneer — Lower Left Lateral Incisor',  fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#24', description: 'Porcelain Veneer — Lower Left Central Incisor',  fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#25', description: 'Porcelain Veneer — Lower Right Central Incisor', fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#26', description: 'Porcelain Veneer — Lower Right Lateral Incisor', fee: 3200, category: 'veneers' },
    { code: 'D2740', tooth: '#27', description: 'Porcelain Veneer — Lower Right Cuspid',          fee: 3200, category: 'veneers' },
    { code: 'D9972', tooth: 'Full Arch', description: 'External Bleaching — In-Office Whitening', fee: 800,  category: 'whitening' },
    { code: 'D4211', tooth: '#6',  description: 'Gum Contouring — Gingivectomy',                  fee: 350,  category: 'periodontics' },
    { code: 'D4211', tooth: '#7',  description: 'Gum Contouring — Gingivectomy',                  fee: 350,  category: 'periodontics' },
    { code: 'D4211', tooth: '#8',  description: 'Gum Contouring — Gingivectomy',                  fee: 350,  category: 'periodontics' },
    { code: 'D4211', tooth: '#9',  description: 'Gum Contouring — Gingivectomy',                  fee: 350,  category: 'periodontics' },
    { code: 'D4211', tooth: '#10', description: 'Gum Contouring — Gingivectomy',                  fee: 350,  category: 'periodontics' },
    { code: 'D4211', tooth: '#11', description: 'Gum Contouring — Gingivectomy',                  fee: 350,  category: 'periodontics' },
  ],
  totalFee: 41300,
  estimatedVisits: 3,
  notes: 'Treatment spread across 3 visits over approximately 6 weeks. Visit 1: whitening + gum contouring. Visit 2: upper veneer prep + temporaries. Visit 3: lower veneer prep + seat all final restorations. Shade target: BL1/BL2 (patient desires bright, natural Hollywood white).',
  createdAt: daysAgo(2),
};

// ---------------------------------------------------------------------------
// Analysis Result — Jonathan Cardenes (case-002)
// 8 veneers (#6-#11, #22, #27) + 2 implant crowns (#19, #30)
// ---------------------------------------------------------------------------

export const jonathanAnalysis: AnalysisResult = {
  facialLandmarks: generateMockLandmarks(),
  teethRegions: [
    { toothNumber: 6,  x: 0.25, y: 0.60, width: 0.058, height: 0.078, shade: 'BL2' },
    { toothNumber: 7,  x: 0.31, y: 0.58, width: 0.055, height: 0.082, shade: 'BL2' },
    { toothNumber: 8,  x: 0.38, y: 0.57, width: 0.068, height: 0.092, shade: 'BL2' },
    { toothNumber: 9,  x: 0.46, y: 0.57, width: 0.068, height: 0.092, shade: 'BL2' },
    { toothNumber: 10, x: 0.53, y: 0.58, width: 0.055, height: 0.082, shade: 'BL2' },
    { toothNumber: 11, x: 0.59, y: 0.60, width: 0.058, height: 0.078, shade: 'BL2' },
    { toothNumber: 19, x: 0.22, y: 0.74, width: 0.060, height: 0.072, shade: 'BL2' },
    { toothNumber: 22, x: 0.28, y: 0.72, width: 0.052, height: 0.068, shade: 'BL2' },
    { toothNumber: 27, x: 0.58, y: 0.72, width: 0.052, height: 0.068, shade: 'BL2' },
    { toothNumber: 30, x: 0.64, y: 0.74, width: 0.060, height: 0.072, shade: 'BL2' },
  ],
  shadeMatch: {
    overall: 'BL2',
    individual: {
      6: 'BL2',
      7: 'BL2',
      8: 'BL2',
      9: 'BL2',
      10: 'BL2',
      11: 'BL2',
      19: 'BL2',
      22: 'BL2',
      27: 'BL2',
      30: 'BL2',
    },
  },
  proportions: {
    goldenRatio: 1.61,
    smileArc: 'consonant',
    buccalCorridor: 10,
    facialThirds: [32.8, 33.8, 33.4],
  },
};

// ---------------------------------------------------------------------------
// Cases
// ---------------------------------------------------------------------------

export const mockCases: Case[] = [
  {
    id: 'case-001',
    patientId: 'pat-001',
    status: 'analysis',
    treatment: 'veneers',
    createdAt: daysAgo(3),
    updatedAt: hoursAgo(4),
    photos: [
      { id: 'ph-001', type: 'frontal-smile',  imageUrl: '', capturedAt: daysAgo(2) },
      { id: 'ph-002', type: 'frontal-rest',   imageUrl: '', capturedAt: daysAgo(2) },
      { id: 'ph-003', type: 'left-profile',   imageUrl: '', capturedAt: daysAgo(2) },
      { id: 'ph-004', type: 'right-profile',  imageUrl: '', capturedAt: daysAgo(2) },
      { id: 'ph-005', type: 'retracted',      imageUrl: '', capturedAt: daysAgo(2) },
    ],
    analysis: isabellaAnalysis,
    treatmentPlan: isabellaTreatmentPlan,
    shade: 'A1',
  },
  {
    id: 'case-002',
    patientId: 'pat-002',
    status: 'design',
    treatment: 'veneers',
    createdAt: daysAgo(7),
    updatedAt: daysAgo(1),
    photos: [
      { id: 'ph-006', type: 'frontal-smile', imageUrl: '', capturedAt: daysAgo(6) },
      { id: 'ph-007', type: 'frontal-rest',  imageUrl: '', capturedAt: daysAgo(6) },
      { id: 'ph-008', type: 'retracted',     imageUrl: '', capturedAt: daysAgo(6) },
    ],
    analysis: jonathanAnalysis,
    treatmentPlan: {
      id: 'tp-002',
      procedures: [
        { code: 'D2740', tooth: '#6',  description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#7',  description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#8',  description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#9',  description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#10', description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#11', description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#22', description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#27', description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D6058', tooth: '#19', description: 'Implant Crown — Porcelain/Ceramic', fee: 4500, category: 'implants' },
        { code: 'D6058', tooth: '#30', description: 'Implant Crown — Porcelain/Ceramic', fee: 4500, category: 'implants' },
      ],
      totalFee: 34600,
      estimatedVisits: 5,
      notes: '8 anterior veneers + 2 posterior implant crowns. Implant fixtures already placed by Dr. Zadeh. Allow 4 months osseointegration before final crowns.',
      createdAt: daysAgo(5),
    },
    shade: 'BL2',
  },
  {
    id: 'case-003',
    patientId: 'pat-003',
    status: 'complete',
    treatment: 'veneers',
    createdAt: daysAgo(21),
    updatedAt: daysAgo(3),
    photos: [
      { id: 'ph-009', type: 'frontal-smile', imageUrl: '', capturedAt: daysAgo(20) },
      { id: 'ph-010', type: 'frontal-rest',  imageUrl: '', capturedAt: daysAgo(20) },
      { id: 'ph-011', type: 'retracted',     imageUrl: '', capturedAt: daysAgo(20) },
    ],
    analysis: null,
    treatmentPlan: {
      id: 'tp-003',
      procedures: [
        { code: 'D9972', tooth: 'Full Arch', description: 'External Bleaching — In-Office Whitening', fee: 800, category: 'whitening' },
        { code: 'D2740', tooth: '#7',  description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#8',  description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#9',  description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
        { code: 'D2740', tooth: '#10', description: 'Porcelain Veneer', fee: 3200, category: 'veneers' },
      ],
      totalFee: 13600,
      estimatedVisits: 2,
      notes: 'Whitening first, then 4 upper anterior veneers. Patient thrilled with results.',
      createdAt: daysAgo(19),
    },
    shade: 'A1',
  },
  {
    id: 'case-004',
    patientId: 'pat-004',
    status: 'consultation',
    treatment: 'veneers',
    createdAt: daysAgo(0),
    updatedAt: daysAgo(0),
    photos: [],
    analysis: null,
    treatmentPlan: null,
    shade: '',
  },
];

// ---------------------------------------------------------------------------
// Consult Sessions
// ---------------------------------------------------------------------------

export const mockConsultSessions: ConsultSession[] = [
  {
    id: 'cs-001',
    caseId: 'case-001',
    status: 'completed',
    duration: 45,
    startedAt: daysAgo(3),
    notes: 'Initial consultation with Isabella. Discussed veneer options, shade preferences, and timeline. Patient prefers natural-bright look.',
  },
  {
    id: 'cs-002',
    caseId: 'case-004',
    status: 'scheduled',
    duration: 60,
    startedAt: daysAgo(0),
    notes: 'First consultation for Alexander. Full evaluation and smile design discussion.',
  },
];

// ---------------------------------------------------------------------------
// Activity Feed
// ---------------------------------------------------------------------------

export const recentActivity: ActivityItem[] = [
  {
    id: 'act-001',
    type: 'consultation-scheduled',
    message: 'Initial consultation scheduled for Alexander Petrov',
    timestamp: hoursAgo(1),
    patientId: 'pat-004',
    caseId: 'case-004',
  },
  {
    id: 'act-002',
    type: 'analysis-complete',
    message: 'AI smile analysis completed for Isabella Marchetti — golden ratio 1.58, consonant arc detected',
    timestamp: hoursAgo(4),
    patientId: 'pat-001',
    caseId: 'case-001',
  },
  {
    id: 'act-003',
    type: 'design-updated',
    message: 'Smile design updated for Jonathan Cardenes — shade adjusted to BL2',
    timestamp: hoursAgo(26),
    patientId: 'pat-002',
    caseId: 'case-002',
  },
  {
    id: 'act-004',
    type: 'photos-captured',
    message: '5 clinical photos captured for Isabella Marchetti',
    timestamp: daysAgo(2),
    patientId: 'pat-001',
    caseId: 'case-001',
  },
  {
    id: 'act-005',
    type: 'case-created',
    message: 'New veneer case created for Isabella Marchetti — 10 upper anterior veneers',
    timestamp: daysAgo(3),
    patientId: 'pat-001',
    caseId: 'case-001',
  },
  {
    id: 'act-006',
    type: 'case-completed',
    message: 'Treatment complete for Victoria Chen — whitening + 4 veneers, patient delighted',
    timestamp: daysAgo(3),
    patientId: 'pat-003',
    caseId: 'case-003',
  },
  {
    id: 'act-007',
    type: 'treatment-started',
    message: 'Veneer preparation started for Victoria Chen — upper anteriors #7-#10',
    timestamp: daysAgo(10),
    patientId: 'pat-003',
    caseId: 'case-003',
  },
  {
    id: 'act-008',
    type: 'note-added',
    message: 'Lab note: Jonathan Cardenes implant crowns (Zirconia, shade BL2) sent to Oral Arts Dental Lab',
    timestamp: daysAgo(5),
    patientId: 'pat-002',
    caseId: 'case-002',
  },
];

// ---------------------------------------------------------------------------
// Facial Landmark Generator
// ---------------------------------------------------------------------------

export function generateMockLandmarks(): FacialLandmark[] {
  const landmarks: FacialLandmark[] = [];

  // Helper to add a landmark
  const add = (id: number, x: number, y: number) => {
    landmarks.push({ id, x, y });
  };

  // Face contour (landmarks 0-32): oval shape
  for (let i = 0; i <= 32; i++) {
    const angle = Math.PI * (0.15 + (i / 32) * 0.7);
    const rx = 0.38;
    const ry = 0.48;
    const cx = 0.5;
    const cy = 0.48;
    add(i, cx + rx * Math.cos(angle + Math.PI), cy + ry * Math.sin(angle + Math.PI));
  }

  // Right eyebrow (landmarks 33-41)
  for (let i = 33; i <= 41; i++) {
    const t = (i - 33) / 8;
    add(i, 0.30 + t * 0.12, 0.28 - Math.sin(t * Math.PI) * 0.025);
  }

  // Left eyebrow (landmarks 42-50)
  for (let i = 42; i <= 50; i++) {
    const t = (i - 42) / 8;
    add(i, 0.58 + t * 0.12, 0.28 - Math.sin(t * Math.PI) * 0.025);
  }

  // Nose bridge and tip (landmarks 51-60)
  for (let i = 51; i <= 60; i++) {
    const t = (i - 51) / 9;
    const y = 0.30 + t * 0.22;
    const x = 0.50 + Math.sin(t * Math.PI * 2) * 0.008;
    add(i, x, y);
  }

  // Mouth outer (landmarks 61-80)
  for (let i = 61; i <= 80; i++) {
    const t = (i - 61) / 19;
    const angle = t * Math.PI * 2;
    add(i, 0.50 + 0.10 * Math.cos(angle), 0.64 + 0.035 * Math.sin(angle));
  }

  // Mouth inner (landmarks 81-95)
  for (let i = 81; i <= 95; i++) {
    const t = (i - 81) / 14;
    const angle = t * Math.PI * 2;
    add(i, 0.50 + 0.07 * Math.cos(angle), 0.64 + 0.020 * Math.sin(angle));
  }

  // Right eye (landmarks 130-160)
  for (let i = 130; i <= 160; i++) {
    const t = (i - 130) / 30;
    const angle = t * Math.PI * 2;
    add(i, 0.36 + 0.045 * Math.cos(angle), 0.34 + 0.018 * Math.sin(angle));
  }

  // Fill gaps 96-129 with interpolated face mesh points (cheeks and mid-face)
  for (let i = 96; i <= 129; i++) {
    const t = (i - 96) / 33;
    const row = Math.floor(t * 4);
    const col = t * 4 - row;
    add(i, 0.28 + col * 0.44, 0.36 + row * 0.06);
  }

  // Fill gap 161-290 with face mesh grid (forehead, cheeks, mid-face)
  for (let i = 161; i <= 290; i++) {
    const idx = i - 161;
    const cols = 13;
    const row = Math.floor(idx / cols);
    const col = idx % cols;
    const totalRows = Math.ceil(130 / cols);
    const baseX = 0.20 + (col / (cols - 1)) * 0.60;
    const baseY = 0.10 + (row / totalRows) * 0.55;
    // Slight oval mask — pull edge points inward
    const distFromCenter = Math.abs(baseX - 0.5) / 0.30;
    const yOvalLimit = 0.48 * Math.sqrt(Math.max(0, 1 - distFromCenter * distFromCenter));
    const y = Math.min(baseY, 0.48 + yOvalLimit);
    add(i, baseX + (Math.random() - 0.5) * 0.008, y + (Math.random() - 0.5) * 0.008);
  }

  // Mouth detail / lower lip (landmarks 291-320)
  for (let i = 291; i <= 320; i++) {
    const t = (i - 291) / 29;
    const angle = t * Math.PI * 2;
    add(i, 0.50 + 0.085 * Math.cos(angle), 0.66 + 0.025 * Math.sin(angle));
  }

  // Fill 321-384 with chin, jawline, and lower face
  for (let i = 321; i <= 384; i++) {
    const t = (i - 321) / 63;
    const angle = Math.PI * (0.25 + t * 0.50);
    add(i, 0.50 + 0.32 * Math.cos(angle), 0.72 + 0.18 * Math.sin(angle));
  }

  // Left eye (landmarks 385-415)
  for (let i = 385; i <= 415; i++) {
    const t = (i - 385) / 30;
    const angle = t * Math.PI * 2;
    add(i, 0.64 + 0.045 * Math.cos(angle), 0.34 + 0.018 * Math.sin(angle));
  }

  // Fill remaining landmarks up to 478 with upper face / forehead mesh
  for (let i = 416; i <= 477; i++) {
    const t = (i - 416) / 61;
    const row = Math.floor(t * 6);
    const col = t * 6 - row;
    add(
      i,
      0.25 + col * 0.50 + (Math.random() - 0.5) * 0.01,
      0.08 + (row / 6) * 0.20 + (Math.random() - 0.5) * 0.01,
    );
  }

  // Sort by id for consistency
  landmarks.sort((a, b) => a.id - b.id);

  return landmarks;
}

// ---------------------------------------------------------------------------
// Teeth Region Generator (used by useMockAnalysis hook)
// ---------------------------------------------------------------------------

export function generateMockTeethRegions() {
  return isabellaAnalysis.teethRegions;
}

// Aliases for useMockAnalysis hook
export const mockShadeMatch = isabellaAnalysis.shadeMatch;
export const mockProportions = isabellaAnalysis.proportions;

// Keyed by caseId — used by DemoContext
export const mockAnalysisResults: Record<string, AnalysisResult> = {
  'case-001': isabellaAnalysis,
  'case-002': jonathanAnalysis,
};

// ---------------------------------------------------------------------------
// Dashboard Stats
// ---------------------------------------------------------------------------

export const dashboardStats = {
  activeCases: 3,
  scansToday: 1,
  avgCaseTime: '4.2 days',
  satisfaction: '98%',
};

// ---------------------------------------------------------------------------
// VITA Shade Guide Reference
// ---------------------------------------------------------------------------

export const VITA_SHADES: Record<string, { name: string; hex: string }> = {
  A1: { name: 'A1 — Light Reddish-Yellow', hex: '#F5E6C8' },
  A2: { name: 'A2 — Reddish-Yellow', hex: '#EEDBB5' },
  A3: { name: 'A3 — Dark Reddish-Yellow', hex: '#E5CFA0' },
  'A3.5': { name: 'A3.5 — Darker Reddish-Yellow', hex: '#DCC28C' },
  A4: { name: 'A4 — Darkest Reddish-Yellow', hex: '#D4B87A' },
  B1: { name: 'B1 — Light Yellow', hex: '#F7ECD1' },
  B2: { name: 'B2 — Yellow', hex: '#F0E0BA' },
  B3: { name: 'B3 — Dark Yellow', hex: '#E8D4A5' },
  B4: { name: 'B4 — Darkest Yellow', hex: '#DFC890' },
  BL1: { name: 'BL1 — Bleach Light', hex: '#FEFCF5' },
  BL2: { name: 'BL2 — Bleach', hex: '#FCF8EC' },
  C1: { name: 'C1 — Light Grayish', hex: '#EDE5D5' },
  C2: { name: 'C2 — Grayish', hex: '#E3DAC6' },
  D2: { name: 'D2 — Light Reddish-Gray', hex: '#EBE0CC' },
  D3: { name: 'D3 — Reddish-Gray', hex: '#E0D5BE' },
};
