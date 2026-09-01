from typing import Tuple

def calculate_priority_score(
    avg_thermal: float,
    avg_person: float,
    avg_debris: float,
    avg_damage: float,
    density: float
) -> Tuple[float, str, str]:
    """
    5-factor Rescue Priority Scoring Engine:
    - 35% Thermal Anomaly Score
    - 30% Human Signal Probability
    - 15% Debris Probability
    - 10% Structural Damage Probability
    - 10% Cluster Density Score (normalized)
    """
    norm_density = min(1.0, max(0.0, density / 250.0))

    score = (
        0.35 * avg_thermal +
        0.30 * avg_person +
        0.15 * avg_debris +
        0.10 * avg_damage +
        0.10 * norm_density
    ) * 100.0

    priority_score = round(min(100.0, max(0.0, score)), 1)

    if priority_score >= 90.0:
        classification = "CRITICAL"
        action = "IMMEDIATE SEARCH & EXTRACTION: Deploy heavy USAR rescue team and canine units."
    elif priority_score >= 75.0:
        classification = "HIGH"
        action = "RAPID RECONNAISSANCE & ASSESS: Dispatch aerial tactical team for structural entry."
    elif priority_score >= 50.0:
        classification = "MEDIUM"
        action = "STRUCTURAL MONITORING: Conduct secondary acoustic sweep and perimeter hazard check."
    else:
        classification = "LOW"
        action = "ROUTINE PATROL & LOGISTICS: Monitor area perimeter and clear logistical supply routes."

    return priority_score, classification, action
