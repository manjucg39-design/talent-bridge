export interface MatchInput {
  studentAge: number;
  studentSport: string;
  studentState: string;
  studentDistrict: string;
  studentGender: string;
  performanceScore: number;
  opportunity: {
    sport: string;
    ageMin: number;
    ageMax: number;
    gender: string;
    state: string;
    district: string;
    registrationDeadline: Date;
    status: string;
    verificationStatus: string;
  };
}

export interface MatchResult {
  matchScore: number;
  matchReasons: string[];
  eligible: boolean;
}

export function calculateMatch(input: MatchInput): MatchResult {
  const { studentAge, studentSport, studentState, studentDistrict, studentGender, performanceScore, opportunity } = input;

  if (opportunity.status !== 'published' || opportunity.verificationStatus !== 'approved') {
    return { matchScore: 0, matchReasons: [], eligible: false };
  }
  if (new Date(opportunity.registrationDeadline) < new Date()) {
    return { matchScore: 0, matchReasons: ['Registration closed'], eligible: false };
  }

  // Sport must match — hard requirement
  if (studentSport.toLowerCase() !== opportunity.sport.toLowerCase()) {
    return { matchScore: 0, matchReasons: ['Sport does not match'], eligible: false };
  }

  // Age must be eligible — hard requirement
  if (studentAge < opportunity.ageMin || studentAge > opportunity.ageMax) {
    return { matchScore: 0, matchReasons: ['Age not eligible'], eligible: false };
  }

  const reasons: string[] = [];
  let score = 0;

  score += 35; reasons.push('Sport matches');
  score += 25; reasons.push('Age eligible');

  if (opportunity.gender === 'all' || opportunity.gender === studentGender) {
    score += 15; reasons.push('Gender eligible');
  }

  if (studentState.toLowerCase() === opportunity.state.toLowerCase()) {
    score += 10; reasons.push('Same state');
    if (studentDistrict.toLowerCase() === (opportunity.district || '').toLowerCase()) {
      score += 5; reasons.push('Same district');
    }
  }

  if (performanceScore >= 75)      { score += 10; reasons.push('Strong performance profile'); }
  else if (performanceScore >= 60) { score += 5;  reasons.push('Eligible performance level'); }

  return { matchScore: Math.min(score, 100), matchReasons: reasons, eligible: score >= 50 };
}
