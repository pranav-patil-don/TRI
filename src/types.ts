export type SessionType = 'Swim' | 'Bike' | 'Run' | 'Rest' | 'Brick';

export interface AthleteProfile {
  name: string;
  age: number;
  targetRaceTime: string; // '01:10:00'
  targetDate: string; // '2027-12-31'
  swimBaseline: string; // 750m in 22-24 min (~3:00/100m)
  bikeBaseline: string; // 20km in 52 min (~23 km/h) on 17kg MTB
  runBaseline: string; // 5km at 5:36/km
  t1Baseline: string; // 01:30
  t2Baseline: string; // 01:30
}

export interface ScheduleDay {
  date: string; // YYYY-MM-DD
  dayOfWeek: string; // Monday, Tuesday, etc.
  sessionType: string; // e.g. "REST / MOBILITY" or "Swim + Bike"
  focus: string; // Details of workout
  phase: string; // Base 1, Base 2, Base 3, Base 4, Recovery
  volumeMinutes: number;
  volumeFlag: string; // 'Safe' | 'Over 10% Alert' | 'Baseline'
}

export interface WorkoutLogEntry {
  id?: string;
  date: string;
  sessionType: SessionType;
  distance: string;
  duration: string; // HH:MM:SS or MM:SS
  paceOrSpeed: string;
  rpe: number; // 1-10
  notes: string;
}

export interface BenchmarkItem {
  discipline: string;
  distance: string;
  currentMetric: string;
  targetMetric: string;
  gap: string;
  weeklyImprovementNeeded: string;
  notes: string;
  status: 'maintenance' | 'bottleneck' | 'progression' | 'fixed';
}

export interface SheetCreationStatus {
  step: 'idle' | 'authorizing' | 'creating' | 'populating' | 'formatting' | 'completed' | 'error';
  message: string;
  spreadsheetId?: string;
  spreadsheetUrl?: string;
}
