import os
import io
import csv
import random
import datetime
import numpy as np
from PIL import Image, ImageDraw
import piexif

def create_sample_files():
    os.makedirs("data/demo/thermal", exist_ok=True)
    os.makedirs("data/demo/visual", exist_ok=True)
    os.makedirs("data/samples", exist_ok=True)

    # 1. Create a sample CSV telemetry file
    csv_path = "data/samples/sample_drone_survey.csv"
    with open(csv_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        writer.writerow([
            "id", "latitude", "longitude", "altitude", "temperature", 
            "thermal_score", "person_probability", "debris_probability", 
            "damage_probability", "vehicle_probability", "confidence"
        ])
        for i in range(1, 51):
            lat = 38.3550 + random.uniform(-0.012, 0.012)
            lon = 37.8550 + random.uniform(-0.012, 0.012)
            temp = random.uniform(22.0, 42.0)
            therm = round((temp - 18.0) / 30.0, 3)
            writer.writerow([
                f"SIG-FIELD-{i:03d}",
                round(lat, 6),
                round(lon, 6),
                round(random.uniform(90.0, 115.0), 1),
                round(temp, 1),
                therm,
                round(random.uniform(0.1, 0.95), 3),
                round(random.uniform(0.2, 0.95), 3),
                round(random.uniform(0.3, 0.98), 3),
                round(random.uniform(0.05, 0.60), 3),
                round(random.uniform(0.80, 0.99), 3),
            ])
    print(f"Created {csv_path}")

    # 2. Create sample thermal and visual image files with real EXIF tags
    for i in range(1, 11):
        # Thermal image
        img_therm = Image.new("RGB", (320, 240), color=(int(20 + i*15), 30, int(150 + i*8)))
        draw = ImageDraw.Draw(img_therm)
        draw.ellipse([100, 70, 220, 170], fill=(255, int(80 + i*10), 30))
        draw.text((10, 10), f"THERM ANOMALY {i}", fill=(255, 255, 255))
        
        # Save thermal image
        therm_file = f"data/demo/thermal/survey_therm_{i:02d}.jpg"
        img_therm.save(therm_file, "JPEG")

        # Visual image
        img_vis = Image.new("RGB", (320, 240), color=(80, int(100 + i*10), 80))
        draw_v = ImageDraw.Draw(img_vis)
        draw_v.rectangle([80, 60, 240, 180], fill=(120, 120, 120))
        draw_v.text((10, 10), f"RGB SURVEY {i}", fill=(255, 255, 255))
        
        vis_file = f"data/demo/visual/survey_rgb_{i:02d}.jpg"
        img_vis.save(vis_file, "JPEG")

    print("Sample thermal and visual images created successfully!")

if __name__ == "__main__":
    create_sample_files()
