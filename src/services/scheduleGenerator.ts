import { ScheduleDay } from '../types';

export const BIKE_ROTATION_TYPES = [
  {
    name: 'Bike Intervals',
    duration: 55,
    focus: 'High-intensity intervals: 5x3min VO2max surges on MTB (cadence >90 RPM) with 2min easy spin recovery.',
  },
  {
    name: 'Bike Long Ride',
    duration: 80,
    focus: 'Aerobic endurance base: 28-32km continuous steady spin. Primary focus: overcoming 17kg MTB drag.',
  },
  {
    name: 'Bike Brick Ride',
    duration: 60,
    focus: 'Race simulation brick: 20km hard tempo ride immediately paired with transition prep and simulated dismount.',
  },
];

export const generateTriMasterSchedule = (
  startDate: Date = new Date(2026, 8, 20), // 2026-09-20
  endDate: Date = new Date(2027, 11, 31)   // 2027-12-31
): ScheduleDay[] => {
  const schedule: ScheduleDay[] = [];
  const currentDate = new Date(startDate);
  
  // Align to beginning of day
  currentDate.setHours(0, 0, 0, 0);
  const targetEnd = new Date(endDate);
  targetEnd.setHours(0, 0, 0, 0);

  let bikeRotationIndex = 0;
  let weekIndex = 0;
  let currentWeekDays: { date: Date; minutes: number }[] = [];
  let previousWeekVolume = 330; // Baseline starting week minutes

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Temporary list to calculate weekly volumes first
  const rawDays: {
    date: Date;
    dateStr: string;
    dayOfWeek: string;
    sessionType: string;
    focus: string;
    phase: string;
    volumeMinutes: number;
    weekNum: number;
    cycleNum: number;
    phaseName: string;
  }[] = [];

  let dayCount = 0;
  while (currentDate <= targetEnd) {
    const dayOfWeekIndex = currentDate.getDay(); // 0 = Sun, 1 = Mon, ...
    const dayOfWeek = dayNames[dayOfWeekIndex];
    const dateStr = currentDate.toISOString().split('T')[0];

    // Compute week number relative to start (Monday considered start of athletic week)
    // 5-week cycle: Weeks 1-4 = Base, Week 5 = Recovery
    const cycleWeek = (weekIndex % 5) + 1; // 1 to 5
    const cycleNum = Math.floor(weekIndex / 5) + 1;

    let phaseName = '';
    let volumeScale = 1.0;

    if (cycleWeek === 1) {
      phaseName = `Base 1 (Cycle ${cycleNum})`;
      volumeScale = 1.0;
    } else if (cycleWeek === 2) {
      phaseName = `Base 2 (Cycle ${cycleNum})`;
      volumeScale = 1.08;
    } else if (cycleWeek === 3) {
      phaseName = `Base 3 (Cycle ${cycleNum})`;
      volumeScale = 1.15;
    } else if (cycleWeek === 4) {
      phaseName = `Base 4 Peak (Cycle ${cycleNum})`;
      volumeScale = 1.22;
    } else {
      phaseName = `Recovery Week (Cycle ${cycleNum})`;
      volumeScale = 0.65; // 35% deload for recovery
    }

    let sessionType = '';
    let focus = '';
    let baseVolume = 0;

    // Hard Rules:
    // 1. Mondays = REST / MOBILITY, no swim
    if (dayOfWeekIndex === 1) {
      sessionType = 'Rest / Mobility';
      focus = 'HARD REST DAY: Active foam rolling, hip/hamstring mobility & ankle flexibility. Strictly NO swim.';
      baseVolume = 25;
    }
    // 2. Swim every day except Monday (Tue, Wed, Thu, Fri, Sat, Sun)
    // 3. Bike Wed/Fri/Sun rotating Intervals, Long Ride, Brick Ride
    // 4. Run Tue/Thu alternating Tempo and Easy
    else if (dayOfWeekIndex === 2) {
      // Tuesday: Swim + Run
      const isTempo = weekIndex % 2 === 0;
      sessionType = 'Swim + Run';
      const swimDetail = 'Swim 750m (200m technique warm-up, 400m catch-up drills with pull buoy, 150m easy)';
      const runDetail = isTempo
        ? 'Run 5km TEMPO: 1km warm-up, 3km steady at target 5:25/km, 1km cooldown'
        : 'Run 5km EASY: Pure conversational aerobic base pace at 6:00/km';
      focus = `${swimDetail} | ${runDetail}`;
      baseVolume = 65;
    } else if (dayOfWeekIndex === 3) {
      // Wednesday: Swim + Bike (Bike rotates)
      const bike = BIKE_ROTATION_TYPES[bikeRotationIndex % BIKE_ROTATION_TYPES.length];
      bikeRotationIndex++;
      sessionType = 'Swim + Bike';
      const swimDetail = 'Swim 750m: 6x100m threshold pace on 3:00 send-off, stroke rate maintenance';
      focus = `${swimDetail} | ${bike.name}: ${bike.focus}`;
      baseVolume = 30 + bike.duration;
    } else if (dayOfWeekIndex === 4) {
      // Thursday: Swim + Run
      const isTempo = weekIndex % 2 !== 0; // Alternates with Tuesday
      sessionType = 'Swim + Run';
      const swimDetail = 'Swim 800m continuous aerobic engine building (~3:00/100m pace)';
      const runDetail = isTempo
        ? 'Run 5km TEMPO: 1km warm, 4x800m at 5:15/km pace (200m recovery jog), 1km cool'
        : 'Run 6km EASY: Low heart rate recovery run at 6:00/km';
      focus = `${swimDetail} | ${runDetail}`;
      baseVolume = 65;
    } else if (dayOfWeekIndex === 5) {
      // Friday: Swim + Bike (Bike rotates)
      const bike = BIKE_ROTATION_TYPES[bikeRotationIndex % BIKE_ROTATION_TYPES.length];
      bikeRotationIndex++;
      sessionType = 'Swim + Bike';
      const swimDetail = 'Swim 750m bilateral breathing & stroke efficiency practice';
      focus = `${swimDetail} | ${bike.name}: ${bike.focus}`;
      baseVolume = 30 + bike.duration;
    } else if (dayOfWeekIndex === 6) {
      // Saturday: Swim (Focus on 750m sprint distance calibration)
      sessionType = 'Swim';
      focus = 'Swim 750m RACE SIMULATION: Continuous timed 750m trial or open-water drafting drill (Target: ~22:30)';
      baseVolume = 40;
    } else if (dayOfWeekIndex === 0) {
      // Sunday: Swim + Bike (Bike rotates)
      const bike = BIKE_ROTATION_TYPES[bikeRotationIndex % BIKE_ROTATION_TYPES.length];
      bikeRotationIndex++;
      sessionType = 'Swim + Bike';
      const swimDetail = 'Swim 600m gentle recovery swim & sculling';
      focus = `${swimDetail} | ${bike.name}: ${bike.focus}`;
      baseVolume = 25 + bike.duration;
    }

    const calculatedVolume = Math.round(baseVolume * volumeScale);

    rawDays.push({
      date: new Date(currentDate),
      dateStr,
      dayOfWeek,
      sessionType,
      focus,
      phase: phaseName,
      volumeMinutes: calculatedVolume,
      weekNum: weekIndex,
      cycleNum,
      phaseName,
    });

    // Advance to next day
    currentDate.setDate(currentDate.getDate() + 1);
    dayCount++;

    // Check if Sunday just ended (or if date is Sunday), advance weekIndex
    if (dayOfWeekIndex === 0) {
      weekIndex++;
    }
  }

  // Calculate weekly volumes to detect >10% progression flags
  const weeklyTotals: { [week: number]: number } = {};
  rawDays.forEach((d) => {
    weeklyTotals[d.weekNum] = (weeklyTotals[d.weekNum] || 0) + d.volumeMinutes;
  });

  // Assemble final schedule days with safety flags
  rawDays.forEach((d) => {
    const currentWeekVol = weeklyTotals[d.weekNum] || 330;
    const priorWeekVol = d.weekNum > 0 ? (weeklyTotals[d.weekNum - 1] || currentWeekVol) : currentWeekVol;
    
    let volumeFlag = '✅ Safe Progression';
    if (d.phaseName.includes('Recovery')) {
      volumeFlag = '🧘 Deload / Recovery';
    } else if (d.weekNum === 0) {
      volumeFlag = '🏁 Baseline Week';
    } else {
      const percentageChange = ((currentWeekVol - priorWeekVol) / priorWeekVol) * 100;
      if (percentageChange > 10.01) {
        volumeFlag = `⚠️ Volume +${percentageChange.toFixed(1)}% (>10% Alert)`;
      } else {
        volumeFlag = `✅ +${percentageChange > 0 ? percentageChange.toFixed(1) : '0'}% Safe Progression`;
      }
    }

    schedule.push({
      date: d.dateStr,
      dayOfWeek: d.dayOfWeek,
      sessionType: d.sessionType,
      focus: d.focus,
      phase: d.phase,
      volumeMinutes: d.volumeMinutes,
      volumeFlag,
    });
  });

  return schedule;
};
