import pytest
from fastapi.testclient import TestClient
from backend.app.main import app

client = TestClient(app)

def test_api_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ONLINE"
    assert data["mapping_id"] == "SIH26030"

def test_load_demo_mission_and_statistics():
    # 1. Load demo mission
    resp = client.post("/api/missions/demo")
    assert resp.status_code == 200
    demo_data = resp.json()
    assert demo_data["status"] == "success"
    assert demo_data["stats"]["total_signals"] >= 300
    assert demo_data["stats"]["dbscan_clusters"] > 0

    # 2. Get statistics
    resp_stats = client.get("/api/missions/statistics")
    assert resp_stats.status_code == 200
    stats = resp_stats.json()
    assert stats["total_signals"] >= 300

    # 3. Get clusters
    resp_clusters = client.get("/api/clustering/clusters")
    assert resp_clusters.status_code == 200
    clusters = resp_clusters.json()
    assert len(clusters) > 0
    assert "priority_score" in clusters[0]
    assert "convex_hull_geojson" in clusters[0]

    # 4. Run DBSCAN with different parameters
    resp_run = client.post("/api/clustering/run", json={"eps_meters": 120.0, "min_samples": 6})
    assert resp_run.status_code == 200
    run_data = resp_run.json()
    assert run_data["status"] == "success"

    # 5. Get validation results
    resp_val = client.get("/api/validation/results")
    assert resp_val.status_code == 200
    val_data = resp_val.json()
    assert "precision" in val_data
    assert "f1_score" in val_data
    assert "details" in val_data

    # 6. Generate report
    resp_rep = client.get("/api/report/summary")
    assert resp_rep.status_code == 200
    rep_data = resp_rep.json()
    assert "methodology" in rep_data
    assert "recommendations" in rep_data
