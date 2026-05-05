import { useState, useRef, useEffect, useCallback } from "react";
import { FASTAPI_URL } from "../config/api.js";

const API_URL = `${FASTAPI_URL}/upload`;
const MAX_HISTORY = 5;

// ─── Confidence bar + low-confidence warning ──────────────────────────────────
function ResultPanel({ label, confidence }) {
  if (!label) return null;
  const isFemale  = label === "Female";
  const isLow     = confidence < 60;
  const barColor  = isLow ? "bg-amber-500" : isFemale ? "bg-pink-500" : "bg-violet-500";

  return (
    <div className={`mt-5 rounded-xl p-5 text-center border ${
      isLow ? "bg-amber-500/10 border-amber-500/30" : "bg-violet-500/10 border-violet-500/30"
    }`}>
      <p className="text-xs text-slate-500 mb-1 uppercase tracking-wide">Prediction</p>
      <p className="text-4xl font-black text-white mb-1">
        {isFemale ? "👩" : "👨"} {label}
      </p>
      {isLow && (
        <p className="text-xs text-amber-400 bg-amber-500/10 rounded-lg px-3 py-1.5 mt-2 mb-2 inline-block border border-amber-500/20">
          Low confidence — try a clearer, well-lit photo
        </p>
      )}
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 mb-1.5">
          <span>Confidence</span>
          <span className="font-semibold text-slate-300">{confidence}%</span>
        </div>
        <div className="w-full bg-slate-800 rounded-full h-2">
          <div className={`${barColor} h-2 rounded-full transition-all duration-700`} style={{ width: `${confidence}%` }} />
        </div>
      </div>
    </div>
  );
}

// ─── History sidebar item ─────────────────────────────────────────────────────
function HistoryItem({ item, index }) {
  const isFemale = item.label === "Female";
  const isLow    = item.confidence < 60;
  return (
    <div className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-slate-800 transition-colors">
      <img src={item.preview} alt="" className="w-9 h-9 rounded-lg object-cover flex-shrink-0 border border-slate-700" />
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-300 truncate">{isFemale ? "👩" : "👨"} {item.label}</p>
        <p className={`text-xs ${isLow ? "text-amber-500" : "text-slate-600"}`}>{item.confidence}%</p>
      </div>
      <span className="text-xs text-slate-700 flex-shrink-0">#{index + 1}</span>
    </div>
  );
}

// ─── Upload / drag-drop tab ───────────────────────────────────────────────────
function UploadTab({ onResult }) {
  const [file,    setFile]    = useState(null);
  const [preview, setPreview] = useState(null);
  const [result,  setResult]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState(null);
  const inputRef = useRef(null);

  function pickFile(f) {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError(null);
    setPreview(URL.createObjectURL(f));
  }

  function handleDrop(e) {
    e.preventDefault();
    pickFile(e.dataTransfer.files[0]);
  }

  async function handleUpload() {
    if (!file) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res  = await fetch(API_URL, { method: "POST", body: fd });
      if (!res.ok) throw new Error(`Server error: ${res.status}`);
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      onResult({ ...data, preview: URL.createObjectURL(file) });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const label      = result?.label ?? result?.prediction?.label;
  const confidence = result?.confidence ?? result?.prediction?.confidence;

  return (
    <>
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center cursor-pointer hover:border-violet-500/50 hover:bg-violet-500/5 transition-all mb-4"
      >
        {preview ? (
          <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg object-contain" />
        ) : (
          <div>
            <div className="text-4xl mb-3">📷</div>
            <p className="font-medium text-slate-400 text-sm">Click or drag &amp; drop an image here</p>
            <p className="text-xs text-slate-600 mt-1">JPG, PNG, WEBP up to 5MB</p>
          </div>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" onChange={(e) => pickFile(e.target.files[0])} className="hidden" />

      {file && <p className="text-xs text-slate-600 mb-4 text-center truncate">{file.name}</p>}

      <div className="flex gap-2">
        <button onClick={handleUpload} disabled={!file || loading}
          className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold transition-all text-sm">
          {loading ? "Classifying…" : "Classify"}
        </button>
        {(file || result) && (
          <button onClick={handleReset} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 transition-all text-sm">
            Reset
          </button>
        )}
      </div>

      {error && <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>}

      <ResultPanel label={label} confidence={confidence} />
    </>
  );
}

// ─── Camera / webcam tab ──────────────────────────────────────────────────────
function CameraTab({ onResult }) {
  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  const [camActive, setCamActive] = useState(false);
  const [snapshot,  setSnapshot]  = useState(null);
  const [result,    setResult]    = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState(null);
  const [camError,  setCamError]  = useState(null);

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCamActive(false);
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  async function startCamera() {
    setCamError(null);
    setSnapshot(null);
    setResult(null);
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamActive(true);
    } catch (err) {
      setCamError(
        err.name === "NotAllowedError"
          ? "Camera access denied. Please allow camera permission in your browser."
          : `Could not access camera: ${err.message}`
      );
    }
  }

  function captureFrame() {
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    setSnapshot(canvas.toDataURL("image/jpeg", 0.92));
    setResult(null);
    setError(null);
    stopStream();
  }

  function retake() {
    setSnapshot(null);
    setResult(null);
    setError(null);
    startCamera();
  }

  async function classifySnapshot() {
    if (!snapshot) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const blob = await (await fetch(snapshot)).blob();
      const file = new File([blob], "webcam-capture.jpg", { type: "image/jpeg" });
      const fd   = new FormData();
      fd.append("file", file);
      const response = await fetch(API_URL, { method: "POST", body: fd });
      if (!response.ok) throw new Error(`Server error: ${response.status}`);
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      setResult(data);
      onResult({ ...data, preview: snapshot });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const label      = result?.label ?? result?.prediction?.label;
  const confidence = result?.confidence ?? result?.prediction?.confidence;

  return (
    <>
      <canvas ref={canvasRef} className="hidden" />

      {camError && (
        <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">{camError}</div>
      )}

      <div className="relative bg-slate-800 rounded-xl overflow-hidden mb-4" style={{ minHeight: "240px" }}>
        <video ref={videoRef} autoPlay playsInline muted
          className={`w-full rounded-xl ${camActive && !snapshot ? "block" : "hidden"}`} />
        {snapshot && <img src={snapshot} alt="Captured" className="w-full rounded-xl" />}
        {!camActive && !snapshot && (
          <div className="flex flex-col items-center justify-center h-60 text-slate-600">
            <div className="text-4xl mb-2">🎥</div>
            <p className="text-sm">Camera is off</p>
          </div>
        )}
        {camActive && !snapshot && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 text-white text-xs px-2.5 py-1 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            LIVE
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {!camActive && !snapshot && (
          <button onClick={startCamera} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white py-2.5 rounded-xl font-semibold transition-all text-sm">
            Start Camera
          </button>
        )}
        {camActive && !snapshot && (
          <>
            <button onClick={captureFrame} className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl font-semibold transition-all text-sm">
              Capture
            </button>
            <button onClick={stopStream} className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 transition-all text-sm">
              Stop
            </button>
          </>
        )}
        {snapshot && (
          <>
            <button onClick={classifySnapshot} disabled={loading}
              className="flex-1 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white py-2.5 rounded-xl font-semibold transition-all text-sm">
              {loading ? "Classifying…" : "Classify This"}
            </button>
            <button onClick={retake} disabled={loading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-slate-400 transition-all text-sm">
              Retake
            </button>
          </>
        )}
      </div>

      {error && <div className="mt-4 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3 text-sm">{error}</div>}

      <ResultPanel label={label} confidence={confidence} />
    </>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ClassifyPage() {
  const [tab,     setTab]     = useState("upload");
  const [history, setHistory] = useState([]); // [{label, confidence, preview}]

  function handleResult(result) {
    setHistory((prev) => [result, ...prev].slice(0, MAX_HISTORY));
  }

  return (
    <div className="min-h-full bg-slate-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gender Classifier AI</h1>
          <p className="text-slate-500">Upload an image or use your webcam to classify gender.</p>
          {/* Model info strip */}
          <div className="flex flex-wrap justify-center gap-3 mt-4">
            {[
              { label: "Model", value: "MobileNetV2" },
              { label: "Accuracy", value: "90.13%" },
              { label: "Input", value: "160×160 px" },
              { label: "Classes", value: "Male / Female" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-full px-3 py-1">
                <span className="text-xs text-slate-500">{item.label}:</span>
                <span className="text-xs font-semibold text-violet-400">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-5">
          {/* Main card */}
          <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl p-6">
            {/* Tab switcher */}
            <div className="flex gap-1.5 mb-6 bg-slate-800 p-1 rounded-xl">
              <button onClick={() => setTab("upload")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === "upload" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                }`}>
                Upload Image
              </button>
              <button onClick={() => setTab("camera")}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all ${
                  tab === "camera" ? "bg-slate-700 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                }`}>
                Use Webcam
              </button>
            </div>

            {tab === "upload" ? <UploadTab onResult={handleResult} /> : <CameraTab onResult={handleResult} />}
          </div>

          {/* History sidebar */}
          {history.length > 0 && (
            <div className="lg:w-52 bg-slate-900 border border-slate-800 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Recent</h2>
                <button onClick={() => setHistory([])} className="text-xs text-slate-600 hover:text-red-400 transition-colors">Clear</button>
              </div>
              <div className="space-y-1">
                {history.map((item, i) => <HistoryItem key={i} item={item} index={i} />)}
              </div>
            </div>
          )}
        </div>

        <p className="text-center text-xs text-slate-700 mt-5">
          Powered by TensorFlow · FastAPI · React
        </p>
      </div>
    </div>
  );
}
