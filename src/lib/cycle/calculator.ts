import {
  DailyCycleLog,
  CycleSettings,
  HistoricalCycle,
  CycleAnalysis,
  DayCalendarInfo,
  BleedingFlow,
} from './types';

function parseDate(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
}

function formatDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(dateStr: string, days: number): string {
  const d = parseDate(dateStr);
  d.setDate(d.getDate() + days);
  return formatDate(d);
}

function diffDays(startStr: string, endStr: string): number {
  const d1 = parseDate(startStr);
  const d2 = parseDate(endStr);
  const ms = d2.getTime() - d1.getTime();
  return Math.round(ms / (1000 * 60 * 60 * 24));
}

export function isBleeding(flow?: BleedingFlow): boolean {
  return flow === 'spotting' || flow === 'light' || flow === 'moderate' || flow === 'heavy';
}

interface PeriodEpisode {
  startDate: string;
  endDate: string;
  bleedDates: string[];
}

/**
 * Groups daily logs into distinct menstrual bleeding episodes.
 * Bleed days separated by 1 or 2 non-bleed days are grouped into the same period.
 * Gaps of > 2 days demarcate a new period.
 */
export function extractPeriodEpisodes(
  logs: DailyCycleLog[],
  settings?: CycleSettings
): PeriodEpisode[] {
  // Extract all dates where bleeding was recorded
  const bleedLogs = logs
    .filter(l => isBleeding(l.flow))
    .map(l => l.date)
    .sort();

  // If user provided a setup baseline lastPeriodStartDate not yet in logs, include it
  if (settings?.lastPeriodStartDate && !bleedLogs.includes(settings.lastPeriodStartDate)) {
    bleedLogs.push(settings.lastPeriodStartDate);
    bleedLogs.sort();
  }

  if (bleedLogs.length === 0) return [];

  const episodes: PeriodEpisode[] = [];
  let currentEpisode: string[] = [bleedLogs[0]];

  for (let i = 1; i < bleedLogs.length; i++) {
    const prev = currentEpisode[currentEpisode.length - 1];
    const curr = bleedLogs[i];
    const gap = diffDays(prev, curr);

    if (gap <= 3) {
      // Continuation of current period
      currentEpisode.push(curr);
    } else {
      // New period started
      episodes.push({
        startDate: currentEpisode[0],
        endDate: currentEpisode[currentEpisode.length - 1],
        bleedDates: [...currentEpisode],
      });
      currentEpisode = [curr];
    }
  }

  if (currentEpisode.length > 0) {
    episodes.push({
      startDate: currentEpisode[0],
      endDate: currentEpisode[currentEpisode.length - 1],
      bleedDates: [...currentEpisode],
    });
  }

  return episodes;
}

/**
 * Computes historical cycles from consecutive period episodes.
 * Cycle length is from First day of period N -> Day before next period N+1.
 */
export function computeCompletedCycles(episodes: PeriodEpisode[]): HistoricalCycle[] {
  if (episodes.length < 2) return [];

  const cycles: HistoricalCycle[] = [];

  for (let i = 0; i < episodes.length - 1; i++) {
    const currentEpisode = episodes[i];
    const nextEpisode = episodes[i + 1];

    const cycleLength = diffDays(currentEpisode.startDate, nextEpisode.startDate);
    // Biological cycles are typically 18 to 65 days
    if (cycleLength >= 18 && cycleLength <= 65) {
      const cycleEnd = addDays(nextEpisode.startDate, -1);
      const periodDuration = diffDays(currentEpisode.startDate, currentEpisode.endDate) + 1;

      cycles.push({
        id: `cycle_${i + 1}_${currentEpisode.startDate}`,
        cycleNumber: i + 1,
        startDate: currentEpisode.startDate,
        endDate: cycleEnd,
        lengthDays: cycleLength,
        periodDurationDays: Math.max(1, periodDuration),
        bleedDates: currentEpisode.bleedDates,
      });
    }
  }

  return cycles;
}

/**
 * Core clinical cycle analysis engine.
 * Derives current cycle day, phases, predictions, and variability from real data.
 */
export function analyzeCycleData(
  logs: DailyCycleLog[],
  settings?: CycleSettings,
  referenceDateStr?: string
): CycleAnalysis {
  const todayStr = referenceDateStr || formatDate(new Date());
  const configured = Boolean(settings?.configured || logs.length > 0);

  const episodes = extractPeriodEpisodes(logs, settings);
  const completedCycles = computeCompletedCycles(episodes);

  // Check if cycle factors suppress natural predictions
  const hasSuppressiveFactor = Boolean(
    settings?.activeFactors?.some(
      f => f === 'pregnancy' || f === 'hormonal_contraception' || f === 'lactation'
    )
  );

  if (episodes.length === 0) {
    return {
      hasData: false,
      configured,
      currentCycleDay: null,
      currentPhase: 'Unknown',
      isPeriodToday: false,
      lastPeriodStart: null,
      lastPeriodEnd: null,
      averageCycleLength: settings?.typicalCycleLengthDays || null,
      averagePeriodDuration: settings?.typicalPeriodDurationDays || null,
      minCycleLength: null,
      maxCycleLength: null,
      variabilityDays: null,
      completedCycles: [],
      predictedNextPeriodStart: null,
      estimatedFertileWindowStart: null,
      estimatedFertileWindowEnd: null,
      estimatedOvulationDate: null,
      factorsSuppressingPredictions: hasSuppressiveFactor,
      confidence: 'none',
      insights: [
        'Set up Cycle Tracking or log your last period to calculate your personal cycle metrics.',
      ],
    };
  }

  // Active / Most recent period episode
  const latestEpisode = episodes[episodes.length - 1];
  const lastPeriodStart = latestEpisode.startDate;
  const lastPeriodEnd = latestEpisode.endDate;

  // Current Cycle Day
  const daysSincePeriodStart = diffDays(lastPeriodStart, todayStr);
  const currentCycleDay = daysSincePeriodStart >= 0 ? daysSincePeriodStart + 1 : null;

  // Check if today is a bleeding day
  const todayLog = logs.find(l => l.date === todayStr);
  const isPeriodToday = isBleeding(todayLog?.flow);

  // Cycle Statistics
  let averageCycleLength: number | null = null;
  let minCycleLength: number | null = null;
  let maxCycleLength: number | null = null;
  let variabilityDays: number | null = null;
  let averagePeriodDuration: number | null = null;

  if (completedCycles.length > 0) {
    const lengths = completedCycles.map(c => c.lengthDays);
    const durations = completedCycles.map(c => c.periodDurationDays);

    averageCycleLength = Math.round(lengths.reduce((a, b) => a + b, 0) / lengths.length);
    minCycleLength = Math.min(...lengths);
    maxCycleLength = Math.max(...lengths);
    variabilityDays = maxCycleLength - minCycleLength;
    averagePeriodDuration = Math.round(durations.reduce((a, b) => a + b, 0) / durations.length);
  } else {
    // Fallback to configured typical values if no completed cycles yet
    averageCycleLength = settings?.typicalCycleLengthDays || null;
    averagePeriodDuration =
      settings?.typicalPeriodDurationDays ||
      diffDays(latestEpisode.startDate, latestEpisode.endDate) + 1;
  }

  // Determine Confidence
  let confidence: 'high' | 'moderate' | 'low' | 'none' = 'none';
  if (completedCycles.length >= 3) {
    confidence = 'high';
  } else if (completedCycles.length >= 1) {
    confidence = 'moderate';
  } else if (settings?.typicalCycleLengthDays || episodes.length >= 1) {
    confidence = 'low';
  }

  // Predictions (unless suppressed by cycle factors like contraception or pregnancy)
  let predictedNextPeriodStart: string | null = null;
  let estimatedFertileWindowStart: string | null = null;
  let estimatedFertileWindowEnd: string | null = null;
  let estimatedOvulationDate: string | null = null;

  if (!hasSuppressiveFactor && averageCycleLength && lastPeriodStart) {
    predictedNextPeriodStart = addDays(lastPeriodStart, averageCycleLength);

    // Luteal phase is standardly 14 days before next period start
    estimatedOvulationDate = addDays(predictedNextPeriodStart, -14);

    // Standard 6-day fertile window: 5 days prior to ovulation + ovulation day
    estimatedFertileWindowStart = addDays(estimatedOvulationDate, -5);
    estimatedFertileWindowEnd = estimatedOvulationDate;
  }

  // Current Phase for today
  let currentPhase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown' = 'Unknown';
  if (isPeriodToday || (daysSincePeriodStart >= 0 && daysSincePeriodStart < (averagePeriodDuration || 5))) {
    currentPhase = 'Menstrual';
  } else if (estimatedFertileWindowStart && estimatedFertileWindowEnd) {
    if (todayStr >= estimatedFertileWindowStart && todayStr <= estimatedFertileWindowEnd) {
      currentPhase = 'Ovulation';
    } else if (todayStr < estimatedFertileWindowStart) {
      currentPhase = 'Follicular';
    } else if (todayStr > estimatedFertileWindowEnd) {
      currentPhase = 'Luteal';
    }
  } else if (currentCycleDay) {
    if (currentCycleDay <= 5) currentPhase = 'Menstrual';
    else if (currentCycleDay <= 13) currentPhase = 'Follicular';
    else if (currentCycleDay <= 17) currentPhase = 'Ovulation';
    else currentPhase = 'Luteal';
  }

  // Evidence-based Insights
  const insights: string[] = [];

  if (hasSuppressiveFactor) {
    const factorNames = settings?.activeFactors
      ?.filter(f => f !== 'none')
      .map(f => f.replace(/_/g, ' '))
      .join(', ');
    insights.push(
      `Fertility window and period predictions are paused because you selected: ${factorNames}.`
    );
  } else if (completedCycles.length > 0) {
    insights.push(`Your average cycle length across logged cycles is ${averageCycleLength} days.`);
    if (variabilityDays !== null) {
      if (variabilityDays <= 4) {
        insights.push(
          `Your cycle length has varied by only ${variabilityDays} days, showing high regularity.`
        );
      } else {
        insights.push(
          `Your recent cycles ranged from ${minCycleLength} to ${maxCycleLength} days (variability of ${variabilityDays} days).`
        );
      }
    }
    if (predictedNextPeriodStart) {
      insights.push(
        `Your next period is estimated to begin around ${new Date(parseDate(predictedNextPeriodStart)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}.`
      );
    }
  } else if (averageCycleLength) {
    insights.push(
      `Initial predictions are based on your typical ${averageCycleLength}-day cycle setup. Log regular period days to build historical precision.`
    );
  }

  return {
    hasData: true,
    configured,
    currentCycleDay,
    currentPhase,
    isPeriodToday,
    lastPeriodStart,
    lastPeriodEnd,
    averageCycleLength,
    averagePeriodDuration,
    minCycleLength,
    maxCycleLength,
    variabilityDays,
    completedCycles,
    predictedNextPeriodStart,
    estimatedFertileWindowStart,
    estimatedFertileWindowEnd,
    estimatedOvulationDate,
    factorsSuppressingPredictions: hasSuppressiveFactor,
    confidence,
    insights,
  };
}

/**
 * Builds day-by-day calendar data for a specified month and year (e.g. 2026, 8 for September).
 */
export function buildMonthCalendarDays(
  year: number,
  monthIndex: number, // 0-indexed (0 = Jan, 8 = Sep)
  logs: DailyCycleLog[],
  analysis: CycleAnalysis,
  selectedDateStr: string
): DayCalendarInfo[] {
  const todayStr = formatDate(new Date());
  const firstDayOfMonth = new Date(year, monthIndex, 1);
  const lastDayOfMonth = new Date(year, monthIndex + 1, 0);

  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 = Sun
  const totalDays = lastDayOfMonth.getDate();

  const days: DayCalendarInfo[] = [];

  // 1. Previous month trailing days for grid alignment
  const prevMonthLastDay = new Date(year, monthIndex, 0).getDate();
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const prevDate = new Date(year, monthIndex - 1, prevMonthLastDay - i);
    const dateStr = formatDate(prevDate);
    const log = logs.find(l => l.date === dateStr);
    days.push(createDayInfo(prevDate, dateStr, false, log, analysis, selectedDateStr, todayStr));
  }

  // 2. Current month days
  for (let d = 1; d <= totalDays; d++) {
    const currentDate = new Date(year, monthIndex, d);
    const dateStr = formatDate(currentDate);
    const log = logs.find(l => l.date === dateStr);
    days.push(createDayInfo(currentDate, dateStr, true, log, analysis, selectedDateStr, todayStr));
  }

  // 3. Next month leading days to complete full 7-day row grid (35 or 42 cells)
  const targetTotal = days.length <= 35 ? 35 : 42;
  const remaining = targetTotal - days.length;
  for (let d = 1; d <= remaining; d++) {
    const nextDate = new Date(year, monthIndex + 1, d);
    const dateStr = formatDate(nextDate);
    const log = logs.find(l => l.date === dateStr);
    days.push(createDayInfo(nextDate, dateStr, false, log, analysis, selectedDateStr, todayStr));
  }

  return days;
}

function createDayInfo(
  dateObj: Date,
  dateStr: string,
  isCurrentMonth: boolean,
  log: DailyCycleLog | undefined,
  analysis: CycleAnalysis,
  selectedDateStr: string,
  todayStr: string
): DayCalendarInfo {
  const hasBleeding = Boolean(log && isBleeding(log.flow));
  const hasSymptoms = Boolean(log && (log.symptoms?.length || log.mood || log.energy));
  const hasObservedLhPeak = log?.lhTest === 'positive';

  // Predicted period
  const isPredictedPeriod = Boolean(
    !hasBleeding &&
      !analysis.factorsSuppressingPredictions &&
      analysis.predictedNextPeriodStart &&
      dateStr >= analysis.predictedNextPeriodStart &&
      dateStr <= addDays(analysis.predictedNextPeriodStart, (analysis.averagePeriodDuration || 5) - 1)
  );

  // Estimated fertile window
  const isEstimatedFertile = Boolean(
    !analysis.factorsSuppressingPredictions &&
      analysis.estimatedFertileWindowStart &&
      analysis.estimatedFertileWindowEnd &&
      dateStr >= analysis.estimatedFertileWindowStart &&
      dateStr <= analysis.estimatedFertileWindowEnd
  );

  const isEstimatedOvulation = Boolean(
    !analysis.factorsSuppressingPredictions &&
      analysis.estimatedOvulationDate &&
      dateStr === analysis.estimatedOvulationDate
  );

  let phase: 'Menstrual' | 'Follicular' | 'Ovulation' | 'Luteal' | 'Unknown' = 'Unknown';
  if (hasBleeding || isPredictedPeriod) phase = 'Menstrual';
  else if (isEstimatedFertile || isEstimatedOvulation) phase = 'Ovulation';
  else if (analysis.lastPeriodStart && dateStr > analysis.lastPeriodStart && (!analysis.estimatedFertileWindowStart || dateStr < analysis.estimatedFertileWindowStart)) {
    phase = 'Follicular';
  } else if (analysis.estimatedFertileWindowEnd && dateStr > analysis.estimatedFertileWindowEnd) {
    phase = 'Luteal';
  }

  return {
    date: dateStr,
    dayNumber: dateObj.getDate(),
    isToday: dateStr === todayStr,
    isSelected: dateStr === selectedDateStr,
    isCurrentMonth,
    log,
    hasBleeding,
    bleedingFlow: log?.flow,
    isPredictedPeriod,
    isEstimatedFertile,
    isEstimatedOvulation,
    hasObservedLhPeak,
    hasSymptoms,
    phase,
  };
}
