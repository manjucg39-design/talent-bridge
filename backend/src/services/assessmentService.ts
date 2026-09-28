const benchmarks: Record<string, Record<string, { excellent: number; good: number; average: number; unit: string; lowerIsBetter?: boolean }>> = {
  sprint: {
    '100m_u14': { excellent: 13.5, good: 14.5, average: 16.0, unit: 'seconds', lowerIsBetter: true },
    '100m_u17': { excellent: 12.5, good: 13.5, average: 15.0, unit: 'seconds', lowerIsBetter: true },
    '100m_u20': { excellent: 11.5, good: 12.5, average: 14.0, unit: 'seconds', lowerIsBetter: true },
    '60m_u12':  { excellent: 9.0,  good: 10.0, average: 11.5, unit: 'seconds', lowerIsBetter: true },
  },
  jump: {
    'long_jump_u14': { excellent: 4.5, good: 3.8, average: 3.0, unit: 'meters' },
    'long_jump_u17': { excellent: 5.5, good: 4.8, average: 4.0, unit: 'meters' },
    'high_jump_u14': { excellent: 1.4, good: 1.2, average: 1.0, unit: 'meters' },
    'high_jump_u17': { excellent: 1.6, good: 1.4, average: 1.2, unit: 'meters' },
  },
  endurance: {
    '1500m_u14': { excellent: 360, good: 420, average: 480, unit: 'seconds', lowerIsBetter: true },
    '1500m_u17': { excellent: 300, good: 360, average: 420, unit: 'seconds', lowerIsBetter: true },
    '800m_u12':  { excellent: 180, good: 210, average: 240, unit: 'seconds', lowerIsBetter: true },
  },
  agility: {
    't_test_u14': { excellent: 9.5,  good: 10.5, average: 12.0, unit: 'seconds', lowerIsBetter: true },
    't_test_u17': { excellent: 8.5,  good: 9.5,  average: 11.0, unit: 'seconds', lowerIsBetter: true },
  },
  strength: {
    'pushups_u14': { excellent: 25, good: 18, average: 12, unit: 'reps' },
    'pushups_u17': { excellent: 35, good: 25, average: 18, unit: 'reps' },
    'situps_u14':  { excellent: 30, good: 22, average: 15, unit: 'reps' },
  },
};

export function getAgeGroup(age: number): string {
  if (age <= 12) return 'u12';
  if (age <= 14) return 'u14';
  if (age <= 17) return 'u17';
  return 'u20';
}

function scoreMetric(value: number, bm: { excellent: number; good: number; average: number; lowerIsBetter?: boolean }): number {
  const { excellent, good, average, lowerIsBetter } = bm;
  if (lowerIsBetter) {
    if (value <= excellent) return 95;
    if (value <= good)      return 80;
    if (value <= average)   return 60;
    return Math.max(20, 60 - ((value - average) / average) * 40);
  } else {
    if (value >= excellent) return 95;
    if (value >= good)      return 80;
    if (value >= average)   return 60;
    return Math.max(20, 60 - ((average - value) / average) * 40);
  }
}

export interface AssessmentInput {
  studentId: string;
  testId: string;
  testType: string;
  measurements: Record<string, number | string>;
  age: number;
  sport: string;
  previousScore?: number;
}

export interface AssessmentResult {
  assessmentType: 'preliminary';
  performanceScore: number;
  potentialFlag: boolean;
  improvementFlag: boolean;
  strengthAreas: string[];
  improvementAreas: string[];
  recommendation: string;
  confidenceScore: number;
}

export function runAssessment(input: AssessmentInput): AssessmentResult {
  const ageGroup = getAgeGroup(input.age);
  const testBenchmarks = benchmarks[input.testType] || {};
  const scores: number[] = [];
  const strengthAreas: string[] = [];
  const improvementAreas: string[] = [];

  for (const [key, val] of Object.entries(input.measurements)) {
    if (typeof val !== 'number') continue;
    const bm = testBenchmarks[`${key}_${ageGroup}`];
    if (!bm) continue;
    const s = scoreMetric(val, bm);
    scores.push(s);
    if (s >= 80) strengthAreas.push(key.replace(/_/g, ' '));
    else if (s < 60) improvementAreas.push(key.replace(/_/g, ' '));
  }

  if (scores.length === 0) scores.push(65);

  const performanceScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const potentialFlag   = performanceScore >= 78;
  const improvementFlag = input.previousScore !== undefined && performanceScore - input.previousScore >= 8;

  let recommendation = 'Continue regular training and reassess in 3 months.';
  if (potentialFlag)   recommendation = 'Performance indicates potential. Consider further coaching evaluation.';
  if (improvementFlag) recommendation = 'Significant improvement detected. Recommend advanced training programme.';

  return {
    assessmentType: 'preliminary',
    performanceScore,
    potentialFlag,
    improvementFlag,
    strengthAreas:   strengthAreas.length   ? strengthAreas   : ['General fitness'],
    improvementAreas: improvementAreas.length ? improvementAreas : [],
    recommendation,
    confidenceScore: Math.min(95, 50 + scores.length * 10),
  };
}
