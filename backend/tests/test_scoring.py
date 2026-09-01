import pytest
from backend.app.services.scoring import calculate_priority_score

def test_scoring_weights_and_bounds():
    # Critical case: high thermal, high human, high debris & damage
    score, classification, action = calculate_priority_score(
        avg_thermal=0.95,
        avg_person=0.90,
        avg_debris=0.85,
        avg_damage=0.90,
        density=200.0
    )
    assert 90.0 <= score <= 100.0
    assert classification == "CRITICAL"
    assert "IMMEDIATE SEARCH" in action

    # Low case: low metrics across the board
    score_low, class_low, act_low = calculate_priority_score(
        avg_thermal=0.10,
        avg_person=0.10,
        avg_debris=0.10,
        avg_damage=0.10,
        density=10.0
    )
    assert score_low < 50.0
    assert class_low == "LOW"
    assert "ROUTINE PATROL" in act_low

def test_scoring_monotonicity():
    s1, _, _ = calculate_priority_score(0.8, 0.8, 0.8, 0.8, 100.0)
    s2, _, _ = calculate_priority_score(0.5, 0.5, 0.5, 0.5, 50.0)
    assert s1 > s2
