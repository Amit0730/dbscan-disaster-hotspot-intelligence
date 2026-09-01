from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.db_models import Mission, ClusterRecord, GroundTruthRecord, ValidationResult, FlightWaypoint
from backend.app.api.routes_mission import compute_mission_stats
import datetime

router = APIRouter(prefix="/report", tags=["Report"])

@router.get("/summary")
def generate_mission_report(mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            raise HTTPException(status_code=404, detail="No active mission found.")
        mission_id = mission.id
    else:
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found.")

    stats = compute_mission_stats(db, mission_id)
    clusters = db.query(ClusterRecord).filter(ClusterRecord.mission_id == mission_id).order_by(ClusterRecord.priority_score.desc()).all()
    validation = db.query(ValidationResult).filter(ValidationResult.mission_id == mission_id).order_by(ValidationResult.evaluated_at.desc()).first()

    return {
        "mission_id": mission.id,
        "mission_name": mission.name,
        "description": mission.description,
        "data_source": f"{mission.source} DATASET",
        "generated_at": datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
        "disclaimer": "IMPORTANT: Simulated data is utilized for operational validation. Never present simulated results as real disaster information. Thermal hotspots indicate potential rescue interest, not verified survivors.",
        "stats": stats,
        "clusters": clusters,
        "validation": validation,
        "methodology": {
            "spatial_clustering": "Geodesic Haversine DBSCAN (Earth Radius R = 6,371 km)",
            "feature_extraction": "Dual-sensor payload (Thermal Radiometric Variance + RGB Multi-class contour detectors)",
            "priority_scoring_weights": {
                "thermal_anomaly": "35%",
                "human_signal_probability": "30%",
                "debris_probability": "15%",
                "structural_damage": "10%",
                "cluster_density": "10%"
            },
            "classification_tiers": {
                "CRITICAL": "90 - 100 Priority Score (Immediate Search & Extraction)",
                "HIGH": "75 - 89 Priority Score (Rapid Reconnaissance & Assess)",
                "MEDIUM": "50 - 74 Priority Score (Structural Monitoring & Acoustic Sweep)",
                "LOW": "0 - 49 Priority Score (Routine Patrol & Logistics Clearance)"
            }
        },
        "recommendations": [
            "Prioritize rescue asset deployment to Sector Alpha (Cluster #01) due to combined peak thermal anomaly and structural collapse markers.",
            "Deploy secondary aerial drone with LiDAR/optical zoom over Sector Bravo to establish safe egress lanes through heavy transport debris.",
            "Maintain thermal anomaly monitoring over Sector Charlie to track potential secondary industrial hazmat/gas ignition hazards."
        ],
        "limitations": [
            "DBSCAN identifies spatially dense sensor patterns; it does not independently determine whether a cluster contains survivors.",
            "Thermal anomalies may originate from sun-exposed rubble, vehicle exhaust, electrical transformers, or smoldering debris.",
            "This platform functions strictly as an operational decision-support intelligence tool, not an autonomous rescue command authority."
        ]
    }

@router.get("/flight-path")
def get_flight_path(mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            return []
        mission_id = mission.id

    waypoints = db.query(FlightWaypoint).filter(FlightWaypoint.mission_id == mission_id).order_by(FlightWaypoint.sequence.asc()).all()
    return waypoints
