import io
import datetime
from PIL import Image
from PIL.ExifTags import TAGS, GPSTAGS
from typing import Dict, Any

def _convert_dms_to_dd(dms_values, ref: str) -> float:
    try:
        degrees = float(dms_values[0])
        minutes = float(dms_values[1])
        seconds = float(dms_values[2])
        dd = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if ref in ['S', 'W']:
            dd = -dd
        return round(dd, 6)
    except Exception:
        return 0.0

def extract_exif(image_bytes: bytes) -> Dict[str, Any]:
    metadata = {
        "has_gps": False,
        "lat": None,
        "lon": None,
        "altitude": None,
        "timestamp": datetime.datetime.utcnow(),
        "camera_model": "Standard Optical/Thermal Sensor",
        "exif_raw": {}
    }

    try:
        image = Image.open(io.BytesIO(image_bytes))
        exif_raw = image._getexif()

        if not exif_raw:
            return metadata

        gps_info = {}
        for tag_id, value in exif_raw.items():
            tag = TAGS.get(tag_id, tag_id)
            if tag == "GPSInfo":
                for gps_tag_id, gps_val in value.items():
                    sub_tag = GPSTAGS.get(gps_tag_id, gps_tag_id)
                    gps_info[sub_tag] = gps_val
            elif tag == "Model":
                metadata["camera_model"] = str(value)
            elif tag == "DateTimeOriginal":
                try:
                    metadata["timestamp"] = datetime.datetime.strptime(str(value), "%Y:%m:%d %H:%M:%S")
                except Exception:
                    pass

        if gps_info:
            lat_dms = gps_info.get(2) or gps_info.get("GPSLatitude")
            lat_ref = gps_info.get(1) or gps_info.get("GPSLatitudeRef", "N")
            lon_dms = gps_info.get(4) or gps_info.get("GPSLongitude")
            lon_ref = gps_info.get(3) or gps_info.get("GPSLongitudeRef", "E")

            if lat_dms and lon_dms:
                metadata["lat"] = _convert_dms_to_dd(lat_dms, str(lat_ref))
                metadata["lon"] = _convert_dms_to_dd(lon_dms, str(lon_ref))
                metadata["has_gps"] = True

            alt = gps_info.get(6) or gps_info.get("GPSAltitude")
            if alt:
                try:
                    metadata["altitude"] = round(float(alt), 1)
                except Exception:
                    metadata["altitude"] = 100.0

        metadata["exif_raw"] = {"camera": metadata["camera_model"], "gps_detected": metadata["has_gps"]}
    except Exception as e:
        metadata["exif_raw"] = {"error": str(e)}

    return metadata
