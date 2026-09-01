// Client-side fallback computation engine for static hosting (GitHub Pages)
// Implements exact same Geodesic Haversine DBSCAN, 5-Factor Scoring, and Validation

const EARTH_RADIUS_M = 6371000.0;

export const haversineDistanceM = (lat1, lon1, lat2, lon2) => {
  const toRad = (x) => (x * Math.PI) / 180.0;
  const phi1 = toRad(lat1);
  const phi2 = toRad(lat2);
  const deltaPhi = toRad(lat2 - lat1);
  const deltaLambda = toRad(lon2 - lon1);

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_M * c;
};

export const calculatePriorityScore = (avgThermal, avgPerson, avgDebris, avgDamage, density) => {
  const normDensity = Math.min(1.0, Math.max(0.0, density / 250.0));
  const score =
    (0.35 * avgThermal +
      0.30 * avgPerson +
      0.15 * avgDebris +
      0.10 * avgDamage +
      0.10 * normDensity) *
    100.0;

  const priorityScore = Math.round(Math.min(100.0, Math.max(0.0, score)) * 10) / 10;

  let classification = 'LOW';
  let action = 'ROUTINE PATROL & LOGISTICS: Monitor area perimeter and clear supply routes.';

  if (priorityScore >= 90.0) {
    classification = 'CRITICAL';
    action = 'IMMEDIATE SEARCH & EXTRACTION: Deploy heavy USAR rescue team and canine units.';
  } else if (priorityScore >= 75.0) {
    classification = 'HIGH';
    action = 'RAPID RECONNAISSANCE & ASSESS: Dispatch aerial tactical team for structural entry.';
  } else if (priorityScore >= 50.0) {
    classification = 'MEDIUM';
    action = 'STRUCTURAL MONITORING: Conduct secondary acoustic sweep and hazard check.';
  }

  return { priorityScore, classification, action };
};

// Real DBSCAN in JavaScript using Haversine Metric
export const runLocalDBSCAN = (signals, epsMeters = 100.0, minSamples = 5) => {
  const n = signals.length;
  const visited = new Array(n).fill(false);
  const clusterIds = new Array(n).fill(-1);
  let currentCluster = 0;

  const regionQuery = (pointIdx) => {
    const neighbors = [];
    const p1 = signals[pointIdx];
    for (let i = 0; i < n; i++) {
      const p2 = signals[i];
      const dist = haversineDistanceM(p1.lat, p1.lon, p2.lat, p2.lon);
      if (dist <= epsMeters) {
        neighbors.push(i);
      }
    }
    return neighbors;
  };

  for (let i = 0; i < n; i++) {
    if (visited[i]) continue;
    visited[i] = true;

    const neighbors = regionQuery(i);
    if (neighbors.length < minSamples) {
      clusterIds[i] = -1; // Noise point
    } else {
      clusterIds[i] = currentCluster;
      const queue = [...neighbors];

      let qIdx = 0;
      while (qIdx < queue.length) {
        const neighborIdx = queue[qIdx];
        qIdx++;

        if (!visited[neighborIdx]) {
          visited[neighborIdx] = true;
          const secondaryNeighbors = regionQuery(neighborIdx);
          if (secondaryNeighbors.length >= minSamples) {
            for (const sn of secondaryNeighbors) {
              if (!queue.includes(sn)) queue.push(sn);
            }
          }
        }

        if (clusterIds[neighborIdx] === -1) {
          clusterIds[neighborIdx] = currentCluster;
        }
      }
      currentCluster++;
    }
  }

  // Update signals with cluster IDs
  const updatedSignals = signals.map((s, idx) => ({ ...s, cluster_id: clusterIds[idx] }));

  // Generate Cluster Records
  const clusters = [];
  const clusterSizes = [];
  const clusterDensities = [];

  for (let k = 0; k < currentCluster; k++) {
    const clusterSignals = updatedSignals.filter((s) => s.cluster_id === k);
    const count = clusterSignals.length;
    clusterSizes.push(count);

    const centerLat =
      clusterSignals.reduce((acc, s) => acc + s.lat, 0) / count;
    const centerLon =
      clusterSignals.reduce((acc, s) => acc + s.lon, 0) / count;

    const avgThermal =
      clusterSignals.reduce((acc, s) => acc + s.thermal_score, 0) / count;
    const avgPerson =
      clusterSignals.reduce((acc, s) => acc + s.person_probability, 0) / count;
    const avgDebris =
      clusterSignals.reduce((acc, s) => acc + s.debris_probability, 0) / count;
    const avgDamage =
      clusterSignals.reduce((acc, s) => acc + s.damage_probability, 0) / count;
    const avgVehicle =
      clusterSignals.reduce((acc, s) => acc + (s.vehicle_probability || 0), 0) / count;

    // Approximate area
    const radiusDeg = (epsMeters * 0.75) / 111000.0;
    const ring = [];
    for (let angle = 0; angle <= 2 * Math.PI; angle += Math.PI / 8) {
      const pLat = centerLat + radiusDeg * Math.sin(angle);
      const pLon =
        centerLon +
        (radiusDeg / Math.cos((centerLat * Math.PI) / 180.0)) * Math.cos(angle);
      ring.push([Math.round(pLon * 1e6) / 1e6, Math.round(pLat * 1e6) / 1e6]);
    }

    const areaKm2 = Math.PI * Math.pow((epsMeters * 0.75) / 1000.0, 2);
    const density = Math.round((count / Math.max(areaKm2, 0.001)) * 10) / 10;
    clusterDensities.push(density);

    const { priorityScore, classification, action } = calculatePriorityScore(
      avgThermal,
      avgPerson,
      avgDebris,
      avgDamage,
      density
    );

    clusters.push({
      id: `cluster-${k + 1}-demo`,
      mission_id: 'demo-mission-sih26030',
      cluster_label: k,
      center_lat: Math.round(centerLat * 1e6) / 1e6,
      center_lon: Math.round(centerLon * 1e6) / 1e6,
      signal_count: count,
      avg_thermal_score: Math.round(avgThermal * 1000) / 1000,
      avg_person_prob: Math.round(avgPerson * 1000) / 1000,
      avg_debris_prob: Math.round(avgDebris * 1000) / 1000,
      avg_damage_prob: Math.round(avgDamage * 1000) / 1000,
      avg_vehicle_prob: Math.round(avgVehicle * 1000) / 1000,
      cluster_density: density,
      priority_score: priorityScore,
      classification,
      recommended_action: action,
      convex_hull_geojson: {
        type: 'Polygon',
        coordinates: [ring],
      },
    });
  }

  clusters.sort((a, b) => b.priority_score - a.priority_score);

  const noiseCount = clusterIds.filter((id) => id === -1).length;
  const stats = {
    total_signals: signals.length,
    clusters_count: clusters.length,
    noise_count: noiseCount,
    largest_cluster_size: clusterSizes.length > 0 ? Math.max(...clusterSizes) : 0,
    avg_cluster_size:
      clusterSizes.length > 0
        ? Math.round((clusterSizes.reduce((a, b) => a + b, 0) / clusterSizes.length) * 10) / 10
        : 0.0,
    avg_density:
      clusterDensities.length > 0
        ? Math.round((clusterDensities.reduce((a, b) => a + b, 0) / clusterDensities.length) * 10) / 10
        : 0.0,
  };

  return { signals: updatedSignals, clusters, stats };
};

// Ground-truth validation in JS
export const validateHotspotsLocal = (clusters, groundTruth, matchRadiusMeters = 140.0) => {
  const candidateMatches = [];
  for (const c of clusters) {
    for (const gt of groundTruth) {
      const dist = haversineDistanceM(c.center_lat, c.center_lon, gt.lat, gt.lon);
      if (dist <= matchRadiusMeters) {
        candidateMatches.push({ dist, c, gt });
      }
    }
  }

  candidateMatches.sort((a, b) => a.dist - b.dist);

  const matchedCIds = new Set();
  const matchedGtIds = new Set();
  const distanceErrors = [];
  const matchedPairs = [];

  for (const { dist, c, gt } of candidateMatches) {
    if (!matchedCIds.has(c.id) && !matchedGtIds.has(gt.id)) {
      matchedCIds.add(c.id);
      matchedGtIds.add(gt.id);
      distanceErrors.push(dist);

      matchedPairs.push({
        cluster_id: c.id,
        cluster_label: c.cluster_label,
        predicted_priority: c.classification,
        predicted_score: c.priority_score,
        gt_id: gt.id,
        gt_name: gt.name,
        gt_priority: gt.actual_priority,
        gt_zone_type: gt.zone_type,
        distance_meters: Math.round(dist * 10) / 10,
        match_status: 'MATCHED',
        cluster_center: [c.center_lat, c.center_lon],
        gt_center: [gt.lat, gt.lon],
      });
    }
  }

  for (const c of clusters) {
    if (!matchedCIds.has(c.id)) {
      matchedPairs.push({
        cluster_id: c.id,
        cluster_label: c.cluster_label,
        predicted_priority: c.classification,
        predicted_score: c.priority_score,
        gt_id: null,
        gt_name: 'No Associated Ground Truth',
        gt_priority: 'N/A',
        gt_zone_type: 'False Positive Hotspot',
        distance_meters: null,
        match_status: 'UNMATCHED_PREDICTION',
        cluster_center: [c.center_lat, c.center_lon],
        gt_center: null,
      });
    }
  }

  for (const gt of groundTruth) {
    if (!matchedGtIds.has(gt.id)) {
      matchedPairs.push({
        cluster_id: null,
        cluster_label: null,
        predicted_priority: 'N/A',
        predicted_score: null,
        gt_id: gt.id,
        gt_name: gt.name,
        gt_priority: gt.actual_priority,
        gt_zone_type: gt.zone_type,
        distance_meters: null,
        match_status: 'MISSED_GROUND_TRUTH',
        cluster_center: null,
        gt_center: [gt.lat, gt.lon],
      });
    }
  }

  const tp = matchedCIds.size;
  const fp = clusters.length - tp;
  const fn = groundTruth.length - matchedGtIds.size;

  const precision = tp + fp > 0 ? Math.round((tp / (tp + fp)) * 1000) / 10 : 0.0;
  const recall = tp + fn > 0 ? Math.round((tp / (tp + fn)) * 1000) / 10 : 0.0;
  const f1 = precision + recall > 0 ? Math.round(((2 * precision * recall) / (precision + recall)) * 10) / 10 : 0.0;
  const coverage = groundTruth.length > 0 ? Math.round((matchedGtIds.size / groundTruth.length) * 1000) / 10 : 0.0;
  const avgDist =
    distanceErrors.length > 0
      ? Math.round((distanceErrors.reduce((a, b) => a + b, 0) / distanceErrors.length) * 10) / 10
      : 0.0;

  return {
    precision,
    recall,
    f1_score: f1,
    coverage,
    false_hotspots: fp,
    missed_zones: fn,
    avg_distance_error: avgDist,
    evaluated_at: new Date().toISOString(),
    details: matchedPairs,
  };
};

// Generate full 385 demo signals in JS
export const generateDemoSignalsLocal = () => {
  const signals = [];
  const baseLat = 38.355;
  const baseLon = 37.855;
  const startTime = new Date(2026, 8, 1, 8, 0, 0);

  const zoneConfigs = [
    {
      name: 'Sector Alpha - Collapsed Residential Complex',
      center: [38.3588, 37.8515],
      zone_type: 'Potential Survivor Zone',
      actual_priority: 'CRITICAL',
      count: 95,
      spread: [0.0016, 0.0022],
      angle: 35.0,
      temp: [35.5, 39.8],
      human: [0.75, 0.96],
      debris: [0.65, 0.9],
      damage: [0.85, 0.99],
      vehicle: [0.05, 0.25],
    },
    {
      name: 'Sector Bravo - Overpass & Transport Debris',
      center: [38.3512, 37.8465],
      zone_type: 'Heavy Debris Zone',
      actual_priority: 'HIGH',
      count: 75,
      spread: [0.0025, 0.0012],
      angle: -45.0,
      temp: [24.0, 31.5],
      human: [0.25, 0.6],
      debris: [0.85, 0.99],
      damage: [0.78, 0.95],
      vehicle: [0.45, 0.85],
    },
    {
      name: 'Sector Charlie - Damaged Industrial Facility',
      center: [38.3625, 37.8635],
      zone_type: 'Damaged Building Zone',
      actual_priority: 'HIGH',
      count: 65,
      spread: [0.0018, 0.0018],
      angle: 15.0,
      temp: [38.0, 48.5],
      human: [0.35, 0.68],
      debris: [0.5, 0.8],
      damage: [0.8, 0.96],
      vehicle: [0.3, 0.65],
    },
    {
      name: 'Sector Delta - Evacuation Gathering Point',
      center: [38.3485, 37.8615],
      zone_type: 'Mixed Signal Zone',
      actual_priority: 'MEDIUM',
      count: 55,
      spread: [0.0015, 0.002],
      angle: 60.0,
      temp: [32.0, 37.2],
      human: [0.55, 0.82],
      debris: [0.2, 0.45],
      damage: [0.25, 0.55],
      vehicle: [0.6, 0.9],
    },
    {
      name: 'Sector Echo - Agricultural / Perimeter Outskirts',
      center: [38.3425, 37.851],
      zone_type: 'Low Priority Zone',
      actual_priority: 'LOW',
      count: 40,
      spread: [0.0022, 0.0025],
      angle: 0.0,
      temp: [19.0, 25.0],
      human: [0.05, 0.3],
      debris: [0.05, 0.25],
      damage: [0.05, 0.2],
      vehicle: [0.02, 0.15],
    },
  ];

  const groundTruth = zoneConfigs.map((zc, idx) => ({
    id: `gt-zone-${idx + 1}`,
    mission_id: 'demo-mission-sih26030',
    name: zc.name,
    lat: zc.center[0],
    lon: zc.center[1],
    radius_meters: zc.actual_priority === 'CRITICAL' || zc.actual_priority === 'HIGH' ? 120.0 : 90.0,
    actual_priority: zc.actual_priority,
    zone_type: zc.zone_type,
    description: `Sector zone ${idx + 1}`,
  }));

  let sigIdx = 1;
  for (const zc of zoneConfigs) {
    const rad = (zc.angle * Math.PI) / 180.0;
    const cosA = Math.cos(rad);
    const sinA = Math.sin(rad);

    for (let i = 0; i < zc.count; i++) {
      const u = (Math.random() - 0.5) * 1.5;
      const v = (Math.random() - 0.5) * 1.5;
      const dLat = (u * cosA - v * sinA) * zc.spread[0];
      const dLon = (u * sinA + v * cosA) * zc.spread[1];

      const temp = zc.temp[0] + Math.random() * (zc.temp[1] - zc.temp[0]);
      const thermScore = Math.min(1.0, Math.max(0.0, (temp - 18.0) / 30.0));

      const timeOffset = Math.floor(Math.random() * 540) + 15;
      const sigTime = new Date(startTime.getTime() + timeOffset * 60000);

      signals.push({
        id: `sig-${String(sigIdx).padStart(4, '0')}`,
        mission_id: 'demo-mission-sih26030',
        image_id: `img-${String((sigIdx % 40) + 1).padStart(3, '0')}`,
        lat: Math.round((zc.center[0] + dLat) * 1e6) / 1e6,
        lon: Math.round((zc.center[1] + dLon) * 1e6) / 1e6,
        altitude: Math.round((90.0 + Math.random() * 25.0) * 10) / 10,
        timestamp: sigTime.toISOString(),
        temperature: Math.round(temp * 10) / 10,
        thermal_anomaly: Math.round(thermScore * (0.85 + Math.random() * 0.15) * 1000) / 1000,
        thermal_score: Math.round(thermScore * 1000) / 1000,
        person_probability: Math.round((zc.human[0] + Math.random() * (zc.human[1] - zc.human[0])) * 1000) / 1000,
        debris_probability: Math.round((zc.debris[0] + Math.random() * (zc.debris[1] - zc.debris[0])) * 1000) / 1000,
        damage_probability: Math.round((zc.damage[0] + Math.random() * (zc.damage[1] - zc.damage[0])) * 1000) / 1000,
        vehicle_probability: Math.round((zc.vehicle[0] + Math.random() * (zc.vehicle[1] - zc.vehicle[0])) * 1000) / 1000,
        confidence: Math.round((0.8 + Math.random() * 0.18) * 1000) / 1000,
        ground_truth_priority: zc.actual_priority,
        cluster_id: -1,
        is_simulated: true,
      });
      sigIdx++;
    }
  }

  // 65 Random noise points
  for (let i = 0; i < 65; i++) {
    const temp = 18.5 + Math.random() * 10.5;
    const timeOffset = Math.floor(Math.random() * 560) + 10;
    const sigTime = new Date(startTime.getTime() + timeOffset * 60000);

    signals.push({
      id: `sig-${String(sigIdx).padStart(4, '0')}`,
      mission_id: 'demo-mission-sih26030',
      image_id: `img-${String((sigIdx % 40) + 1).padStart(3, '0')}`,
      lat: Math.round((38.339 + Math.random() * 0.03) * 1e6) / 1e6,
      lon: Math.round((37.841 + Math.random() * 0.03) * 1e6) / 1e6,
      altitude: Math.round((95.0 + Math.random() * 25.0) * 10) / 10,
      timestamp: sigTime.toISOString(),
      temperature: Math.round(temp * 10) / 10,
      thermal_anomaly: Math.round(Math.random() * 0.3 * 1000) / 1000,
      thermal_score: Math.round(((temp - 18.0) / 30.0) * 1000) / 1000,
      person_probability: Math.round((0.02 + Math.random() * 0.2) * 1000) / 1000,
      debris_probability: Math.round((0.05 + Math.random() * 0.3) * 1000) / 1000,
      damage_probability: Math.round((0.02 + Math.random() * 0.25) * 1000) / 1000,
      vehicle_probability: Math.round((0.01 + Math.random() * 0.3) * 1000) / 1000,
      confidence: Math.round((0.55 + Math.random() * 0.25) * 1000) / 1000,
      ground_truth_priority: 'NOISE',
      cluster_id: -1,
      is_simulated: true,
    });
    sigIdx++;
  }

  // 35 Flight Waypoints
  const flightPath = [];
  let wpSeq = 1;
  flightPath.push({
    id: `wp-${String(wpSeq).padStart(3, '0')}`,
    sequence: wpSeq,
    lat: 38.3385,
    lon: 37.8405,
    altitude: 0.0,
    timestamp: startTime.toISOString(),
    speed_mps: 0.0,
    action_type: 'TAKEOFF',
  });
  wpSeq++;

  const latStripes = [38.34, 38.344, 38.348, 38.352, 38.356, 38.36, 38.364, 38.368];
  let curTime = new Date(startTime.getTime());

  latStripes.forEach((latVal, idx) => {
    const lons = idx % 2 === 0 ? [37.842, 37.856, 37.87] : [37.87, 37.856, 37.842];
    lons.forEach((lonVal) => {
      curTime = new Date(curTime.getTime() + 18 * 60000);
      flightPath.push({
        id: `wp-${String(wpSeq).padStart(3, '0')}`,
        sequence: wpSeq,
        lat: Math.round(latVal * 1e6) / 1e6,
        lon: Math.round(lonVal * 1e6) / 1e6,
        altitude: 105.0,
        timestamp: curTime.toISOString(),
        speed_mps: 14.0,
        action_type: wpSeq % 2 === 0 ? 'CAPTURE' : 'SURVEY',
      });
      wpSeq++;
    });
  });

  return { signals, groundTruth, flightPath };
};
