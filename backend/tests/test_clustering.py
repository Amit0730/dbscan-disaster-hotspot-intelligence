import pytest
import numpy as np
from backend.app.services.clustering import run_dbscan_clustering
from backend.app.models.db_models import SignalRecord
import datetime

def test_dbscan_clustering_identifies_clusters_and_noise():
    signals = []
    # Cluster 1: 10 tightly grouped points around (38.35, 37.85)
    for i in range(10):
        signals.append(SignalRecord(
            id=f"sig-c1-{i}",
            mission_id="test-mission",
            lat=38.3500 + (i * 0.0001), # ~11 meters apart
            lon=37.8500 + (i * 0.0001),
            altitude=100.0,
            timestamp=datetime.datetime.utcnow(),
            temperature=36.5,
            thermal_anomaly=0.8,
            thermal_score=0.85,
            person_probability=0.9,
            debris_probability=0.7,
            damage_probability=0.8,
            vehicle_probability=0.1,
            confidence=0.95,
            ground_truth_priority="CRITICAL",
            cluster_id=-1,
            is_simulated=True
        ))

    # Cluster 2: 8 tightly grouped points around (38.38, 37.88)
    for i in range(8):
        signals.append(SignalRecord(
            id=f"sig-c2-{i}",
            mission_id="test-mission",
            lat=38.3800 + (i * 0.0001),
            lon=37.8800 + (i * 0.0001),
            altitude=100.0,
            timestamp=datetime.datetime.utcnow(),
            temperature=25.0,
            thermal_anomaly=0.3,
            thermal_score=0.35,
            person_probability=0.2,
            debris_probability=0.8,
            damage_probability=0.7,
            vehicle_probability=0.4,
            confidence=0.88,
            ground_truth_priority="HIGH",
            cluster_id=-1,
            is_simulated=True
        ))

    # 3 Noise points far away from clusters
    noise_coords = [(38.3000, 37.8000), (38.4200, 37.9200), (38.3100, 37.8900)]
    for i, (n_lat, n_lon) in enumerate(noise_coords):
        signals.append(SignalRecord(
            id=f"sig-noise-{i}",
            mission_id="test-mission",
            lat=n_lat,
            lon=n_lon,
            altitude=100.0,
            timestamp=datetime.datetime.utcnow(),
            temperature=20.0,
            thermal_anomaly=0.1,
            thermal_score=0.1,
            person_probability=0.05,
            debris_probability=0.1,
            damage_probability=0.1,
            vehicle_probability=0.05,
            confidence=0.60,
            ground_truth_priority="NOISE",
            cluster_id=-1,
            is_simulated=True
        ))

    updated_signals, clusters, stats = run_dbscan_clustering(
        signals=signals,
        mission_id="test-mission",
        eps_meters=150.0,
        min_samples=5
    )

    assert stats["total_signals"] == 21
    assert stats["clusters_count"] == 2
    assert stats["noise_count"] == 3
    assert len(clusters) == 2
    assert clusters[0].priority_score >= clusters[1].priority_score
    assert clusters[0].convex_hull_geojson is not None
    assert clusters[0].convex_hull_geojson["type"] == "Polygon"
