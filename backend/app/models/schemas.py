from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
from datetime import datetime

# Request Schemas
class DBSCANParams(BaseModel):
    eps_meters: float = Field(default=100.0, ge=10.0, le=2000.0, description="DBSCAN epsilon radius in meters")
    min_samples: int = Field(default=5, ge=2, le=50, description="Minimum samples per cluster")

class ManualGPSInput(BaseModel):
    image_id: str
    lat: float = Field(..., ge=-90.0, le=90.0)
    lon: float = Field(..., ge=-180.0, le=180.0)
    altitude: Optional[float] = 100.0

class ValidationParams(BaseModel):
    match_radius_meters: float = Field(default=120.0, ge=20.0, le=1000.0)

# Response Schemas
class SignalSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    mission_id: str
    image_id: Optional[str] = None
    lat: float
    lon: float
    altitude: float
    timestamp: datetime
    temperature: Optional[float] = None
    thermal_anomaly: float
    thermal_score: float
    person_probability: float
    debris_probability: float
    damage_probability: float
    vehicle_probability: float
    confidence: float
    ground_truth_priority: Optional[str] = None
    cluster_id: int
    is_simulated: bool

class ClusterSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    mission_id: str
    cluster_label: int
    center_lat: float
    center_lon: float
    signal_count: int
    avg_thermal_score: float
    avg_person_prob: float
    avg_debris_prob: float
    avg_damage_prob: float
    avg_vehicle_prob: float
    cluster_density: float
    priority_score: float
    classification: str
    recommended_action: str
    convex_hull_geojson: Optional[Dict[str, Any]] = None

class GroundTruthSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    mission_id: str
    name: str
    lat: float
    lon: float
    radius_meters: float
    actual_priority: str
    zone_type: str
    description: Optional[str] = None

class FlightWaypointSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    sequence: int
    lat: float
    lon: float
    altitude: float
    timestamp: datetime
    speed_mps: float
    action_type: str

class ImageRecordSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    filename: str
    file_type: str
    size_bytes: int
    lat: Optional[float] = None
    lon: Optional[float] = None
    altitude: Optional[float] = None
    timestamp: datetime
    camera_model: Optional[str] = None
    has_gps: bool
    processing_status: str

class MissionStatsSchema(BaseModel):
    total_images: int
    total_signals: int
    dbscan_clusters: int
    noise_points: int
    critical_hotspots: int
    high_priority_hotspots: int
    medium_priority_hotspots: int
    low_priority_hotspots: int
    largest_cluster_size: int
    average_cluster_size: float
    average_priority_score: float
    mission_status: str
    data_source: str
    last_processed: datetime

class ValidationResultSchema(BaseModel):
    precision: float
    recall: float
    f1_score: float
    coverage: float
    false_hotspots: int
    missed_zones: int
    avg_distance_error: float
    evaluated_at: datetime
    details: Optional[List[Dict[str, Any]]] = None

class MissionResponse(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    status: str
    source: str
    center_lat: float
    center_lon: float
    created_at: datetime
    stats: Optional[MissionStatsSchema] = None

class ReportResponse(BaseModel):
    mission_id: str
    mission_name: str
    data_source: str
    disclaimer: str
    generated_at: datetime
    stats: MissionStatsSchema
    clusters: List[ClusterSchema]
    validation: Optional[ValidationResultSchema]
    methodology: Dict[str, Any]
    recommendations: List[str]
    limitations: List[str]
