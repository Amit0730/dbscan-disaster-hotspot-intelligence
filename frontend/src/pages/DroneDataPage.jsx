import React, { useState, useRef } from 'react';
import { useMission } from '../context/MissionContext';
import { api } from '../api/client';
import { TacticalBadge } from '../components/TacticalBadge';
import { formatBytes, formatTime } from '../utils/formatters';
import { formatCoords } from '../utils/geo';
import {
  UploadCloud,
  FileImage,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Cpu,
  MapPin,
  Camera,
  Layers,
  Sparkles,
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
    <div className="p-4 sm:p-6 lg:p-7 space-y-6 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-lg font-bold text-slate-100 tracking-tight">
              Drone Telemetry & Imagery Ingestion
            </h1>
            <TacticalBadge variant="cyan">EXIF Geotag Parser</TacticalBadge>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Ingest aerial survey imagery (JPEG, PNG, TIFF) or CSV telemetry records for multi-sensor feature extraction.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadDemoMission()}
            disabled={loading}
            className="px-3.5 py-2 text-xs font-medium rounded-lg bg-white/[0.05] hover:bg-white/[0.1] text-sky-300 border border-sky-500/25 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Reset Demo Data</span>
          </button>

          <button
            onClick={handleProcessImages}
            disabled={processing}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 transition-all cursor-pointer flex items-center gap-1.5 shadow-md"
          >
            <Cpu className={`w-4 h-4 ${processing ? 'animate-spin' : ''}`} />
            <span>{processing ? 'Processing...' : 'Process Images'}</span>
          </button>
        </div>
      </div>

      {/* Notifications / Upload Status Banner */}
      {uploadMsg && (
        <div className="p-3.5 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-300 text-xs flex items-center justify-between">
          <span>{uploadMsg}</span>
          <button onClick={() => setUploadMsg(null)} className="text-slate-400 hover:text-white cursor-pointer">&times;</button>
        </div>
      )}

      {/* Upload Dropzone & Metadata Extractor card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Dropzone (2 cols) */}
        <div className="md:col-span-2 pro-card p-5 sm:p-6 space-y-4">
          <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <UploadCloud className="w-4 h-4 text-sky-400" />
            <span>Aerial Survey Ingestion Dropzone</span>
          </h2>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-white/[0.12] hover:border-sky-500/50 bg-[#0c0d12] rounded-xl p-8 text-center cursor-pointer transition-all space-y-3 group"
          >
            <div className="w-12 h-12 rounded-full bg-sky-500/10 border border-sky-500/20 mx-auto flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-200">
                Click or drag & drop aerial imagery or CSV files
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

          <div className="flex items-center justify-between text-xs font-mono text-slate-400 bg-white/[0.02] p-3 rounded-lg border border-white/[0.06]">
            <span>Automatic EXIF Geotag Extraction: <strong>LAT, LON, ALT, TIME</strong></span>
            <span className="text-sky-400 font-semibold">{uploading ? 'Uploading...' : 'Standby'}</span>
          </div>
        </div>

        {/* Ingestion Info Panel (1 col) */}
        <div className="pro-card p-5 sm:p-6 space-y-4">
          <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <Camera className="w-4 h-4 text-amber-400" />
            <span>Telemetry Diagnostics</span>
          </h2>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-400">Total Survey Images:</span>
              <strong className="text-slate-200 font-mono tabular-nums">{images.length}</strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-400">EXIF GPS Valid:</span>
              <strong className="text-emerald-400 font-mono tabular-nums">
                {images.filter((img) => img.has_gps).length} / {images.length}
              </strong>
            </div>

            <div className="flex justify-between p-2.5 rounded-lg bg-white/[0.03] border border-white/[0.06]">
              <span className="text-slate-400">Missing Geotag Warning:</span>
              <strong className={missingGpsCount > 0 ? 'text-amber-400 font-semibold font-mono tabular-nums' : 'text-slate-500 font-mono'}>
                {missingGpsCount} files
              </strong>
            </div>

            <div className="p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] text-[11px] text-slate-400 leading-relaxed font-sans">
              If an image is missing GPS tags, assign coordinates manually or use the mission logbook fallback.
            </div>
          </div>
        </div>
      </div>

      {/* Uploaded Files Master Inventory Table */}
      <div className="pro-card p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-semibold text-slate-200 flex items-center gap-2">
            <FileImage className="w-4 h-4 text-sky-400" />
            <span>Uploaded Imagery & Telemetry Files ({images.length})</span>
          </h2>
        </div>

        <div className="overflow-x-auto border border-white/[0.07] rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-white/[0.02] text-slate-400 uppercase text-[10px] font-mono border-b border-white/[0.07]">
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
            <tbody className="divide-y divide-white/[0.05] bg-[#11131a]/40 font-mono text-[11px]">
              {images.length === 0 ? (
                <tr>
                  <td colSpan="8" className="p-6 text-center text-slate-500 font-sans">
                    No images uploaded yet. Click "Reset Demo Data" to load standard survey frames.
                  </td>
                </tr>
              ) : (
                images.map((img) => (
                  <tr key={img.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="p-3 font-medium text-slate-200 flex items-center gap-2 font-sans">
                      <FileImage className="w-3.5 h-3.5 text-sky-400 shrink-0" />
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
                        <span className="text-emerald-400 font-semibold flex items-center gap-1 font-sans text-xs">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Yes
                        </span>
                      ) : (
                        <span className="text-amber-400 font-semibold flex items-center gap-1 font-sans text-xs">
                          <AlertTriangle className="w-3.5 h-3.5" /> Missing
                        </span>
                      )}
                    </td>
                    <td className="p-3 text-slate-300">
                      {img.has_gps && img.lat ? (
                        <span>{formatCoords(img.lat, img.lon)} ({img.altitude || 100}m)</span>
                      ) : (
                        <span className="text-slate-500 font-sans">Unassigned</span>
                      )}
                    </td>
                    <td className="p-3 text-slate-400 font-sans">{img.camera_model || 'Zenmuse H20T'}</td>
                    <td className="p-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          img.processing_status === 'PROCESSED'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/25'
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
                          className="px-2.5 py-1 text-[11px] rounded-lg bg-sky-500/10 hover:bg-sky-500/20 text-sky-300 border border-sky-500/25 cursor-pointer font-sans"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-[#141722] border border-white/[0.1] rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-100">
              Manual GPS Coordinates for {manualGpsModal.filename}
            </h3>
            <p className="text-slate-400 text-[11px]">
              Assign spatial coordinate coordinates extracted from flight logbook or survey metadata:
            </p>

            <div className="space-y-3 font-mono">
              <div>
                <label className="text-slate-400 block mb-1">Latitude (°N/S)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualCoords.lat}
                  onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Longitude (°E/W)</label>
                <input
                  type="number"
                  step="0.0001"
                  value={manualCoords.lon}
                  onChange={(e) => setManualCoords({ ...manualCoords, lon: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Altitude (meters)</label>
                <input
                  type="number"
                  value={manualCoords.altitude}
                  onChange={(e) => setManualCoords({ ...manualCoords, altitude: e.target.value })}
                  className="w-full bg-[#0c0d12] border border-white/[0.1] rounded-lg px-3 py-2 text-slate-200 focus:border-sky-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-white/[0.07]">
              <button
                onClick={() => setManualGpsModal(null)}
                className="px-3.5 py-1.5 rounded-lg bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleManualGpsSubmit}
                className="px-4 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-semibold cursor-pointer shadow-sm"
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
