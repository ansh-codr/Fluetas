import { describe, it, expect } from 'vitest';
import {
  extractPeriodEpisodes,
  computeCompletedCycles,
  analyzeCycleData,
  buildMonthCalendarDays,
  isBleeding,
} from '../src/lib/cycle/calculator';
import { DailyCycleLog, CycleSettings } from '../src/lib/cycle/types';

describe('FLUETAS HER Cycle Tracker & Clinical Calculator', () => {
  // USER E: Empty / Unconfigured User
  it('USER E: handles zero cycle history and unconfigured state cleanly without fake predictions', () => {
    const analysis = analyzeCycleData([], undefined, '2026-09-03');

    expect(analysis.hasData).toBe(false);
    expect(analysis.configured).toBe(false);
    expect(analysis.currentCycleDay).toBeNull();
    expect(analysis.currentPhase).toBe('Unknown');
    expect(analysis.isPeriodToday).toBe(false);
    expect(analysis.lastPeriodStart).toBeNull();
    expect(analysis.predictedNextPeriodStart).toBeNull();
    expect(analysis.estimatedFertileWindowStart).toBeNull();
    expect(analysis.estimatedOvulationDate).toBeNull();
    expect(analysis.completedCycles).toHaveLength(0);
  });

  // Initial setup with typical length but no completed cycles yet
  it('handles initial setup configuration with honest low-confidence predictions', () => {
    const settings: CycleSettings = {
      configured: true,
      lastPeriodStartDate: '2026-08-25',
      typicalCycleLengthDays: 30,
      typicalPeriodDurationDays: 5,
      isRegular: true,
    };

    const analysis = analyzeCycleData([], settings, '2026-09-03');

    expect(analysis.hasData).toBe(true);
    expect(analysis.configured).toBe(true);
    // Aug 25 to Sep 3 = 9 days elapsed -> Cycle Day 10
    expect(analysis.currentCycleDay).toBe(10);
    expect(analysis.confidence).toBe('low');
    // Predicted next period: Aug 25 + 30 days = Sep 24
    expect(analysis.predictedNextPeriodStart).toBe('2026-09-24');
    // Estimated ovulation: Sep 24 - 14 days = Sep 10
    expect(analysis.estimatedOvulationDate).toBe('2026-09-10');
    // 6-day fertile window: Sep 5 to Sep 10
    expect(analysis.estimatedFertileWindowStart).toBe('2026-09-05');
    expect(analysis.estimatedFertileWindowEnd).toBe('2026-09-10');
  });

  // USER A: 28-day cycle
  it('USER A: correctly calculates 28-day cycle from actual bleeding logs', () => {
    const logs: DailyCycleLog[] = [
      // Period 1: Aug 1 to Aug 5
      { userId: 'userA', date: '2026-08-01', flow: 'heavy', source: 'MANUAL' },
      { userId: 'userA', date: '2026-08-02', flow: 'heavy', source: 'MANUAL' },
      { userId: 'userA', date: '2026-08-03', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userA', date: '2026-08-04', flow: 'light', source: 'MANUAL' },
      { userId: 'userA', date: '2026-08-05', flow: 'spotting', source: 'MANUAL' },

      // Period 2: Aug 29 to Sep 2 (28 days later)
      { userId: 'userA', date: '2026-08-29', flow: 'heavy', source: 'MANUAL' },
      { userId: 'userA', date: '2026-08-30', flow: 'heavy', source: 'MANUAL' },
      { userId: 'userA', date: '2026-08-31', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userA', date: '2026-09-01', flow: 'light', source: 'MANUAL' },
      { userId: 'userA', date: '2026-09-02', flow: 'spotting', source: 'MANUAL' },
    ];

    const episodes = extractPeriodEpisodes(logs);
    expect(episodes).toHaveLength(2);
    expect(episodes[0].startDate).toBe('2026-08-01');
    expect(episodes[1].startDate).toBe('2026-08-29');

    const completed = computeCompletedCycles(episodes);
    expect(completed).toHaveLength(1);
    expect(completed[0].lengthDays).toBe(28);
    expect(completed[0].periodDurationDays).toBe(5);

    const analysis = analyzeCycleData(logs, undefined, '2026-09-03');
    expect(analysis.averageCycleLength).toBe(28);
    // Aug 29 to Sep 3 = 5 days elapsed -> Cycle Day 6
    expect(analysis.currentCycleDay).toBe(6);
    // Predicted next period: Aug 29 + 28 days = Sep 26
    expect(analysis.predictedNextPeriodStart).toBe('2026-09-26');
    // Estimated ovulation: Sep 26 - 14 days = Sep 12
    expect(analysis.estimatedOvulationDate).toBe('2026-09-12');
    expect(analysis.estimatedFertileWindowStart).toBe('2026-09-07');
    expect(analysis.estimatedFertileWindowEnd).toBe('2026-09-12');
  });

  // USER B: 31-day cycle
  it('USER B: correctly calculates 31-day cycle and does not assume 28 days', () => {
    const logs: DailyCycleLog[] = [
      // Period 1: Aug 1 to Aug 5
      { userId: 'userB', date: '2026-08-01', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userB', date: '2026-08-02', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userB', date: '2026-08-03', flow: 'light', source: 'MANUAL' },

      // Period 2: Sep 1 to Sep 5 (31 days later)
      { userId: 'userB', date: '2026-09-01', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userB', date: '2026-09-02', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userB', date: '2026-09-03', flow: 'light', source: 'MANUAL' },
    ];

    const episodes = extractPeriodEpisodes(logs);
    expect(episodes).toHaveLength(2);

    const completed = computeCompletedCycles(episodes);
    expect(completed).toHaveLength(1);
    expect(completed[0].lengthDays).toBe(31);

    const analysis = analyzeCycleData(logs, undefined, '2026-09-03');
    expect(analysis.averageCycleLength).toBe(31);
    // Sep 1 to Sep 3 = 2 days elapsed -> Cycle Day 3
    expect(analysis.currentCycleDay).toBe(3);
    expect(analysis.isPeriodToday).toBe(true);
    expect(analysis.currentPhase).toBe('Menstrual');
    // Predicted next period: Sep 1 + 31 days = Oct 2
    expect(analysis.predictedNextPeriodStart).toBe('2026-10-02');
  });

  // USER C: Multi-cycle history (28, 31, 29, 30 days)
  it('USER C: computes accurate statistics across multiple variable cycles (28, 31, 29, 30 days)', () => {
    // Period starts:
    // P1: Jan 1
    // P2: Jan 29 (28 days)
    // P3: Mar 1 (31 days)
    // P4: Mar 30 (29 days)
    // P5: Apr 29 (30 days)
    const logs: DailyCycleLog[] = [
      { userId: 'userC', date: '2026-01-01', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userC', date: '2026-01-29', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userC', date: '2026-03-01', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userC', date: '2026-03-30', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userC', date: '2026-04-29', flow: 'moderate', source: 'MANUAL' },
    ];

    const analysis = analyzeCycleData(logs, undefined, '2026-05-10');

    expect(analysis.completedCycles).toHaveLength(4);
    const lengths = analysis.completedCycles.map(c => c.lengthDays);
    expect(lengths).toEqual([28, 31, 29, 30]);

    // Average: (28 + 31 + 29 + 30) / 4 = 29.5 -> 30 days
    expect(analysis.averageCycleLength).toBe(30);
    expect(analysis.minCycleLength).toBe(28);
    expect(analysis.maxCycleLength).toBe(31);
    expect(analysis.variabilityDays).toBe(3);
    expect(analysis.confidence).toBe('high');
  });

  // Cycle Factors: Pregnancy or Contraception suppresses misleading fertile predictions
  it('suppresses fertile and period predictions when pregnancy or contraception factor is active', () => {
    const logs: DailyCycleLog[] = [
      { userId: 'userFac', date: '2026-08-01', flow: 'moderate', source: 'MANUAL' },
      { userId: 'userFac', date: '2026-08-29', flow: 'moderate', source: 'MANUAL' },
    ];

    const settings: CycleSettings = {
      configured: true,
      activeFactors: ['hormonal_contraception'],
    };

    const analysis = analyzeCycleData(logs, settings, '2026-09-03');

    expect(analysis.factorsSuppressingPredictions).toBe(true);
    expect(analysis.predictedNextPeriodStart).toBeNull();
    expect(analysis.estimatedFertileWindowStart).toBeNull();
    expect(analysis.estimatedOvulationDate).toBeNull();
    expect(analysis.insights.some(i => i.includes('paused because you selected: hormonal contraception'))).toBe(true);
  });

  // Calendar Matrix generation
  it('builds a complete 42-cell calendar grid for a given month with correct status flags', () => {
    const logs: DailyCycleLog[] = [
      { userId: 'u1', date: '2026-09-01', flow: 'heavy', source: 'MANUAL' },
      { userId: 'u1', date: '2026-09-02', flow: 'moderate', symptoms: ['cramps'], source: 'MANUAL' },
    ];

    const analysis = analyzeCycleData(logs, undefined, '2026-09-03');
    // September 2026: Month index 8
    const days = buildMonthCalendarDays(2026, 8, logs, analysis, '2026-09-02');

    expect(days.length).toBeGreaterThanOrEqual(35);

    const sep1 = days.find(d => d.date === '2026-09-01')!;
    expect(sep1).toBeDefined();
    expect(sep1.hasBleeding).toBe(true);
    expect(sep1.bleedingFlow).toBe('heavy');
    expect(sep1.phase).toBe('Menstrual');

    const sep2 = days.find(d => d.date === '2026-09-02')!;
    expect(sep2).toBeDefined();
    expect(sep2.hasSymptoms).toBe(true);
    expect(sep2.isSelected).toBe(true);
  });
});
