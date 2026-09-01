import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../api/client';

const MissionContext = createContext(null);

export const MissionProvider = ({ children }) => {
  const [mission, setMission] = useState(null);
  const [stats, setStats] = useState(null);
  const [signals, setSignals] = useState([]);
  const [clusters, setClusters] = useState([]);
  const [groundTruth, setGroundTruth] = useState([]);
  const [flightPath, setFlightPath] = useState([]);
  const [validation, setValidation] = useState(null);
  const [images, setImages] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCluster, setSelectedCluster] = useState(null);
  const [selectedSignal, setSelectedSignal] = useState(null);

  // Clustering parameter state
  const [dbscanParams, setDbscanParams] = useState({
    eps_meters: 100.0,
    min_samples: 5,
  });

  // Active Map Layer toggles
  const [activeLayers, setActiveLayers] = useState({
    thermal: true,
    visual: true,
    clusters: true,
    noise: true,
    groundTruth: true,
    flightPath: true,
    hulls: true,
  });

  // Time filter state (in minutes from survey start: 0 to 600 min, i.e., 08:00 to 18:00)
  const [timeFilterMinutes, setTimeFilterMinutes] = useState(600);

  // Load all mission data
  const fetchMissionData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [m, sigs, cls, gt, fp, val, imgs] = await Promise.all([
        api.getCurrentMission(),
        api.getSignals(),
        api.getClusters(),
        api.getGroundTruth(),
        api.getFlightPath(),
        api.getValidationResults().catch(() => null),
        api.getImages().catch(() => []),
      ]);

      setMission(m);
      setStats(m.stats);
      setSignals(sigs || []);
      setClusters(cls || []);
      setGroundTruth(gt || []);
      setFlightPath(fp || []);
      setValidation(val);
      setImages(imgs || []);
    } catch (err) {
      console.error('Failed to load mission data:', err);
      setError(err.message || 'Failed to load mission data');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data on component mount
  useEffect(() => {
    fetchMissionData();
  }, [fetchMissionData]);

  // Load or reset demo mission
  const handleLoadDemoMission = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.loadDemoMission();
      await fetchMissionData();
      return res;
    } catch (err) {
      setError(err.message || 'Failed to load demo mission');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Run DBSCAN with custom params
  const handleRunDBSCAN = async (params = dbscanParams) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.runDBSCAN(params);
      setDbscanParams(params);
      await fetchMissionData();
      return res;
    } catch (err) {
      setError(err.message || 'DBSCAN execution failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Evaluate ground-truth validation
  const handleRunValidation = async (matchRadius = 140.0) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.evaluateValidation({ match_radius_meters: matchRadius });
      setValidation(res);
      return res;
    } catch (err) {
      setError(err.message || 'Validation evaluation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Filter signals based on current time slider
  const visibleSignals = signals.filter((s) => {
    if (!s.timestamp) return true;
    const sigDate = new Date(s.timestamp);
    // Reference start time: 08:00 AM
    const startHour = 8;
    const sigMinutes = (sigDate.getHours() - startHour) * 60 + sigDate.getMinutes();
    return sigMinutes <= timeFilterMinutes;
  });

  const toggleLayer = (layerKey) => {
    setActiveLayers((prev) => ({ ...prev, [layerKey]: !prev[layerKey] }));
  };

  const value = {
    mission,
    stats,
    signals,
    visibleSignals,
    clusters,
    groundTruth,
    flightPath,
    validation,
    images,
    loading,
    error,
    selectedCluster,
    setSelectedCluster,
    selectedSignal,
    setSelectedSignal,
    dbscanParams,
    setDbscanParams,
    activeLayers,
    toggleLayer,
    timeFilterMinutes,
    setTimeFilterMinutes,
    fetchMissionData,
    loadDemoMission: handleLoadDemoMission,
    runDBSCAN: handleRunDBSCAN,
    runValidation: handleRunValidation,
  };

  return <MissionContext.Provider value={value}>{children}</MissionContext.Provider>;
};

export const useMission = () => {
  const context = useContext(MissionContext);
  if (!context) throw new Error('useMission must be used within a MissionProvider');
  return context;
};
