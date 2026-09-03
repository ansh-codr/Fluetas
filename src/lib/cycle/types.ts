export type BleedingFlow = 'none' | 'spotting' | 'light' | 'moderate' | 'heavy';

export type MoodType = 'good' | 'neutral' | 'low' | 'anxious' | 'irritable' | 'mood_swings';

export type EnergyType = 'low' | 'normal' | 'high';

export type CervicalMucus = 'dry' | 'sticky' | 'creamy' | 'watery' | 'egg_white';

export type LHTestResult = 'negative' | 'positive' | 'not_tested';

export type CycleFactor = 'none' | 'pregnancy' | 'lactation' | 'hormonal_contraception' | 'other';

export const CYCLE_SYMPTOMS_LIST = [
  { id: 'cramps', label: 'Abdominal Cramps', category: 'Pain' },
  { id: 'headache', label: 'Headache', category: 'Pain' },
  { id: 'back_pain', label: 'Lower Back Pain', category: 'Pain' },
  { id: 'bloating', label: 'Bloating', category: 'Digestion' },
  { id: 'breast_tenderness', label: 'Breast Tenderness', category: 'Body' },
  { id: 'acne', label: 'Skin Flare-up / Acne', category: 'Body' },
  { id: 'nausea', label: 'Nausea', category: 'Digestion' },
  { id: 'fatigue', label: 'Fatigue / Low Stamina', category: 'Energy' },
  { id: 'mood_swings', label: 'Mood Swings', category: 'Mental' },
  { id: 'cravings', label: 'Food Cravings', category: 'Diet' },
  { id: 'hot_flashes', label: 'Hot Flashes', category: 'Temperature' },
  { id: 'insomnia', label: 'Sleep Disruption', category: 'Sleep' },
] as const;

export interface CycleSettings {
  configured: boolean;
  lastPeriodStartDate?: string; // YYYY-MM-DD
  typicalPeriodDurationDays?: number; // e.g. 5
  typicalCycleLengthDays?: number; // e.g. 29 (not forced to 28)
  isRegular?: boolean | 'unknown';
  activeFactors?: CycleFactor[];
  updatedAt?: number;
}

export interface DailyCycleLog {
  id?: string;
  userId: string;
  date: string; // YYYY-MM-DD
  flow?: BleedingFlow;
  symptoms?: string[];
  mood?: MoodType;
  energy?: EnergyType;
  cervicalMucus?: CervicalMucus;
  bbt?: number; // Basal Body Temperature in Celsius
  lhTest?: LHTestResult;
  notes?: string;
  source: 'MANUAL' | 'APPLE_HEALTH' | 'FITBIT' | 'GARMIN' | 'OTHER_DEVICE';
  createdAt?: any;
  updatedAt?: any;
}

export interface HistoricalCycle {
  id: string;
  cycleNumber: number;
  startDate: string; // YYYY-MM-DD (first day of bleeding)
  endDate: string; // YYYY-MM-DD (day before next period)
  lengthDays: number;
  periodDurationDays: number;
  bleedDates: string[];
}

export interface CycleAnalysis {
  hasData: boolean;
  configured: boolean;
  currentCycleDay: number | null;
  currentPhase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';
  isPeriodToday: boolean;
  lastPeriodStart: string | null;
  lastPeriodEnd: string | null;
  averageCycleLength: number | null;
  averagePeriodDuration: number | null;
  minCycleLength: number | null;
  maxCycleLength: number | null;
  variabilityDays: number | null;
  completedCycles: HistoricalCycle[];
  predictedNextPeriodStart: string | null;
  estimatedFertileWindowStart: string | null;
  estimatedFertileWindowEnd: string | null;
  estimatedOvulationDate: string | null;
  factorsSuppressingPredictions: boolean;
  confidence: 'high' | 'moderate' | 'low' | 'none';
  insights: string[];
}

export interface DayCalendarInfo {
  date: string; // YYYY-MM-DD
  dayNumber: number;
  isToday: boolean;
  isSelected: boolean;
  isCurrentMonth: boolean;
  log?: DailyCycleLog;
  hasBleeding: boolean;
  bleedingFlow?: BleedingFlow;
  isPredictedPeriod: boolean;
  isEstimatedFertile: boolean;
  isEstimatedOvulation: boolean;
  hasObservedLhPeak: boolean;
  hasSymptoms: boolean;
  phase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown';
}
