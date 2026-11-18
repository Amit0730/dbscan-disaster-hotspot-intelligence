import React, { useState, useRef } from 'react';
import { useMission } from '../context/MissionContext';
import { api } from '../api/client';
import { SeverityBadge } from '../components/SeverityBadge';
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
  FileText,
  Info,
  Clock,
  Check,
  X,
  SlidersHorizontal,
} from 'lucide-react';

export const DroneDataPage = () => {
  const { images, fetchMissionData, loadDemoMission, loading } = useMission();
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);
  const [manualGpsModal, setManualGpsModal] = useState(null);
  const [manualCoords, setManualCoords] = useState({ lat: '38.3550', lon: '37.8550', altitude: '105' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileUpload = async (files) => {
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append('files', files[i]);
    }

    setUploading(true);
    setUploadMsg(null);
    try {
      const res = await api.uploadFiles(formData);
      setUploadMsg({
        type: 'success',
        text: `Ingested ${res.images_uploaded ?? files.length} files. Imported ${res.csv_signals_imported ?? 0} direct CSV signals.`
      });
      await fetchMissionData();
    } catch (err) {
      setUploadMsg({
        type: 'error',
        text: `Upload failed: ${err.message}`
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleProcessImages = async () => {
    setProcessing(true);
    try {
      const res = await api.processImages();
      setUploadMsg({
        type: 'success',
        text: res.message || 'Signal extraction complete: Extracted coordinate telemetry and radiometric signals.'
      });
      await fetchMissionData();
    } catch (err) {
      setUploadMsg({
        type: 'error',
        text: `Processing error: ${err.message}`
      });
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
      setUploadMsg({
        type: 'success',
        text: `Coordinates manually mapped for ${manualGpsModal.filename}`
      });
    } catch (err) {
      setUploadMsg({
        type: 'error',
        text: `GPS calibration failed: ${err.message}`
      });
    }
  };

  const validGpsCount = images.filter((img) => img.gps_lat != null && img.gps_lon != null).length;
  const processedCount = images.filter((img) => img.processed).length;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto text-[#EAF2FF]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#27364C]">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-[#00B7FF] uppercase">
              Sensor Ingestion
            </span>
            <span className="text-[#27364C]">•</span>
            <span className="text-[10px] font-mono text-[#98AAC2]">EXIF & CSV Payload Extraction</span>
          </div>
          <h1 className="text-xl font-bold text-[#EAF2FF] tracking-tight mt-0.5">
            Drone Survey Data & Flight Ingestion
          </h1>
          <p className="text-xs text-[#98AAC2] mt-0.5">
            Ingest aerial aerial reconnaissance media, validate WGS-84 metadata, and extract feature vectors for DBSCAN clustering.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <button
            onClick={loadDemoMission}
            disabled={loading}
            className="px-3 py-1.5 bg-[#18263A] hover:bg-[#1f324d] text-xs font-mono text-[#EAF2FF] border border-[#27364C] rounded transition disabled:opacity-50"
          >
            Load 385-Signal Scenario
          </button>
          <button
            onClick={handleProcessImages}
            disabled={processing || images.length === 0}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#00B7FF] hover:bg-[#00a3e3] text-[#0A101B] font-mono text-xs font-bold rounded transition disabled:opacity-50"
          >
            <Cpu className={`w-3.5 h-3.5 ${processing ? 'animate-spin' : ''}`} />
            Extract Signals ({images.length})
          </button>
        </div>
      </div>

      {/* Operational Feedback Notice */}
      {uploadMsg && (
        <div className={`p-3.5 rounded border text-xs font-mono flex items-center justify-between ${
          uploadMsg.type === 'error'
            ? 'bg-[#FF5A70]/10 border-[#FF5A70]/30 text-[#FF5A70]'
            : 'bg-[#18D9A4]/10 border-[#18D9A4]/30 text-[#18D9A4]'
        }`}>
          <div className="flex items-center gap-2">
            {uploadMsg.type === 'error' ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{uploadMsg.text}</span>
          </div>
          <button onClick={() => setUploadMsg(null)} className="text-[#98AAC2] hover:text-[#EAF2FF]">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Scientific Distinction Note */}
      <div className="pro-card p-4 border-l-4 border-l-[#F5B94E]">
        <div className="flex items-start gap-3">
          <Info className="w-4 h-4 text-[#F5B94E] shrink-0 mt-0.5" />
          <div className="text-xs text-[#98AAC2] leading-relaxed">
            <span className="font-mono font-bold text-[#EAF2FF] uppercase mr-1">Ingestion Architecture Notice:</span>
            File ingestion parses binary headers, EXIF spatial coordinates, and tabular records. Uploading an aerial image alone does not imply calibrated radiometric temperatures or detector inference have been generated until the signal extraction pipeline executes.
          </div>
        </div>
      </div>

      {/* Ingestion Dropzone & Summary Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Upload Region */}
        <div className="lg:col-span-8 pro-card p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded p-8 flex flex-col items-center justify-center text-center cursor-pointer transition ${
              isDragging
                ? 'border-[#00B7FF] bg-[#00B7FF]/5'
                : 'border-[#27364C] hover:border-[#00B7FF]/50 bg-[#18263A]/50'
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileUpload(e.target.files)}
              multiple
              accept=".jpg,.jpeg,.png,.tiff,.tif,.csv"
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-[#131F30] border border-[#27364C] flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6 text-[#00B7FF]" />
            </div>
            <div className="text-sm font-semibold text-[#EAF2FF]">
              Click to select or drag and drop drone payload files
            </div>
            <p className="text-xs text-[#98AAC2] mt-1 max-w-md">
              Supports FLIR radiometric TIFF/JPEG, DJI RTK survey photos, orthophotos (PNG), or structured telemetry CSV feeds.
            </p>
            <div className="flex items-center gap-2 mt-4 text-[10px] font-mono text-[#98AAC2] uppercase">
              <span className="px-2 py-0.5 bg-[#131F30] rounded border border-[#27364C]">JPEG / JPG</span>
              <span className="px-2 py-0.5 bg-[#131F30] rounded border border-[#27364C]">PNG</span>
              <span className="px-2 py-0.5 bg-[#131F30] rounded border border-[#27364C]">TIFF / TIF</span>
              <span className="px-2 py-0.5 bg-[#131F30] rounded border border-[#27364C]">TELEMETRY CSV</span>
            </div>
          </div>
        </div>

        {/* Telemetry Summary Cards */}
        <div className="lg:col-span-4 space-y-4">
          <div className="pro-card p-4">
            <div className="text-[10px] font-mono tracking-wider text-[#98AAC2] uppercase">Ingested Files</div>
            <div className="text-2xl font-mono font-bold text-[#EAF2FF] mt-1">{images.length}</div>
            <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Payload items in catalog</div>
          </div>

          <div className="pro-card p-4">
            <div className="text-[10px] font-mono tracking-wider text-[#18D9A4] uppercase">Calibrated WGS-84 Fixes</div>
            <div className="text-2xl font-mono font-bold text-[#18D9A4] mt-1">
              {validGpsCount} / {images.length}
            </div>
            <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">
              {images.length > 0 ? `${Math.round((validGpsCount / images.length) * 100)}% valid georeferenced` : '0%'}
            </div>
          </div>

          <div className="pro-card p-4">
            <div className="text-[10px] font-mono tracking-wider text-[#00B7FF] uppercase">Pipeline Extracted</div>
            <div className="text-2xl font-mono font-bold text-[#00B7FF] mt-1">
              {processedCount}
            </div>
            <div className="text-[11px] text-[#98AAC2] mt-1 font-mono">Ready for DBSCAN cluster engine</div>
          </div>
        </div>
      </div>

      {/* Catalog & EXIF Metadata Table */}
      <div className="pro-card p-5">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#27364C]">
          <div>
            <h2 className="text-xs font-mono font-semibold tracking-wider text-[#EAF2FF] uppercase">
              Survey Flight Media Catalog
            </h2>
            <p className="text-[11px] text-[#98AAC2] mt-0.5">
              Inspect EXIF coordinates, altitude offsets, camera models, and GPS acquisition integrity
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#18263A] text-[#00B7FF] border border-[#27364C]">
            {images.length} Entries
          </span>
        </div>

        <div className="overflow-x-auto">
          {images.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-xs font-mono text-[#98AAC2]">
              <FileImage className="w-8 h-8 text-[#27364C] mb-2" />
              <span>NO DRONE DATA CURRENTLY INGESTED</span>
              <span className="text-[10px] text-slate-500 mt-1">
                Upload survey files above or click "Load 385-Signal Scenario"
              </span>
            </div>
          ) : (
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-[#27364C] text-[10px] font-mono text-[#98AAC2] uppercase tracking-wider">
                  <th className="py-2.5 px-3">File Name</th>
                  <th className="py-2.5 px-3">Sensor Camera</th>
                  <th className="py-2.5 px-3">WGS-84 Coordinates</th>
                  <th className="py-2.5 px-3">Altitude AGL</th>
                  <th className="py-2.5 px-3">Payload Size</th>
                  <th className="py-2.5 px-3">Signal State</th>
                  <th className="py-2.5 px-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27364C]/50 font-mono">
                {images.map((img) => {
                  const hasGps = img.gps_lat != null && img.gps_lon != null;
                  return (
                    <tr key={img.id} className="hover:bg-[#18263A]/80 transition">
                      <td className="py-3 px-3 text-[#EAF2FF] font-medium flex items-center gap-2">
                        <FileImage className="w-3.5 h-3.5 text-[#00B7FF] shrink-0" />
                        <span className="truncate max-w-[200px]">{img.filename}</span>
                      </td>
                      <td className="py-3 px-3 text-[#98AAC2]">
                        {img.camera_model || 'FLIR Radiometric'}
                      </td>
                      <td className="py-3 px-3">
                        {hasGps ? (
                          <span className="text-[#18D9A4]">
                            {formatCoords(img.gps_lat, img.gps_lon)}
                          </span>
                        ) : (
                          <span className="text-[#FF5A70] flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            GPS Missing
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-[#98AAC2]">
                        {img.altitude != null ? `${img.altitude.toFixed(0)}m` : '—'}
                      </td>
                      <td className="py-3 px-3 text-[#98AAC2]">
                        {formatBytes(img.file_size || 1024 * 128)}
                      </td>
                      <td className="py-3 px-3">
                        {img.processed ? (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#18D9A4] font-bold">
                            <Check className="w-3 h-3" />
                            EXTRACTED
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] text-[#F5B94E] font-bold">
                            <Clock className="w-3 h-3" />
                            PENDING
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        {!hasGps && (
                          <button
                            onClick={() => {
                              setManualGpsModal(img);
                              setManualCoords({
                                lat: '38.3550',
                                lon: '37.8550',
                                altitude: '105'
                              });
                            }}
                            className="text-[11px] text-[#00B7FF] hover:underline"
                          >
                            Set GPS
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Manual GPS Modal */}
      {manualGpsModal && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="pro-card bg-[#131F30] max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#27364C]">
              <h3 className="text-sm font-bold text-[#EAF2FF]">Manual GPS Coordinate Calibration</h3>
              <button onClick={() => setManualGpsModal(null)} className="text-[#98AAC2] hover:text-[#EAF2FF]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-[#98AAC2]">
              Assign reference coordinates to <strong>{manualGpsModal.filename}</strong>:
            </p>
            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[#98AAC2] block mb-1">Latitude (°N)</label>
                <input
                  type="text"
                  value={manualCoords.lat}
                  onChange={(e) => setManualCoords({ ...manualCoords, lat: e.target.value })}
                  className="w-full bg-[#18263A] border border-[#27364C] rounded p-2 text-[#EAF2FF]"
                />
              </div>
              <div>
                <label className="text-[#98AAC2] block mb-1">Longitude (°E)</label>
                <input
                  type="text"
                  value={manualCoords.lon}
                  onChange={(e) => setManualCoords({ ...manualCoords, lon: e.target.value })}
                  className="w-full bg-[#18263A] border border-[#27364C] rounded p-2 text-[#EAF2FF]"
                />
              </div>
              <div>
                <label className="text-[#98AAC2] block mb-1">Altitude (m AGL)</label>
                <input
                  type="text"
                  value={manualCoords.altitude}
                  onChange={(e) => setManualCoords({ ...manualCoords, altitude: e.target.value })}
                  className="w-full bg-[#18263A] border border-[#27364C] rounded p-2 text-[#EAF2FF]"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setManualGpsModal(null)}
                className="px-3 py-1.5 text-xs text-[#98AAC2] hover:text-[#EAF2FF]"
              >
                Cancel
              </button>
              <button
                onClick={handleManualGpsSubmit}
                className="px-4 py-1.5 bg-[#00B7FF] hover:bg-[#00a3e3] text-[#0A101B] text-xs font-bold font-mono rounded"
              >
                Save Fix
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
