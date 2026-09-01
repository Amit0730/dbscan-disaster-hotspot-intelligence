from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.db_models import Mission, SignalRecord, ClusterRecord, GroundTruthRecord, FlightWaypoint, ImageRecord, ValidationResult
from backend.app.models.schemas import MissionResponse, MissionStatsSchema
from backend.app.services.demo_generator import generate_demo_mission
from backend.app.services.clustering import run_dbscan_clustering
from backend.app.services.validation import validate_hotspots
import datetime

router = APIRouter(prefix="/missions", tags=["Missions"])

def compute_mission_stats(db: Session, mission_id: str) -> MissionStatsSchema:
    mission = db.query(Mission).filter(Mission.id == mission_id).first()
    if not mission:
        raise HTTPException(status_code=404, detail="Mission not found")

    total_images = db.query(ImageRecord).filter(ImageRecord.mission_id == mission_id).count()
    signals = db.query(SignalRecord).filter(SignalRecord.mission_id == mission_id).all()
    clusters = db.query(ClusterRecord).filter(ClusterRecord.mission_id == mission_id).all()

    total_signals = len(signals)
    dbscan_clusters = len(clusters)
    noise_points = sum(1 for s in signals if s.cluster_id == -1)

    critical_count = sum(1 for c in clusters if c.classification == "CRITICAL")
    high_count = sum(1 for c in clusters if c.classification == "HIGH")
    medium_count = sum(1 for c in clusters if c.classification == "MEDIUM")
    low_count = sum(1 for c in clusters if c.classification == "LOW")

    largest_cluster = max([c.signal_count for c in clusters], default=0)
    avg_cluster_size = round(sum(c.signal_count for c in clusters) / max(len(clusters), 1), 1)
    avg_priority = round(sum(c.priority_score for c in clusters) / max(len(clusters), 1), 1)

    return MissionStatsSchema(
        total_images=total_images,
        total_signals=total_signals,
        dbscan_clusters=dbscan_clusters,
        noise_points=noise_points,
        critical_hotspots=critical_count,
        high_priority_hotspots=high_count,
        medium_priority_hotspots=medium_count,
        low_priority_hotspots=low_count,
        largest_cluster_size=largest_cluster,
        average_cluster_size=avg_cluster_size,
        average_priority_score=avg_priority,
        mission_status=mission.status,
        data_source=mission.source,
        last_processed=mission.updated_at or mission.created_at
    )

@router.post("/demo")
def load_demo_mission(db: Session = Depends(get_db)):
    demo_id = "demo-mission-sih26030"
    db.query(ValidationResult).filter(ValidationResult.mission_id == demo_id).delete()
    db.query(ClusterRecord).filter(ClusterRecord.mission_id == demo_id).delete()
    db.query(SignalRecord).filter(SignalRecord.mission_id == demo_id).delete()
    db.query(GroundTruthRecord).filter(GroundTruthRecord.mission_id == demo_id).delete()
    db.query(FlightWaypoint).filter(FlightWaypoint.mission_id == demo_id).delete()
    db.query(ImageRecord).filter(ImageRecord.mission_id == demo_id).delete()
    db.query(Mission).filter(Mission.id == demo_id).delete()
    db.commit()

    mission, signals, gt_records, waypoints, images = generate_demo_mission()
    db.add(mission)
    db.add_all(images)
    db.add_all(gt_records)
    db.add_all(waypoints)
    db.add_all(signals)
    db.commit()

    updated_signals, clusters, cluster_stats = run_dbscan_clustering(signals, demo_id, eps_meters=100.0, min_samples=5)
    db.add_all(clusters)
    db.commit()

    val_res, matched_pairs = validate_hotspots(clusters, gt_records, demo_id, match_radius_meters=140.0)
    db.add(val_res)
    db.commit()

    stats = compute_mission_stats(db, demo_id)
    return {
        "status": "success",
        "message": "Realistic demo disaster mission initialized with 385 signals and Haversine DBSCAN clustering.",
        "mission_id": demo_id,
        "stats": stats
    }

@router.get("/current")
def get_current_mission(db: Session = Depends(get_db)):
    mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
    if not mission:
        return load_demo_mission(db)
    
    stats = compute_mission_stats(db, mission.id)
    return {
        "id": mission.id,
        "name": mission.name,
        "description": mission.description,
        "status": mission.status,
        "source": mission.source,
        "center_lat": mission.center_lat,
        "center_lon": mission.center_lon,
        "created_at": mission.created_at,
        "stats": stats
    }

@router.get("/statistics")
def get_statistics(db: Session = Depends(get_db)):
    mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
    if not mission:
        return load_demo_mission(db)["stats"]
    return compute_mission_stats(db, mission.id)
