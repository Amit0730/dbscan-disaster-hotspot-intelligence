import pytest
from backend.app.services.demo_generator import generate_demo_mission

def test_demo_generator_properties():
    mission, signals, gt_records, waypoints, images = generate_demo_mission()

    assert mission.id == "demo-mission-sih26030"
    assert len(signals) >= 300
    assert len(gt_records) == 5
    assert len(waypoints) >= 25
    assert len(images) == 40

    # Verify signal coordinate bounds
    for s in signals:
        assert 38.330 <= s.lat <= 38.380
        assert 37.830 <= s.lon <= 37.880
        assert 0.0 <= s.thermal_score <= 1.0
        assert 0.0 <= s.person_probability <= 1.0
        assert 0.0 <= s.confidence <= 1.0

    # Verify noise presence (~10-20%)
    noise_count = sum(1 for s in signals if s.ground_truth_priority == "NOISE")
    noise_ratio = noise_count / len(signals)
    assert 0.10 <= noise_ratio <= 0.25
