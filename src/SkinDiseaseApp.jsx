import { useState, useRef, useEffect } from "react";

const CLASS_NAMES = {
  0: "Actinic Keratoses", 1: "Basal Cell Carcinoma",
  2: "Benign Keratosis",  3: "Dermatofibroma",
  4: "Melanoma",          5: "Melanocytic Nevi",
  6: "Vascular Lesions",
};

const EXPLANATIONS = {
  0: { color: "amber", icon: "⚡", danger: "Needs Attention",  what: "Rough, scaly patches caused by years of sun exposure.", action: "Visit a skin doctor soon. Can turn into skin cancer if untreated.", common: "Common in people over 40 with heavy sun exposure." },
  1: { color: "red",   icon: "🔴", danger: "Serious",          what: "A slow-growing skin cancer on the outer layer of skin.", action: "See a doctor as soon as possible. Rarely spreads if treated early.", common: "Most common in fair-skinned people with high sun exposure." },
  2: { color: "green", icon: "✅", danger: "Not Dangerous",    what: "Harmless skin growths that look like warts or moles — NOT cancer.", action: "No urgent action needed. See a doctor if it bleeds or changes shape.", common: "Very common in older adults. Usually brown or black." },
  3: { color: "green", icon: "✅", danger: "Not Dangerous",    what: "A small, firm bump under the skin. Almost always harmless.", action: "No treatment needed. See a doctor only if it hurts or grows.", common: "Often found on legs. More common in women." },
  4: { color: "red",   icon: "🚨", danger: "Very Serious",     what: "The most dangerous skin cancer — can spread to other parts of the body.", action: "See a doctor IMMEDIATELY. Early detection is critical.", common: "Looks like an unusual mole with uneven edges or mixed colors." },
  5: { color: "green", icon: "✅", danger: "Usually Safe",     what: "Common moles. Almost everyone has them — usually completely harmless.", action: "No action needed. See a doctor if the mole changes size or color.", common: "Most common skin condition. Normal to have 10-40 moles." },
  6: { color: "amber", icon: "⚡", danger: "Usually Harmless", what: "Small marks caused by blood vessels near the surface of the skin.", action: "No treatment needed. See a doctor if it bleeds or grows rapidly.", common: "Common in all ages. Often looks like a small red or purple dot." },
};

const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

const THEME = {
  green: { soft: "#f0fdf4", border: "#86efac", text: "#16a34a", bar: "linear-gradient(90deg,#4ade80,#16a34a)" },
  amber: { soft: "#fffbeb", border: "#fcd34d", text: "#d97706", bar: "linear-gradient(90deg,#fcd34d,#f59e0b)" },
  red:   { soft: "#fef2f2", border: "#fca5a5", text: "#dc2626", bar: "linear-gradient(90deg,#f87171,#dc2626)" },
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #f0fdf4; }

  .skin-root { min-height: 100vh; background: #f0fdf4; font-family: 'Outfit', sans-serif; color: #1e293b; overflow-x: hidden; }

  .app-page { position: relative; z-index: 1; animation: fadeInUp 0.5s ease; min-height: 100vh; background: #f0fdf4; }
  .app-topbar { display: flex; align-items: center; justify-content: space-between; padding: 1rem 1.5rem; border-bottom: 1px solid #d1fae5; background: white; position: sticky; top: 0; z-index: 10; box-shadow: 0 1px 4px rgba(0,0,0,0.06); }
  .topbar-brand { display: flex; align-items: center; gap: 10px; }
  .topbar-logo { width: 44px; height: 44px; border-radius: 8px; object-fit: contain; background: #f0fdf4; padding: 2px; }
  .topbar-name { font-weight: 800; font-size: 0.95rem; color: #14532d; }
  .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem 5rem; }

  .card { background: white; border: 1px solid #e2e8f0; border-radius: 20px; padding: 1.5rem; margin-bottom: 1.25rem; box-shadow: 0 2px 12px rgba(0,0,0,0.06); animation: fadeInUp 0.4s ease; }
  .card-title { font-size: 1rem; font-weight: 800; color: #14532d; margin-bottom: 1.25rem; }

  .tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.5rem; }
  .tab-btn { padding: 13px; border-radius: 14px; border: 1px solid #e2e8f0; background: white; color: #64748b; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.25s; }
  .tab-btn:hover { background: #f0fdf4; border-color: #86efac; color: #16a34a; }
  .tab-btn.active { background: #f0fdf4; border-color: #22c55e; color: #16a34a; box-shadow: 0 0 0 3px rgba(34,197,94,0.1); }

  .upload-zone { border: 2px dashed #86efac; border-radius: 18px; padding: 3rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.3s; background: #f0fdf4; }
  .upload-zone:hover, .upload-zone.drag { border-color: #22c55e; background: #dcfce7; transform: scale(1.01); }
  .upload-icon-wrap { width: 64px; height: 64px; border-radius: 18px; background: linear-gradient(135deg, #bbf7d0, #86efac); border: 1px solid #4ade80; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 1.8rem; }
  .upload-title { font-weight: 800; color: #14532d; font-size: 0.95rem; margin-bottom: 4px; }
  .upload-sub { font-size: 0.72rem; color: #6b7280; }

  .img-wrap { position: relative; border-radius: 16px; overflow: hidden; margin-bottom: 16px; }
  .img-wrap img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
  .img-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.3)); }
  .close-btn { position: absolute; top: 10px; right: 10px; background: white; border: 1px solid #e2e8f0; border-radius: 50%; width: 34px; height: 34px; color: #64748b; font-size: 0.85rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 6px rgba(0,0,0,0.1); }

  .btn-primary { width: 100%; padding: 14px; background: #22c55e; color: white; border: none; border-radius: 14px; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.25s; box-shadow: 0 4px 14px rgba(34,197,94,0.35); }
  .btn-primary:hover { background: #16a34a; transform: translateY(-1px); box-shadow: 0 6px 20px rgba(34,197,94,0.4); }
  .btn-primary:disabled { background: #86efac; cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-secondary { padding: 14px; background: white; border: 1px solid #e2e8f0; border-radius: 14px; color: #64748b; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; width: 100%; }
  .btn-secondary:hover { background: #f8fafc; border-color: #cbd5e1; }
  .btn-ghost { width: 100%; padding: 14px; background: white; border: 1px solid #e2e8f0; border-radius: 14px; color: #64748b; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; }
  .btn-ghost:hover { background: #f0fdf4; border-color: #86efac; color: #16a34a; }
  .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  .cam-center { text-align: center; padding: 1.5rem 0; }
  .cam-icon-wrap { width: 72px; height: 72px; border-radius: 20px; background: linear-gradient(135deg, #bbf7d0, #86efac); border: 1px solid #4ade80; display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 2rem; }
  .cam-title { font-weight: 800; color: #14532d; margin-bottom: 4px; font-size: 0.95rem; }
  .cam-sub { font-size: 0.72rem; color: #6b7280; margin-bottom: 20px; }
  .btn-cam-open { padding: 13px 36px; background: #22c55e; border: none; border-radius: 14px; color: white; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.25s; box-shadow: 0 4px 14px rgba(34,197,94,0.35); }
  .btn-cam-open:hover { background: #16a34a; transform: translateY(-1px); }

  .video-wrap { border-radius: 16px; overflow: hidden; background: #000; margin-bottom: 16px; border: 1px solid #e2e8f0; }
  .video-wrap video { width: 100%; max-height: 300px; object-fit: cover; display: block; }

  .error-box { background: #fef2f2; border: 1px solid #fca5a5; border-radius: 14px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; gap: 10px; animation: fadeInUp 0.3s ease; }
  .error-text { color: #dc2626; font-size: 0.85rem; font-weight: 600; }

  .result-header { border-radius: 16px; padding: 1.25rem; margin-bottom: 1.25rem; }
  .result-icon { font-size: 2rem; margin-bottom: 6px; }
  .result-name { font-size: 1.4rem; font-weight: 900; margin-bottom: 2px; }
  .result-danger { font-size: 0.72rem; font-weight: 700; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.08em; }

  .conf-labels { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #6b7280; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .conf-val { font-family: 'JetBrains Mono', monospace; color: #374151; }
  .conf-track { width: 100%; height: 8px; background: #f1f5f9; border-radius: 99px; overflow: hidden; margin-bottom: 1.25rem; border: 1px solid #e2e8f0; }
  .conf-bar { height: 100%; border-radius: 99px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }

  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  @media (max-width: 480px) { .info-grid { grid-template-columns: 1fr; } }
  .info-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 1rem; }
  .info-label { font-size: 0.62rem; font-weight: 700; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .info-text { font-size: 0.82rem; color: #374151; line-height: 1.5; font-weight: 500; }
  .action-box { border-radius: 12px; padding: 1rem; margin-top: 10px; }
  .action-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .action-text { font-size: 0.88rem; font-weight: 600; line-height: 1.5; }

  .probs-toggle { width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; cursor: pointer; padding: 0; }
  .probs-label { font-size: 0.75rem; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.08em; }
  .prob-row { margin-bottom: 12px; }
  .prob-meta { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: #6b7280; margin-bottom: 5px; }
  .prob-track { width: 100%; height: 5px; background: #f1f5f9; border-radius: 99px; overflow: hidden; }
  .prob-fill { height: 100%; background: linear-gradient(90deg, #22c55e, #16a34a); border-radius: 99px; transition: width 0.8s ease; }

  .disclaimer { background: #f0fdf4; border: 1px solid #86efac; border-radius: 14px; padding: 1rem 1.25rem; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 1.25rem; }
  .disclaimer p { font-size: 0.73rem; color: #6b7280; line-height: 1.6; font-weight: 500; }

  .loading-text { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.4); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #86efac; border-radius: 99px; }
`;

function MainApp() {
  const [tab, setTab] = useState("upload");
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [showAllProbs, setShowAllProbs] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);

  const reset = () => {
    setPreview(null); setFile(null); setResult(null);
    setError(null); setShowAllProbs(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFile = (f) => {
    if (!f) return;
    setFile(f); setPreview(URL.createObjectURL(f));
    setResult(null); setError(null);
  };

  const onDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f && f.type.startsWith("image/")) handleFile(f);
  };

  const openCamera = async () => {
    setCameraOpen(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: isMobile ? "environment" : "user" }
      });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setError("Could not access camera. Please allow camera permission.");
      setCameraOpen(false);
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const capturePhoto = () => {
    const video = videoRef.current, canvas = canvasRef.current;
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(blob => {
      const f = new File([blob], "capture.jpg", { type: "image/jpeg" });
      setFile(f); setPreview(canvas.toDataURL("image/jpeg"));
      closeCamera(); setResult(null);
    }, "image/jpeg");
  };

  const predict = async () => {
    if (!file) return;
    setLoading(true); setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch(`${API_URL}/predict`, { method: "POST", body: form });
      if (!res.ok) throw new Error();
      setResult(await res.json());
    } catch {
      setError("Could not connect to AI server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const exp = result ? EXPLANATIONS[result.predicted_class] : null;
  const theme = exp ? THEME[exp.color] : null;
  const confText = result
    ? result.confidence >= 80 ? "Very confident"
    : result.confidence >= 60 ? "Fairly confident"
    : result.confidence >= 40 ? "Moderate" : "Low confidence"
    : "";

  return (
    <div className="app-page">
      <div className="app-topbar">
        <div className="topbar-brand">
          <img src="/favicon.png" alt="Twacha-AI" className="topbar-logo" />
          <span className="topbar-name">Twacha-AI</span>
        </div>
        <span style={{ fontSize: "0.75rem", color: "#6b7280", fontWeight: 600 }}>AI Skin Analysis</span>
      </div>

      <div className="container">
        <div className="tabs">
          {[{ id: "upload", label: "📁  Upload Image" }, { id: "camera", label: "📷  Live Camera" }].map(t => (
            <button key={t.id} className={"tab-btn" + (tab === t.id ? " active" : "")}
              onClick={() => { setTab(t.id); reset(); closeCamera(); }}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "upload" && (
          <div className="card">
            <p className="card-title">Upload Skin Image</p>
            {!preview ? (
              <div className={"upload-zone" + (dragOver ? " drag" : "")}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}>
                <div className="upload-icon-wrap">📤</div>
                <p className="upload-title">{isMobile ? "Tap to upload image" : "Click or drag image here"}</p>
                <p className="upload-sub">JPG, JPEG, PNG supported</p>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFile(e.target.files[0])} />
              </div>
            ) : (
              <div>
                <div className="img-wrap">
                  <img src={preview} alt="Preview" />
                  <div className="img-overlay" />
                  <button className="close-btn" onClick={reset}>✕</button>
                </div>
                <button className="btn-primary" onClick={predict} disabled={loading}>
                  {loading ? <span className="loading-text"><span className="spinner" /> Analyzing with AI...</span> : "🔍  Analyze Image"}
                </button>
              </div>
            )}
          </div>
        )}

        {tab === "camera" && (
          <div className="card">
            <p className="card-title">Live Camera Capture</p>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            {!cameraOpen && !preview && (
              <div className="cam-center">
                <div className="cam-icon-wrap">📷</div>
                <p className="cam-title">Capture a live photo</p>
                <p className="cam-sub">Position the skin area clearly in frame</p>
                <button className="btn-cam-open" onClick={openCamera}>📷  Open Camera</button>
              </div>
            )}
            {cameraOpen && !preview && (
              <div>
                <div className="video-wrap"><video ref={videoRef} autoPlay playsInline muted /></div>
                <div className="btn-grid">
                  <button className="btn-secondary" onClick={closeCamera}>❌  Cancel</button>
                  <button className="btn-primary" onClick={capturePhoto}>📸  Take Photo</button>
                </div>
              </div>
            )}
            {preview && !cameraOpen && (
              <div>
                <div className="img-wrap">
                  <img src={preview} alt="Captured" />
                  <div className="img-overlay" />
                </div>
                <div className="btn-grid">
                  <button className="btn-secondary" onClick={reset}>🔄  Retake</button>
                  <button className="btn-primary" onClick={predict} disabled={loading}>
                    {loading ? <span className="loading-text"><span className="spinner" /> Analyzing...</span> : "🔍  Analyze"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="error-box">
            <span>⚠️</span>
            <p className="error-text">{error}</p>
          </div>
        )}

        {result && exp && theme && (
          <>
            <div className="card">
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                Diagnosis Result
              </p>
              <div className="result-header" style={{ background: theme.soft, border: `1px solid ${theme.border}` }}>
                <div className="result-icon">{exp.icon}</div>
                <p className="result-name" style={{ color: theme.text }}>{result.name}</p>
                <p className="result-danger" style={{ color: theme.text }}>{exp.danger}</p>
              </div>
              <div className="conf-labels">
                <span>Confidence</span>
                <span className="conf-val">{result.confidence.toFixed(1)}% · {confText}</span>
              </div>
              <div className="conf-track">
                <div className="conf-bar" style={{ width: `${result.confidence}%`, background: theme.bar }} />
              </div>
              <div className="info-grid">
                <div className="info-box"><p className="info-label">What is it?</p><p className="info-text">{exp.what}</p></div>
                <div className="info-box"><p className="info-label">Who gets it?</p><p className="info-text">{exp.common}</p></div>
              </div>
              <div className="action-box" style={{ background: theme.soft, border: `1px solid ${theme.border}` }}>
                <p className="action-label" style={{ color: theme.text }}>
                  {exp.color === "green" ? "✅ Recommended Action" : exp.color === "amber" ? "⚡ What To Do" : "🚨 Urgent Action"}
                </p>
                <p className="action-text" style={{ color: theme.text }}>{exp.action}</p>
              </div>
            </div>

            <div className="card">
              <button className="probs-toggle" onClick={() => setShowAllProbs(!showAllProbs)}>
                <span className="probs-label">All Possibilities</span>
                <span style={{ color: "#9ca3af", fontSize: "0.75rem", display: "inline-block", transform: showAllProbs ? "rotate(180deg)" : "none", transition: "0.2s" }}>▼</span>
              </button>
              {showAllProbs && (
                <div style={{ marginTop: "1rem" }}>
                  {[...result.all_probabilities].sort((a, b) => b.probability - a.probability).map((item, i) => (
                    <div key={i} className="prob-row">
                      <div className="prob-meta">
                        <span>{item.name}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{item.probability.toFixed(1)}%</span>
                      </div>
                      <div className="prob-track">
                        <div className="prob-fill" style={{ width: `${item.probability}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="disclaimer">
              <span style={{ fontSize: "1rem", flexShrink: 0 }}>ℹ️</span>
              <p>This tool is for educational purposes only and does not replace professional medical advice. Always consult a qualified dermatologist for proper diagnosis and treatment.</p>
            </div>

            <button className="btn-ghost" onClick={reset}>🔄  Start New Analysis</button>
          </>
        )}
      </div>
    </div>
  );
}

export default function SkinDiseaseApp() {
  return (
    <>
      <style>{css}</style>
      <div className="skin-root">
        <MainApp />
      </div>
    </>
  );
}