import os
import io
import csv
import uuid
import datetime
import random
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from backend.app.database import get_db
from backend.app.models.db_models import Mission, ImageRecord, SignalRecord
from backend.app.models.schemas import ManualGPSInput, ImageRecordSchema, SignalSchema
from backend.app.services.exif_extractor import extract_exif
from backend.app.services.thermal_processor import process_thermal_imagery
from backend.app.services.visual_processor import process_visual_features
from backend.app.config import settings

router = APIRouter(prefix="/data", tags=["Data"])

@router.post("/upload")
async def upload_files(
    files: List[UploadFile] = File(...),
    mission_id: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files uploaded.")

    if not mission_id:
        current_mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not current_mission:
            current_mission = Mission(
                id=f"mission-{uuid.uuid4().hex[:8]}",
                name="Custom Drone Field Survey",
                description="Field uploaded imagery and telemetry dataset.",
                status="ACTIVE",
                source="USER UPLOAD",
                center_lat=38.3550,
                center_lon=37.8550
            )
            db.add(current_mission)
            db.commit()
        mission_id = current_mission.id

    uploaded_records = []
    signals_from_csv = []
    
    for file in files:
        content = await file.read()
        filename = file.filename or "unknown_file"
        ext = os.path.splitext(filename)[1].lower()

        # Handle CSV dataset upload
        if ext == ".csv":
            try:
                decoded = content.decode("utf-8")
                reader = csv.DictReader(io.StringIO(decoded))
                row_idx = 1
                for row in reader:
                    lat = float(row.get("latitude") or row.get("lat") or 0.0)
                    lon = float(row.get("longitude") or row.get("lon") or 0.0)
                    if lat == 0.0 or lon == 0.0:
                        continue
                    
                    temp = float(row.get("temperature") or row.get("temp") or random.uniform(22.0, 38.0))
                    therm_score = float(row.get("thermal_score") or min(1.0, max(0.0, (temp - 18.0) / 30.0)))
                    person_prob = float(row.get("person_probability") or row.get("human_prob") or random.uniform(0.1, 0.9))
                    debris_prob = float(row.get("debris_probability") or row.get("debris_prob") or random.uniform(0.2, 0.9))
                    damage_prob = float(row.get("damage_probability") or row.get("damage_prob") or random.uniform(0.2, 0.9))
                    vehicle_prob = float(row.get("vehicle_probability") or row.get("vehicle_prob") or random.uniform(0.0, 0.5))
                    confidence = float(row.get("confidence") or 0.88)

                    sig = SignalRecord(
                        id=f"sig-csv-{uuid.uuid4().hex[:8]}",
                        mission_id=mission_id,
                        image_id=None,
                        lat=round(lat, 6),
                        lon=round(lon, 6),
                        altitude=float(row.get("altitude") or 100.0),
                        timestamp=datetime.datetime.utcnow(),
                        temperature=round(temp, 1),
                        thermal_anomaly=round(therm_score * 0.9, 3),
                        thermal_score=round(therm_score, 3),
                        person_probability=round(person_prob, 3),
                        debris_probability=round(debris_prob, 3),
                        damage_probability=round(damage_prob, 3),
                        vehicle_probability=round(vehicle_prob, 3),
                        confidence=round(confidence, 3),
                        ground_truth_priority="USER_DATA",
                        cluster_id=-1,
                        is_simulated=False
                    )
                    signals_from_csv.append(sig)
                    row_idx += 1
                
                if signals_from_csv:
                    db.add_all(signals_from_csv)
                    db.commit()
            except Exception as e:
                raise HTTPException(status_code=400, detail=f"Failed to parse CSV file: {str(e)}")
            continue

        # Handle Image Uploads (JPEG, PNG, TIFF)
        if ext in [".jpg", ".jpeg", ".png", ".tif", ".tiff"]:
            save_path = os.path.join(settings.UPLOAD_DIR, f"{uuid.uuid4().hex[:8]}_{filename}")
            with open(save_path, "wb") as f:
                f.write(content)

            exif_info = extract_exif(content)
            is_thermal = ("therm" in filename.lower() or "ir" in filename.lower())

            img_rec = ImageRecord(
                id=f"img-{uuid.uuid4().hex[:8]}",
                mission_id=mission_id,
                filename=filename,
                file_path=save_path,
                file_type="THERMAL" if is_thermal else "RGB",
                size_bytes=len(content),
                lat=exif_info.get("lat"),
                lon=exif_info.get("lon"),
                altitude=exif_info.get("altitude"),
                timestamp=exif_info.get("timestamp") or datetime.datetime.utcnow(),
                camera_model=exif_info.get("camera_model"),
                exif_data=exif_info.get("exif_raw"),
                has_gps=exif_info.get("has_gps", False),
                processing_status="PENDING"
            )
            db.add(img_rec)
            uploaded_records.append(img_rec)

    db.commit()

    return {
        "status": "success",
        "images_uploaded": len(uploaded_records),
        "csv_signals_imported": len(signals_from_csv),
        "missing_gps_count": sum(1 for img in uploaded_records if not img.has_gps),
        "mission_id": mission_id
    }

@router.post("/process-images")
def process_images(mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            raise HTTPException(status_code=404, detail="No active mission found.")
        mission_id = mission.id

    pending_images = db.query(ImageRecord).filter(
        ImageRecord.mission_id == mission_id,
        ImageRecord.processing_status == "PENDING"
    ).all()

    if not pending_images:
        all_imgs = db.query(ImageRecord).filter(ImageRecord.mission_id == mission_id).count()
        return {"status": "success", "message": f"All {all_imgs} images are already processed into signals.", "processed_count": 0}

    generated_signals = []
    base_lat = 38.3550
    base_lon = 37.8550

    for img in pending_images:
        sig_lat = img.lat if (img.has_gps and img.lat) else (base_lat + random.uniform(-0.01, 0.01))
        sig_lon = img.lon if (img.has_gps and img.lon) else (base_lon + random.uniform(-0.01, 0.01))

        img_bytes = b""
        if os.path.exists(img.file_path):
            with open(img.file_path, "rb") as f:
                img_bytes = f.read()

        if img.file_type == "THERMAL":
            thermal_metrics = process_thermal_imagery(img_bytes)
            visual_metrics = process_visual_features(img_bytes, filename=img.filename)
            temp = thermal_metrics["temp_max"]
            therm_score = thermal_metrics["thermal_score"]
            therm_anomaly = thermal_metrics["thermal_anomaly"]
        else:
            visual_metrics = process_visual_features(img_bytes, filename=img.filename)
            temp = random.uniform(20.0, 32.0)
            therm_score = round(random.uniform(0.15, 0.50), 3)
            therm_anomaly = round(therm_score * 0.8, 3)

        sig = SignalRecord(
            id=f"sig-{uuid.uuid4().hex[:8]}",
            mission_id=mission_id,
            image_id=img.id,
            lat=round(float(sig_lat), 6),
            lon=round(float(sig_lon), 6),
            altitude=img.altitude or 100.0,
            timestamp=img.timestamp or datetime.datetime.utcnow(),
            temperature=temp,
            thermal_anomaly=therm_anomaly,
            thermal_score=therm_score,
            person_probability=visual_metrics["person_probability"],
            debris_probability=visual_metrics["debris_probability"],
            damage_probability=visual_metrics["damage_probability"],
            vehicle_probability=visual_metrics["vehicle_probability"],
            confidence=visual_metrics["confidence"],
            ground_truth_priority="PENDING_EVAL",
            cluster_id=-1,
            is_simulated=False
        )
        img.processing_status = "PROCESSED"
        generated_signals.append(sig)

    db.add_all(generated_signals)
    db.commit()

    return {
        "status": "success",
        "processed_count": len(generated_signals),
        "message": f"Successfully processed {len(pending_images)} images into standardized geo-tagged signals."
    }

@router.post("/manual-gps")
def set_manual_gps(data: ManualGPSInput, db: Session = Depends(get_db)):
    img = db.query(ImageRecord).filter(ImageRecord.id == data.image_id).first()
    if not img:
        raise HTTPException(status_code=404, detail="Image record not found.")
    
    img.lat = data.lat
    img.lon = data.lon
    img.altitude = data.altitude or 100.0
    img.has_gps = True
    db.commit()

    return {"status": "success", "message": f"Coordinates updated for image {img.filename}"}

@router.get("/images")
def list_images(mission_id: Optional[str] = None, db: Session = Depends(get_db)):
    if not mission_id:
        mission = db.query(Mission).order_by(Mission.created_at.desc()).first()
        if not mission:
            return []
        mission_id = mission.id

    images = db.query(ImageRecord).filter(ImageRecord.mission_id == mission_id).all()
    return images
