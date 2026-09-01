import math
import uuid
import datetime
from typing import List, Dict, Any, Tuple
from backend.app.models.db_models import ClusterRecord, GroundTruthRecord, ValidationResult

EARTH_RADIUS_METERS = 6371000.0

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)

    a = math.sin(delta_phi / 2.0)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2.0)**2
    c = 2.0 * math.atan2(math.sqrt(a), math.sqrt(1.0 - a))
    return EARTH_RADIUS_METERS * c

def validate_hotspots(
    clusters: List[ClusterRecord],
    ground_truth: List[GroundTruthRecord],
    mission_id: str,
    match_radius_meters: float = 140.0
) -> Tuple[ValidationResult, List[Dict[str, Any]]]:
    if not ground_truth:
        res = ValidationResult(
            id=f"val-{uuid.uuid4().hex[:8]}",
            mission_id=mission_id,
            precision=0.0,
            recall=0.0,
            f1_score=0.0,
            coverage=0.0,
            false_hotspots=len(clusters),
            missed_zones=0,
            avg_distance_error=0.0,
            evaluated_at=datetime.datetime.utcnow(),
            details_json=[]
        )
        return res, []

    candidate_matches = []
    for c in clusters:
        for gt in ground_truth:
            dist = haversine_distance(c.center_lat, c.center_lon, gt.lat, gt.lon)
            if dist <= match_radius_meters:
                candidate_matches.append((dist, c, gt))

    candidate_matches.sort(key=lambda x: x[0])

    matched_c_ids = set()
    matched_gt_ids = set()
    distance_errors = []
    matched_pairs = []

    for dist, c, gt in candidate_matches:
        if c.id not in matched_c_ids and gt.id not in matched_gt_ids:
            matched_c_ids.add(c.id)
            matched_gt_ids.add(gt.id)
            distance_errors.append(dist)

            matched_pairs.append({
                "cluster_id": c.id,
                "cluster_label": c.cluster_label,
                "predicted_priority": c.classification,
                "predicted_score": c.priority_score,
                "gt_id": gt.id,
                "gt_name": gt.name,
                "gt_priority": gt.actual_priority,
                "gt_zone_type": gt.zone_type,
                "distance_meters": round(dist, 1),
                "match_status": "MATCHED",
                "cluster_center": [c.center_lat, c.center_lon],
                "gt_center": [gt.lat, gt.lon]
            })

    for c in clusters:
        if c.id not in matched_c_ids:
            matched_pairs.append({
                "cluster_id": c.id,
                "cluster_label": c.cluster_label,
                "predicted_priority": c.classification,
                "predicted_score": c.priority_score,
                "gt_id": None,
                "gt_name": "No Associated Ground Truth",
                "gt_priority": "N/A",
                "gt_zone_type": "False Positive Hotspot",
                "distance_meters": None,
                "match_status": "UNMATCHED_PREDICTION",
                "cluster_center": [c.center_lat, c.center_lon],
                "gt_center": None
            })

    for gt in ground_truth:
        if gt.id not in matched_gt_ids:
            matched_pairs.append({
                "cluster_id": None,
                "cluster_label": None,
                "predicted_priority": "N/A",
                "predicted_score": None,
                "gt_id": gt.id,
                "gt_name": gt.name,
                "gt_priority": gt.actual_priority,
                "gt_zone_type": gt.zone_type,
                "distance_meters": None,
                "match_status": "MISSED_GROUND_TRUTH",
                "cluster_center": None,
                "gt_center": [gt.lat, gt.lon]
            })

    tp = len(matched_c_ids)
    fp = len(clusters) - tp
    fn = len(ground_truth) - len(matched_gt_ids)

    precision = round((tp / (tp + fp)) * 100.0, 1) if (tp + fp) > 0 else 0.0
    recall = round((tp / (tp + fn)) * 100.0, 1) if (tp + fn) > 0 else 0.0
    f1 = round((2 * precision * recall / (precision + recall)), 1) if (precision + recall) > 0 else 0.0
    coverage = round((len(matched_gt_ids) / len(ground_truth)) * 100.0, 1)
    avg_dist = round(float(sum(distance_errors) / len(distance_errors)), 1) if distance_errors else 0.0

    val_res = ValidationResult(
        id=f"val-{uuid.uuid4().hex[:8]}",
        mission_id=mission_id,
        precision=precision,
        recall=recall,
        f1_score=f1,
        coverage=coverage,
        false_hotspots=fp,
        missed_zones=fn,
        avg_distance_error=avg_dist,
        evaluated_at=datetime.datetime.utcnow(),
        details_json=matched_pairs
    )

    return val_res, matched_pairs
