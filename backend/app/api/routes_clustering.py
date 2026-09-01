from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.db_models import Mission, SignalRecord, ClusterRecord, GroundTruthRecord, ValidationResult
from backend.app.models.schemas import DBSCANParams, ClusterSchema, SignalSchema
from backend.app.services.clustering import run_dbscan_clustering
from backend.app.services.validation import validate_hotspots

router = APIRouter(prefix="/clustering", tags=["Clustering"])

@router.post("/run")
def execute_dbscan(params: DBSCANParams, mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            raise HTTPException(status_code=404, detail="No active mission found.")
        mission_id = mission.id
    else:
        mission = db.query(Mission).filter(Mission.id == mission_id).first()
        if not mission:
            raise HTTPException(status_code=404, detail="Mission not found.")

    signals = db.query(SignalRecord).filter(SignalRecord.mission_id == mission_id).all()
    if not signals:
        raise HTTPException(status_code=400, detail="No signals available for clustering.")

    # Remove existing clusters for this mission
    db.query(ClusterRecord).filter(ClusterRecord.mission_id == mission_id).delete()
    db.commit()

    # Execute Haversine DBSCAN
    updated_signals, clusters, stats = run_dbscan_clustering(
        signals=signals,
        mission_id=mission_id,
        eps_meters=params.eps_meters,
        min_samples=params.min_samples
    )

    db.add_all(clusters)
    db.commit()

    # Auto update validation metrics against ground truth
    gt_records = db.query(GroundTruthRecord).filter(GroundTruthRecord.mission_id == mission_id).all()
    if gt_records:
        db.query(ValidationResult).filter(ValidationResult.mission_id == mission_id).delete()
        val_res, _ = validate_hotspots(clusters, gt_records, mission_id)
        db.add(val_res)
        db.commit()

    return {
        "status": "success",
        "params": {"eps_meters": params.eps_meters, "min_samples": params.min_samples},
        "stats": stats,
        "clusters_count": len(clusters),
        "clusters": clusters
    }

@router.get("/clusters")
def get_clusters(mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            return []
        mission_id = mission.id

    clusters = db.query(ClusterRecord).filter(ClusterRecord.mission_id == mission_id).order_by(ClusterRecord.priority_score.desc()).all()
    return clusters

@router.get("/clusters/{cluster_id}")
def get_cluster_detail(cluster_id: str, db: Session = Depends(get_db)):
    cluster = db.query(ClusterRecord).filter(ClusterRecord.id == cluster_id).first()
    if not cluster:
        raise HTTPException(status_code=404, detail="Cluster not found.")

    member_signals = db.query(SignalRecord).filter(
        SignalRecord.mission_id == cluster.mission_id,
        SignalRecord.cluster_id == cluster.cluster_label
    ).all()

    return {
        "cluster": cluster,
        "signals": member_signals,
        "signal_count": len(member_signals)
    }

@router.get("/signals")
def get_signals(
    mission_id: Optional[str] = None,
    cluster_id: Optional[int] = None,
    min_time_min: Optional[int] = None,
    max_time_min: Optional[int] = None,
    db: Session = Depends(get_db)
):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            return []
        mission_id = mission.id

    query = db.query(SignalRecord).filter(SignalRecord.mission_id == mission_id)
    
    if cluster_id is not None:
        query = query.filter(SignalRecord.cluster_id == cluster_id)

    signals = query.all()
    return signals
