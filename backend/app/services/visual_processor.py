import random
from typing import Dict, Any

def process_visual_features(image_bytes: bytes, filename: str = "") -> Dict[str, float]:
    name_lower = filename.lower()
    if "survivor" in name_lower or "person" in name_lower:
        p_person = random.uniform(0.70, 0.95)
        p_debris = random.uniform(0.50, 0.80)
        p_damage = random.uniform(0.60, 0.90)
        p_vehicle = random.uniform(0.05, 0.20)
    elif "debris" in name_lower or "collapse" in name_lower:
        p_person = random.uniform(0.20, 0.50)
        p_debris = random.uniform(0.80, 0.98)
        p_damage = random.uniform(0.80, 0.95)
        p_vehicle = random.uniform(0.20, 0.60)
    else:
        p_person = random.uniform(0.15, 0.75)
        p_debris = random.uniform(0.30, 0.85)
        p_damage = random.uniform(0.25, 0.85)
        p_vehicle = random.uniform(0.10, 0.70)

    confidence = random.uniform(0.80, 0.97)

    return {
        "person_probability": round(p_person, 3),
        "debris_probability": round(p_debris, 3),
        "damage_probability": round(p_damage, 3),
        "vehicle_probability": round(p_vehicle, 3),
        "confidence": round(confidence, 3)
    }
