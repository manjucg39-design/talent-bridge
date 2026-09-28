"""
Preliminary scoring engine.
No computer vision. Scores based on fitness measurements vs age-appropriate benchmarks.
Future: plug in MediaPipe/OpenCV pose detection here.
"""

BENCHMARKS = {
    "sprint": {
        "100m_u14": {"excellent": 13.5, "good": 14.5, "average": 16.0, "lower_is_better": True},
        "100m_u17": {"excellent": 12.5, "good": 13.5, "average": 15.0, "lower_is_better": True},
        "60m_u12": {"excellent": 9.0, "good": 10.0, "average": 11.5, "lower_is_better": True},
    },
    "jump": {
        "long_jump_u14": {"excellent": 4.5, "good": 3.8, "average": 3.0, "lower_is_better": False},
        "long_jump_u17": {"excellent": 5.5, "good": 4.8, "average": 4.0, "lower_is_better": False},
    },
    "endurance": {
        "1500m_u14": {"excellent": 360, "good": 420, "average": 480, "lower_is_better": True},
        "1500m_u17": {"excellent": 300, "good": 360, "average": 420, "lower_is_better": True},
    },
    "agility": {
        "t_test_u14": {"excellent": 9.5, "good": 10.5, "average": 12.0, "lower_is_better": True},
    },
    "strength": {
        "pushups_u14": {"excellent": 25, "good": 18, "average": 12, "lower_is_better": False},
        "pushups_u17": {"excellent": 35, "good": 25, "average": 18, "lower_is_better": False},
    },
}

def get_age_group(age: int) -> str:
    if age <= 12: return "u12"
    if age <= 14: return "u14"
    if age <= 17: return "u17"
    return "u20"

def score_metric(value: float, bm: dict) -> float:
    e, g, a = bm["excellent"], bm["good"], bm["average"]
    lib = bm.get("lower_is_better", False)
    if lib:
        if value <= e: return 95
        if value <= g: return 80
        if value <= a: return 60
        return max(20, 60 - ((value - a) / a) * 40)
    else:
        if value >= e: return 95
        if value >= g: return 80
        if value >= a: return 60
        return max(20, 60 - ((a - value) / a) * 40)

def run_assessment(req: dict) -> dict:
    age_group = get_age_group(req["age"])
    test_type = req["testType"]
    measurements = req["measurements"]
    previous_score = req.get("previousScore")

    scores, strengths, improvements = [], [], []
    test_bms = BENCHMARKS.get(test_type, {})

    for key, val in measurements.items():
        bm_key = f"{key}_{age_group}"
        bm = test_bms.get(bm_key)
        if not bm:
            continue
        s = score_metric(float(val), bm)
        scores.append(s)
        if s >= 80:
            strengths.append(key.replace("_", " ").title())
        elif s < 60:
            improvements.append(key.replace("_", " ").title())

    if not scores:
        scores = [65]

    perf_score = round(sum(scores) / len(scores))
    potential_flag = perf_score >= 78
    improvement_flag = previous_score is not None and (perf_score - previous_score) >= 8

    if potential_flag:
        recommendation = "Performance indicates potential. Consider further coaching evaluation."
    elif improvement_flag:
        recommendation = "Significant improvement detected. Recommend advanced training programme."
    else:
        recommendation = "Continue regular training and reassess in 3 months."

    return {
        "assessmentType": "preliminary",
        "performanceScore": perf_score,
        "potentialFlag": potential_flag,
        "improvementFlag": improvement_flag,
        "strengthAreas": strengths or ["General fitness"],
        "improvementAreas": improvements,
        "recommendation": recommendation,
        "confidenceScore": min(95, 50 + len(scores) * 10),
    }
