import uuid
import math
import random
import datetime
import numpy as np
from typing import List, Tuple
from backend.app.models.db_models import Mission, SignalRecord, GroundTruthRecord, FlightWaypoint, ImageRecord

def generate_demo_mission() -> Tuple[Mission, List[SignalRecord], List[GroundTruthRecord], List[FlightWaypoint], List[ImageRecord]]:
    random.seed(42)
    np.random.seed(42)

    mission_id = "demo-mission-sih26030"
    base_lat = 38.3550
    base_lon = 37.8550
    start_time = datetime.datetime(2026, 9, 1, 8, 0, 0)

    mission = Mission(
        id=mission_id,
        name="Operation Aegis: Sector-7 Disaster Reconnaissance",
        description="Simulated multi-sensor drone survey over an urban earthquake and structural collapse zone.",
        status="ACTIVE",
        source="DEMO",
        center_lat=base_lat,
        center_lon=base_lon,
        bbox={"min_lat": 38.338, "min_lon": 37.840, "max_lat": 38.370, "max_lon": 37.872},
        created_at=start_time,
        updated_at=start_time + datetime.timedelta(hours=10)
    )

    zone_configs = [
        {
            "name": "Sector Alpha - Collapsed Residential Complex",
            "center": (38.3588, 37.8515),
            "zone_type": "Potential Survivor Zone",
            "actual_priority": "CRITICAL",
            "count": 95,
            "spread": (0.0016, 0.0022),
            "angle": 35.0,
            "thermal_range": (35.5, 39.8),
            "human_range": (0.75, 0.96),
            "debris_range": (0.65, 0.90),
            "damage_range": (0.85, 0.99),
            "vehicle_range": (0.05, 0.25),
            "desc": "High density multi-story building collapse with strong thermal signatures and potential trapped occupants."
        },
        {
            "name": "Sector Bravo - Overpass & Transport Debris",
            "center": (38.3512, 37.8465),
            "zone_type": "Heavy Debris Zone",
            "actual_priority": "HIGH",
            "count": 75,
            "spread": (0.0025, 0.0012),
            "angle": -45.0,
            "thermal_range": (24.0, 31.5),
            "human_range": (0.25, 0.60),
            "debris_range": (0.85, 0.99),
            "damage_range": (0.78, 0.95),
            "vehicle_range": (0.45, 0.85),
            "desc": "Major arterial bridge collapse with crushed vehicles and dense concrete rubble obstruction."
        },
        {
            "name": "Sector Charlie - Damaged Industrial Facility",
            "center": (38.3625, 37.8635),
            "zone_type": "Damaged Building Zone",
            "actual_priority": "HIGH",
            "count": 65,
            "spread": (0.0018, 0.0018),
            "angle": 15.0,
            "thermal_range": (38.0, 48.5),
            "human_range": (0.35, 0.68),
            "debris_range": (0.50, 0.80),
            "damage_range": (0.80, 0.96),
            "vehicle_range": (0.30, 0.65),
            "desc": "Manufacturing facility with thermal anomalies from machinery, ruptured gas lines, and compromised structure."
        },
        {
            "name": "Sector Delta - Evacuation Gathering Point",
            "center": (38.3485, 37.8615),
            "zone_type": "Mixed Signal Zone",
            "actual_priority": "MEDIUM",
            "count": 55,
            "spread": (0.0015, 0.0020),
            "angle": 60.0,
            "thermal_range": (32.0, 37.2),
            "human_range": (0.55, 0.82),
            "debris_range": (0.20, 0.45),
            "damage_range": (0.25, 0.55),
            "vehicle_range": (0.60, 0.90),
            "desc": "Dispersed civilian assembly point with emergency vehicles, minor debris, and ambulatory survivors."
        },
        {
            "name": "Sector Echo - Agricultural / Perimeter Outskirts",
            "center": (38.3425, 37.8510),
            "zone_type": "Low Priority Zone",
            "actual_priority": "LOW",
            "count": 40,
            "spread": (0.0022, 0.0025),
            "angle": 0.0,
            "thermal_range": (19.0, 25.0),
            "human_range": (0.05, 0.30),
            "debris_range": (0.05, 0.25),
            "damage_range": (0.05, 0.20),
            "vehicle_range": (0.02, 0.15),
            "desc": "Open fields and lightly affected structures with minimal emergency intervention requirements."
        }
    ]

    ground_truth_records = []
    for i, zc in enumerate(zone_configs):
        gt = GroundTruthRecord(
            id=f"gt-zone-{i+1}",
            mission_id=mission_id,
            name=zc["name"],
            lat=zc["center"][0],
            lon=zc["center"][1],
            radius_meters=120.0 if zc["actual_priority"] in ["CRITICAL", "HIGH"] else 90.0,
            actual_priority=zc["actual_priority"],
            zone_type=zc["zone_type"],
            description=zc["desc"]
        )
        ground_truth_records.append(gt)

    signals: List[SignalRecord] = []
    signal_idx = 1

    for zc in zone_configs:
        c_lat, c_lon = zc["center"]
        s_lat, s_lon = zc["spread"]
        rad = math.radians(zc["angle"])
        cos_a = math.cos(rad)
        sin_a = math.sin(rad)

        for _ in range(zc["count"]):
            u = np.random.normal(0, 0.45)
            v = np.random.normal(0, 0.45)
            d_lat = (u * cos_a - v * sin_a) * s_lat
            d_lon = (u * sin_a + v * cos_a) * s_lon

            sig_lat = c_lat + d_lat
            sig_lon = c_lon + d_lon

            time_offset_min = random.randint(15, 570)
            sig_time = start_time + datetime.timedelta(minutes=time_offset_min)

            temp = random.uniform(*zc["thermal_range"])
            thermal_score = min(1.0, max(0.0, (temp - 18.0) / 30.0))
            thermal_anomaly = thermal_score * random.uniform(0.85, 1.0)

            human_prob = random.uniform(*zc["human_range"])
            debris_prob = random.uniform(*zc["debris_range"])
            damage_prob = random.uniform(*zc["damage_range"])
            vehicle_prob = random.uniform(*zc["vehicle_range"])
            confidence = random.uniform(0.78, 0.98)

            sig = SignalRecord(
                id=f"sig-{signal_idx:04d}",
                mission_id=mission_id,
                image_id=f"img-{(signal_idx % 40) + 1:03d}",
                lat=round(float(sig_lat), 6),
                lon=round(float(sig_lon), 6),
                altitude=round(random.uniform(90.0, 115.0), 1),
                timestamp=sig_time,
                temperature=round(temp, 1),
                thermal_anomaly=round(thermal_anomaly, 3),
                thermal_score=round(thermal_score, 3),
                person_probability=round(human_prob, 3),
                debris_probability=round(debris_prob, 3),
                damage_probability=round(damage_prob, 3),
                vehicle_probability=round(vehicle_prob, 3),
                confidence=round(confidence, 3),
                ground_truth_priority=zc["actual_priority"],
                cluster_id=-1,
                is_simulated=True
            )
            signals.append(sig)
            signal_idx += 1

    noise_count = 65
    for _ in range(noise_count):
        sig_lat = random.uniform(38.339, 38.369)
        sig_lon = random.uniform(37.841, 37.871)
        time_offset_min = random.randint(10, 580)
        sig_time = start_time + datetime.timedelta(minutes=time_offset_min)

        temp = random.uniform(18.5, 29.0)
        thermal_score = min(1.0, max(0.0, (temp - 18.0) / 30.0))
        thermal_anomaly = thermal_score * random.uniform(0.2, 0.6)

        sig = SignalRecord(
            id=f"sig-{signal_idx:04d}",
            mission_id=mission_id,
            image_id=f"img-{(signal_idx % 40) + 1:03d}",
            lat=round(float(sig_lat), 6),
            lon=round(float(sig_lon), 6),
            altitude=round(random.uniform(95.0, 120.0), 1),
            timestamp=sig_time,
            temperature=round(temp, 1),
            thermal_anomaly=round(thermal_anomaly, 3),
            thermal_score=round(thermal_score, 3),
            person_probability=round(random.uniform(0.02, 0.25), 3),
            debris_probability=round(random.uniform(0.05, 0.35), 3),
            damage_probability=round(random.uniform(0.02, 0.30), 3),
            vehicle_probability=round(random.uniform(0.01, 0.40), 3),
            confidence=round(random.uniform(0.50, 0.80), 3),
            ground_truth_priority="NOISE",
            cluster_id=-1,
            is_simulated=True
        )
        signals.append(sig)
        signal_idx += 1

    flight_waypoints: List[FlightWaypoint] = []
    lat_stripes = np.linspace(38.340, 38.368, 8)
    wp_seq = 1
    current_time = start_time

    flight_waypoints.append(FlightWaypoint(
        id=f"wp-{wp_seq:03d}",
        mission_id=mission_id,
        sequence=wp_seq,
        lat=38.3385,
        lon=37.8405,
        altitude=0.0,
        timestamp=current_time,
        speed_mps=0.0,
        action_type="TAKEOFF"
    ))
    wp_seq += 1

    for idx, lat_val in enumerate(lat_stripes):
        if idx % 2 == 0:
            lons = [37.842, 37.856, 37.870]
        else:
            lons = [37.870, 37.856, 37.842]

        for lon_val in lons:
            current_time += datetime.timedelta(minutes=18)
            flight_waypoints.append(FlightWaypoint(
                id=f"wp-{wp_seq:03d}",
                mission_id=mission_id,
                sequence=wp_seq,
                lat=round(float(lat_val), 6),
                lon=round(float(lon_val), 6),
                altitude=105.0,
                timestamp=current_time,
                speed_mps=14.0,
                action_type="CAPTURE" if (wp_seq % 2 == 0) else "SURVEY"
            ))
            wp_seq += 1

    current_time += datetime.timedelta(minutes=20)
    flight_waypoints.append(FlightWaypoint(
        id=f"wp-{wp_seq:03d}",
        mission_id=mission_id,
        sequence=wp_seq,
        lat=38.3385,
        lon=37.8405,
        altitude=0.0,
        timestamp=current_time,
        speed_mps=0.0,
        action_type="LANDING"
    ))

    images: List[ImageRecord] = []
    for i in range(1, 41):
        img_lat = base_lat + random.uniform(-0.015, 0.015)
        img_lon = base_lon + random.uniform(-0.015, 0.015)
        img_time = start_time + datetime.timedelta(minutes=i * 14)
        is_thermal = (i % 2 == 0)
        img = ImageRecord(
            id=f"img-{i:03d}",
            mission_id=mission_id,
            filename=f"SURVEY_FLIGHT01_{'THERM' if is_thermal else 'RGB'}_{i:03d}.jpg",
            file_path=f"demo/{'thermal' if is_thermal else 'visual'}/img_{i:03d}.jpg",
            file_type="THERMAL" if is_thermal else "RGB",
            size_bytes=random.randint(1800000, 3800000),
            lat=round(float(img_lat), 6),
            lon=round(float(img_lon), 6),
            altitude=105.0,
            timestamp=img_time,
            camera_model="Zenmuse H20T Quad-Sensor" if is_thermal else "Hasselblad L2D-20c",
            exif_data={"iso": 200, "focal_length": "24mm", "shutter": "1/800s", "fov": "84 deg"},
            has_gps=True,
            processing_status="PROCESSED"
        )
        images.append(img)

    return mission, signals, ground_truth_records, flight_waypoints, images
