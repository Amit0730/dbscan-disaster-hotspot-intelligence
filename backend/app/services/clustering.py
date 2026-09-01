import math
import uuid
import numpy as np
from typing import List, Tuple, Dict, Any
from sklearn.cluster import DBSCAN
from scipy.spatial import ConvexHull
from backend.app.models.db_models import SignalRecord, ClusterRecord
from backend.app.services.scoring import calculate_priority_score

EARTH_RADIUS_METERS = 6371000.0

def run_dbscan_clustering(
    signals: List[SignalRecord],
    mission_id: str,
    eps_meters: float = 100.0,
    min_samples: int = 5
) -> Tuple[List[SignalRecord], List[ClusterRecord], Dict[str, Any]]:
    if not signals:
        return [], [], {
            "total_signals": 0,
            "clusters_count": 0,
            "noise_count": 0,
            "largest_cluster_size": 0,
            "avg_cluster_size": 0.0,
            "avg_density": 0.0
        }

    coords_deg = np.array([[s.lat, s.lon] for s in signals])
    coords_rad = np.radians(coords_deg)

    eps_rad = eps_meters / EARTH_RADIUS_METERS

    db = DBSCAN(eps=eps_rad, min_samples=min_samples, metric='haversine')
    labels = db.fit_predict(coords_rad)

    unique_labels = set(labels)
    clusters: List[ClusterRecord] = []

    for i, sig in enumerate(signals):
        sig.cluster_id = int(labels[i])

    cluster_sizes = []
    cluster_densities = []

    for k in sorted(unique_labels):
        if k == -1:
            continue

        cluster_mask = (labels == k)
        cluster_signals = [s for i, s in enumerate(signals) if cluster_mask[i]]
        count = len(cluster_signals)
        cluster_sizes.append(count)

        pts_deg = coords_deg[cluster_mask]
        center_lat = float(np.mean(pts_deg[:, 0]))
        center_lon = float(np.mean(pts_deg[:, 1]))

        avg_thermal = float(np.mean([s.thermal_score for s in cluster_signals]))
        avg_person = float(np.mean([s.person_probability for s in cluster_signals]))
        avg_debris = float(np.mean([s.debris_probability for s in cluster_signals]))
        avg_damage = float(np.mean([s.damage_probability for s in cluster_signals]))
        avg_vehicle = float(np.mean([s.vehicle_probability for s in cluster_signals]))

        hull_coords = []
        area_km2 = 0.01

        if len(pts_deg) >= 3:
            try:
                hull = ConvexHull(pts_deg)
                hull_pts = pts_deg[hull.vertices]
                hull_coords = [[round(float(p[1]), 6), round(float(p[0]), 6)] for p in hull_pts]
                hull_coords.append(hull_coords[0])
                
                lat_scale = 111.0
                lon_scale = 111.0 * math.cos(math.radians(center_lat))
                pts_km = np.column_stack([pts_deg[:, 0] * lat_scale, pts_deg[:, 1] * lon_scale])
                hull_km = ConvexHull(pts_km)
                area_km2 = max(0.005, hull_km.volume)
            except Exception:
                hull_coords = []

        if not hull_coords:
            ring = []
            radius_deg = (eps_meters * 0.75) / 111000.0
            for angle in np.linspace(0, 2 * math.pi, 16):
                p_lat = center_lat + radius_deg * math.sin(angle)
                p_lon = center_lon + (radius_deg / math.cos(math.radians(center_lat))) * math.cos(angle)
                ring.append([round(float(p_lon), 6), round(float(p_lat), 6)])
            hull_coords = ring
            area_km2 = math.pi * ((eps_meters * 0.75 / 1000.0) ** 2)

        geojson_polygon = {
            "type": "Polygon",
            "coordinates": [hull_coords]
        }

        density = round(count / max(area_km2, 0.001), 1)
        cluster_densities.append(density)

        priority_score, classification, action = calculate_priority_score(
            avg_thermal=avg_thermal,
            avg_person=avg_person,
            avg_debris=avg_debris,
            avg_damage=avg_damage,
            density=density
        )

        cluster_rec = ClusterRecord(
            id=f"cluster-{k+1:02d}-{uuid.uuid4().hex[:6]}",
            mission_id=mission_id,
            cluster_label=int(k),
            center_lat=round(center_lat, 6),
            center_lon=round(center_lon, 6),
            signal_count=count,
            avg_thermal_score=round(avg_thermal, 3),
            avg_person_prob=round(avg_person, 3),
            avg_debris_prob=round(avg_debris, 3),
            avg_damage_prob=round(avg_damage, 3),
            avg_vehicle_prob=round(avg_vehicle, 3),
            cluster_density=density,
            priority_score=priority_score,
            classification=classification,
            recommended_action=action,
            convex_hull_geojson=geojson_polygon
        )
        clusters.append(cluster_rec)

    clusters.sort(key=lambda c: c.priority_score, reverse=True)

    noise_count = int(np.sum(labels == -1))
    stats = {
        "total_signals": len(signals),
        "clusters_count": len(clusters),
        "noise_count": noise_count,
        "largest_cluster_size": max(cluster_sizes) if cluster_sizes else 0,
        "avg_cluster_size": round(float(np.mean(cluster_sizes)), 1) if cluster_sizes else 0.0,
        "avg_density": round(float(np.mean(cluster_densities)), 1) if cluster_densities else 0.0
    }

    return signals, clusters, stats
