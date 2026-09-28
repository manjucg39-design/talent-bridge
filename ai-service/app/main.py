from fastapi import FastAPI
from pydantic import BaseModel
from typing import Dict, Optional, List
from app.services.scorer import run_assessment

app = FastAPI(title="RTN AI Service", description="Preliminary AI-assisted athlete assessment service")

class AssessmentRequest(BaseModel):
    studentId: str
    testId: str
    testType: str
    measurements: Dict[str, float]
    age: int
    sport: str
    previousScore: Optional[float] = None

class AssessmentResponse(BaseModel):
    assessmentType: str = "preliminary"
    performanceScore: float
    potentialFlag: bool
    improvementFlag: bool
    strengthAreas: List[str]
    improvementAreas: List[str]
    recommendation: str
    confidenceScore: float

@app.get("/health")
def health():
    return {"status": "ok", "note": "Preliminary scoring engine. No computer vision active."}

@app.post("/assess", response_model=AssessmentResponse)
def assess(req: AssessmentRequest):
    return run_assessment(req.dict())
