import pytest
from backend.app.services.validation import validate_hotspots, haversine_distance
from backend.app.models.db_models import ClusterRecord, GroundTruthRecord

def test_haversine_distance_accuracy():
    # Distance between (0, 0) and (1, 0) degree latitude is approx 111.19 km
    dist = haversine_distance(0.0, 0.0, 1.0, 0.0)
    assert 111000.0 <= dist <= 112000.0

def test_validation_metrics():
    # Predicted clusters
    c1 = ClusterRecord(
        id="c1",
        mission_id="m1",
        cluster_label=0,
        center_lat=38.3500,
        center_lon=37.8500,
        signal_count=20,
        priority_score=92.0,
        classification="CRITICAL",
        recommended_action="IMMEDIATE SEARCH"
    )
    c2 = ClusterRecord(
        id="c2",
        mission_id="m1",
        cluster_label=1,
        center_lat=38.3600,
        center_lon=37.8600,
        signal_count=15,
        priority_score=78.0,
        classification="HIGH",
        recommended_action="RAPID ASSESS"
    )

    # Ground truth: one matches c1 exactly, one is slightly offset from c2, one is missed
    gt1 = GroundTruthRecord(
        id="gt1",
        mission_id="m1",
        name="Zone 1",
        lat=38.3501, # ~11 meters away
        lon=37.8501,
        radius_meters=100.0,
        actual_priority="CRITICAL",
        zone_type="Survivor"
    )
    gt2 = GroundTruthRecord(
        id="gt2",
        mission_id="m1",
        name="Zone 2",
        lat=38.3605, # ~60 meters away
        lon=37.8605,
        radius_meters=100.0,
        actual_priority="HIGH",
        zone_type="Debris"
    )
    gt3 = GroundTruthRecord(
        id="gt3",
        mission_id="m1",
        name="Zone 3 (Missed)",
        lat=38.4000,
        lon=37.9000,
        radius_meters=100.0,
        actual_priority="MEDIUM",
        zone_type="Industrial"
    )

    val_res, matched_pairs = validate_hotspots(
        clusters=[c1, c2],
        ground_truth=[gt1, gt2, gt3],
        mission_id="m1",
        match_radius_meters=120.0
    )

    assert val_res.precision == 100.0 # Both c1 and c2 matched
    assert val_res.recall == 66.7    # 2 out of 3 GT zones matched
    assert val_res.coverage == 66.7
    assert val_res.false_hotspots == 0
    assert val_res.missed_zones == 1
    assert val_res.avg_distance_error > 0.0
