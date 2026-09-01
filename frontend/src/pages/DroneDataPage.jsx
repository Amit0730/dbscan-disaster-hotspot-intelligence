import React, { useState, useRef } from 'react';
import { useMission } from '../context/MissionContext';
import { api } from '../api/client';
import { TacticalBadge } from '../components/TacticalBadge';
import { formatBytes, formatTime } from '../utils/formatters';
import { formatCoords } from '../utils/geo';
import {
  UploadCloud,
  FileImage,
  FileSpreadsheet,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  MapPin,
  Clock,
  Camera,
  Trash2,
} from 'lucide-react';

export const DroneDataPage = () => {
  const { images, fetchMissionData, loadDemoMission, loading } = useMission();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [manualGpsModal, setManualGpsModal] = useState(null);
  const [manualCoords, setManualCoords] = useState({ lat: '38.3550', lon: '37.8550', altitude: '105' });
  const fileInputRef = useRef(null);

  const handleFileUpload = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await api.uploadFiles(formData);
      setUploadMsg(`Successfully uploaded ${res.images_uploaded} images and imported ${res.csv_signals_imported} signals.`);
      await fetchMissionData();
    } catch (err) {
      setUploadMsg(`Upload failed: ${err.message}`);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleProcessImages = async () => {
    setProcessing(true);
    try {
      const res = await api.processImages();
      setUploadMsg(res.message);
      await fetchMissionData();
    } catch (err) {
      setUploadMsg(`Processing error: ${err.message}`);
    } finally {
      setProcessing(false);
    }
  };

  const handleManualGpsSubmit = async () => {
    if (!manualGpsModal) return;
    try {
      await api.setManualGPS({
        image_id: manualGpsModal.id,
        lat: parseFloat(manualCoords.lat),
        lon: parseFloat(manualCoords.lon),
        altitude: parseFloat(manualCoords.altitude),
      });
      setManualGpsModal(null);
      await fetchMissionData();
    } catch (err) {
      alert(`Failed to update GPS: ${err.message}`);
    }
  };

  const missingGpsCount = images.filter((img) => !img.has_gps).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold font-mono text-slate-100 uppercase tracking-wide">
              Drone Telemetry & Imagery Ingestion
            </h1>
            <TacticalBadge variant="cyan">EXIF PARSER READY</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Ingest aerial drone survey images (JPEG, PNG, TIFF) or CSV signal records for feature extraction & spatial clustering.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadDemoMission()}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-mono font-semibold rounded bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-cyan-500/40 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Load Demo Mission</span>
          </button>

          <button
            onClick={handleProcessImages}
            disabled={processing}
            className="px-4 py-2 text-xs font-mono font-bold rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-lg shadow-cyan-500/20"
          >
            <Cpu className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            <span>{processing ? 'Processing...' : 'PROCESS IMAGES'}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Upload Status Banner */}
      {uploadMsg && (
        <div className="p-3.5 rounded-lg bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-between">
          <span>{uploadMsg}</span>
          <button onClick={() => setUploadMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">&times;</button>
        </div>
      )}

      {/* Upload Dropzone & Metadata Extractor card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Dropzone (2 cols) */}
        <div className="md:col-span-2 bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <UploadCloud className="w-4 h-4 text-cyan-400" />
            Aerial Payload Uploader
          </h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-slate-700 hover:border-cyan-500/60 bg-slate-950/60 rounded-xl p-8 text-center cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-cyan-950/60 border border-cyan-500/40 mx-auto flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Click or drag & drop drone images or CSV datasets
              </p>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Supported formats: <strong>JPEG, PNG, TIFF, CSV</strong>
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.tif,.tiff,.csv"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-slate-950 p-3 rounded-lg border border-slate-800">
            <span>Automatic EXIF Geotag Extraction: <strong>LAT, LON, ALT, TIME</strong></span>
            <span className="text-cyan-400 font-bold">{uploading ? 'UPLOADING...' : 'STANDBY'}</span>
          </div>
        </div>

        {/* Ingestion Info Panel (1 col) */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-6 shadow-xl space-y-4">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <Camera className="w-4 h-4 text-amber-400" />
            Ingestion Diagnostics
          </h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Total Survey Images:</span>
              <strong className="text-slate-200">{images.length}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">EXIF GPS Valid:</span>
              <strong className="text-emerald-400">
                {images.filter((img) => img.has_gps).length} / {images.length}
              </strong>
            </div>

            <div className="flex justify-between p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="text-slate-400">Missing Geotag Warning:</span>
              <strong className={missingGpsCount > 0 ? 'text-amber-400 font-bold' : 'text-slate-500'}>
                {missingGpsCount} files
              </strong>
            </div>

            <div className="p-3 rounded bg-slate-950 border border-slate-800/80 text-[11px] text-slate-400 leading-relaxed">
              If an image is missing GPS tags, the system will provide a fallback dialog to manually assign field survey coordinates.
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files Master Inventory Table */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-mono uppercase tracking-wider text-slate-300 font-bold flex items-center gap-1.5">
            <FileImage className="w-4 h-4 text-cyan-400" />
            Uploaded Drone Imagery & Telemetry Files ({images.length})
          </h2>
        </div>

        <div className="overflow-x-auto border border-slate-800 rounded-lg">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Filename</th>
                <th className="p-3">Sensor Type</th>
                <th className="p-3">Size</th>
                <th className="p-3">GPS Available</th>
                <th className="p-3">Coordinates / Alt</th>
                <th className="p-3">Camera Model</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
              {images.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-500">
                    No images uploaded yet. Click "Load Demo Mission" or upload survey frames.
                  </td>
                </tr>
              ) : (
                images.map((img) => (
                  <tr key={img.id} className="hover:bg-slate-800/40">
                    <td className="p-3 font-semibold text-slate-200 flex items-center gap-2">
                      <FileImage className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate max-w-xs">{img.filename}</span>
                    </td>
                    <td className="p-3">
                      <TacticalBadge variant={img.file_type === 'THERMAL' ? 'HIGH' : 'cyan'}>
                        {img.file_type}
                      </TacticalBadge>
                    </td>
                    <td className="p-3 text-slate-400">{formatBytes(img.size_bytes)}</td>
                    <td className="p-3">
                      {img.has_gps ? (
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> YES
                        </span>
                      ) : (
                        <span className="text-amber-400 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> NO GPS
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">
                      {img.has_gps && img.lat ? (
                        <span>{formatCoords(img.lat, img.lon)} ({img.altitude || 100}m)</span>
                      ) : (
                        <span className="text-slate-500">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400">{img.camera_model || 'Zenmuse H20T'}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          img.processing_status === 'PROCESSED'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : 'bg-amber-950 text-amber-400 border border-amber-800'
                        }`}
                      >
                        {img.processing_status}
                      </span>
                    </td>
                    <td className="p-3">
                      {!img.has_gps && (
                        <button
                          onClick={() => {
                            setManualGpsModal(img);
                            setManualCoords({
                              lat: img.lat ? String(img.lat) : '38.3550',
                              lon: img.lon ? String(img.lon) : '37.8550',
                              altitude: '105',
                            });
                          }}
                          className="px-2 py-1 text-[10px] rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 cursor-pointer"
                        >
                          Set GPS
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual GPS Coordinate Modal */}
      {manualGpsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 max-w-md w-full shadow-2xl space-y-4 font-mono text-xs">
            <h3 className="text-sm font-bold text-slate-100 uppercase">
              Manual GPS Assignment for {manualGpsModal.filename}
            </h3>
            <p className="text-slate-400 text-[11px]">
              Assign spatial coordinate coordinates extracted from flight logbook or survey metadata:
            </p>

            <div className="space-y-3">
              <div>
                <label className="text-slate-400 block mb-1">Latitude (°N/S)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualCoords.lat}
                  onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Longitude (°E/W)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualCoords.lon}
                  onChange={(e) => setManualCoords({ ...manualCoords, lon: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Altitude (meters)</label>
                <input
                  type="number"
                  value={manualCoords.altitude}
                  onChange={(e) => setManualCoords({ ...manualCoords, altitude: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-2 text-slate-200"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => setManualGpsModal(null)}
                className="px-3 py-1.5 rounded bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleManualGpsSubmit}
                className="px-4 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold cursor-pointer"
              >
                Save Geotag
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
