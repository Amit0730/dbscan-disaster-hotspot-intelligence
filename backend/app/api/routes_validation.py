from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.db_models import Mission, ClusterRecord, GroundTruthRecord, ValidationResult
from backend.app.models.schemas import ValidationParams
from backend.app.services.validation import validate_hotspots

router = APIRouter(prefix="/validation", tags=["Validation"])

@router.post("/evaluate")
def run_validation(
    params: ValidationParams = ValidationParams(),
    mission_id: Optional[str] = None,
    db: Session = Depends(get_db)
):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            raise HTTPException(status_code=404, detail="No active mission found.")
        mission_id = mission.id

    clusters = db.query(ClusterRecord).filter(ClusterRecord.mission_id == mission_id).all()
    gt_records = db.query(GroundTruthRecord).filter(GroundTruthRecord.mission_id == mission_id).all()

    if not gt_records:
        raise HTTPException(status_code=400, detail="No ground truth zones configured for this mission.")

    # Remove previous validation record
    db.query(ValidationResult).filter(ValidationResult.mission_id == mission_id).delete()

    val_res, matched_pairs = validate_hotspots(
        clusters=clusters,
        ground_truth=gt_records,
        mission_id=mission_id,
        match_radius_meters=params.match_radius_meters
    )

    db.add(val_res)
    db.commit()

    return {
        "status": "success",
        "disclaimer": "Validation performed against simulated ground-truth data.",
        "metrics": {
            "precision": val_res.precision,
            "recall": val_res.recall,
            "f1_score": val_res.f1_score,
            "coverage": val_res.coverage,
            "false_hotspots": val_res.false_hotspots,
            "missed_zones": val_res.missed_zones,
            "avg_distance_error": val_res.avg_distance_error,
            "evaluated_at": val_res.evaluated_at
        },
        "matched_pairs": matched_pairs
    }

@router.get("/results")
def get_validation_results(mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            return None
        mission_id = mission.id

    val = db.query(ValidationResult).filter(ValidationResult.mission_id == mission_id).order_by(ValidationResult.evaluated_at.desc()).first()
    if not val:
        return run_validation(ValidationParams(), mission_id, db)

    return {
        "disclaimer": "Validation performed against simulated ground-truth data.",
        "precision": val.precision,
        "recall": val.recall,
        "f1_score": val.f1_score,
        "coverage": val.coverage,
        "false_hotspots": val.false_hotspots,
        "missed_zones": val.missed_zones,
        "avg_distance_error": val.avg_distance_error,
        "evaluated_at": val.evaluated_at,
        "details": val.details_json
    }

@router.get("/ground-truth")
def get_ground_truth(mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            return []
        mission_id = mission.id

    return db.query(GroundTruthRecord).filter(GroundTruthRecord.mission_id == mission_id).all()
