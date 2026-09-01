import datetime
from sqlalchemy import Column, String, Float, Integer, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from backend.app.database import Base

class Mission(Base):
    __tablename__ = 'missions'

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String, default='ACTIVE')  # ACTIVE, COMPLETED, ARCHIVED
    source = Column(String, default='DEMO')    # DEMO, UPLOAD
    center_lat = Column(Float, default=38.3550)
    center_lon = Column(Float, default=37.8550)
    bbox = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

    images = relationship('ImageRecord', back_populates='mission', cascade='all, delete-orphan')
    signals = relationship('SignalRecord', back_populates='mission', cascade='all, delete-orphan')
    clusters = relationship('ClusterRecord', back_populates='mission', cascade='all, delete-orphan')
    ground_truth = relationship('GroundTruthRecord', back_populates='mission', cascade='all, delete-orphan')
    flight_waypoints = relationship('FlightWaypoint', back_populates='mission', cascade='all, delete-orphan')
    validation_results = relationship('ValidationResult', back_populates='mission', cascade='all, delete-orphan')


class ImageRecord(Base):
    __tablename__ = 'images'

    id = Column(String, primary_key=True, index=True)
    mission_id = Column(String, ForeignKey('missions.id'), nullable=False)
    filename = Column(String, nullable=False)
    file_path = Column(String, nullable=False)
    file_type = Column(String, default='RGB')  # RGB, THERMAL
    size_bytes = Column(Integer, default=0)
    lat = Column(Float, nullable=True)
    lon = Column(Float, nullable=True)
    altitude = Column(Float, nullable=True)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    camera_model = Column(String, nullable=True)
    exif_data = Column(JSON, nullable=True)
    has_gps = Column(Boolean, default=False)
    processing_status = Column(String, default='PENDING')  # PENDING, PROCESSED, ERROR

    mission = relationship('Mission', back_populates='images')
    signals = relationship('SignalRecord', back_populates='image')


class SignalRecord(Base):
    __tablename__ = 'signals'

    id = Column(String, primary_key=True, index=True)
    mission_id = Column(String, ForeignKey('missions.id'), nullable=False)
    image_id = Column(String, ForeignKey('images.id'), nullable=True)
    lat = Column(Float, nullable=False, index=True)
    lon = Column(Float, nullable=False, index=True)
    altitude = Column(Float, default=100.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    temperature = Column(Float, nullable=True)
    thermal_anomaly = Column(Float, default=0.0)
    thermal_score = Column(Float, default=0.0)        # 0.0 - 1.0
    person_probability = Column(Float, default=0.0)   # 0.0 - 1.0
    debris_probability = Column(Float, default=0.0)   # 0.0 - 1.0
    damage_probability = Column(Float, default=0.0)   # 0.0 - 1.0
    vehicle_probability = Column(Float, default=0.0)  # 0.0 - 1.0
    confidence = Column(Float, default=0.85)          # 0.0 - 1.0
    ground_truth_priority = Column(String, nullable=True) # CRITICAL, HIGH, MEDIUM, LOW, NOISE
    cluster_id = Column(Integer, default=-1, index=True)  # -1 is noise
    is_simulated = Column(Boolean, default=True)

    mission = relationship('Mission', back_populates='signals')
    image = relationship('ImageRecord', back_populates='signals')


class ClusterRecord(Base):
    __tablename__ = 'clusters'

    id = Column(String, primary_key=True, index=True)
    mission_id = Column(String, ForeignKey('missions.id'), nullable=False)
    cluster_label = Column(Integer, nullable=False)
    center_lat = Column(Float, nullable=False)
    center_lon = Column(Float, nullable=False)
    signal_count = Column(Integer, nullable=False)
    avg_thermal_score = Column(Float, default=0.0)
    avg_person_prob = Column(Float, default=0.0)
    avg_debris_prob = Column(Float, default=0.0)
    avg_damage_prob = Column(Float, default=0.0)
    avg_vehicle_prob = Column(Float, default=0.0)
    cluster_density = Column(Float, default=0.0)      # signals per hectare or km2
    priority_score = Column(Float, nullable=False)    # 0 - 100
    classification = Column(String, nullable=False)   # CRITICAL, HIGH, MEDIUM, LOW
    recommended_action = Column(String, nullable=False)
    convex_hull_geojson = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    mission = relationship('Mission', back_populates='clusters')


class GroundTruthRecord(Base):
    __tablename__ = 'ground_truth'

    id = Column(String, primary_key=True, index=True)
    mission_id = Column(String, ForeignKey('missions.id'), nullable=False)
    name = Column(String, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    radius_meters = Column(Float, default=80.0)
    actual_priority = Column(String, nullable=False) # CRITICAL, HIGH, MEDIUM, LOW
    zone_type = Column(String, nullable=False)       # Potential Survivor, Heavy Debris, Damaged Building, Mixed, Low Priority
    description = Column(Text, nullable=True)

    mission = relationship('Mission', back_populates='ground_truth')


class ValidationResult(Base):
    __tablename__ = 'validation_results'

    id = Column(String, primary_key=True, index=True)
    mission_id = Column(String, ForeignKey('missions.id'), nullable=False)
    precision = Column(Float, nullable=False)
    recall = Column(Float, nullable=False)
    f1_score = Column(Float, nullable=False)
    coverage = Column(Float, nullable=False)
    false_hotspots = Column(Integer, default=0)
    missed_zones = Column(Integer, default=0)
    avg_distance_error = Column(Float, default=0.0) # in meters
    evaluated_at = Column(DateTime, default=datetime.datetime.utcnow)
    details_json = Column(JSON, nullable=True)

    mission = relationship('Mission', back_populates='validation_results')


class FlightWaypoint(Base):
    __tablename__ = 'flight_waypoints'

    id = Column(String, primary_key=True, index=True)
    mission_id = Column(String, ForeignKey('missions.id'), nullable=False)
    sequence = Column(Integer, nullable=False)
    lat = Column(Float, nullable=False)
    lon = Column(Float, nullable=False)
    altitude = Column(Float, default=100.0)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)
    speed_mps = Column(Float, default=12.0)
    action_type = Column(String, default='SURVEY') # TAKEOFF, SURVEY, CAPTURE, SIGNAL_DETECT, RETURN

    mission = relationship('Mission', back_populates='flight_waypoints')
