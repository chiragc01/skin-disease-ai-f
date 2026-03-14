import { useState, useRef, useEffect } from "react";

// ─────────────────────────────────────────────
// DATA
// ─────────────────────────────────────────────
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
  green: { soft: "rgba(34,197,94,0.12)",  border: "rgba(34,197,94,0.3)",  text: "#16a34a", bar: "linear-gradient(90deg,#4ade80,#22c55e)" },
  amber: { soft: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#d97706", bar: "linear-gradient(90deg,#fcd34d,#f59e0b)" },
  red:   { soft: "rgba(239,68,68,0.12)",  border: "rgba(239,68,68,0.3)",  text: "#dc2626", bar: "linear-gradient(90deg,#f87171,#ef4444)" },
};

// ─────────────────────────────────────────────
// CSS
// ─────────────────────────────────────────────
const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #060918; }

  .skin-root { min-height: 100vh; background: #060918; font-family: 'Outfit', sans-serif; color: #e2e8f0; overflow-x: hidden; }

  .orb { position: fixed; border-radius: 50%; filter: blur(80px); pointer-events: none; z-index: 0; }
  .orb-1 { width: 500px; height: 500px; background: radial-gradient(circle, rgba(99,102,241,0.22), transparent); top: -150px; left: -100px; animation: floatOrb 10s ease-in-out infinite; }
  .orb-2 { width: 350px; height: 350px; background: radial-gradient(circle, rgba(236,72,153,0.18), transparent); top: 35%; right: -80px; animation: floatOrb 13s ease-in-out infinite reverse; }
  .orb-3 { width: 400px; height: 400px; background: radial-gradient(circle, rgba(6,182,212,0.14), transparent); bottom: 0; left: 15%; animation: floatOrb 11s ease-in-out infinite 4s; }
  @keyframes floatOrb { 0%,100% { transform: translateY(0) scale(1); } 50% { transform: translateY(-30px) scale(1.08); } }

  /* ── LOADER ── */
  .loader-wrap { position: fixed; inset: 0; z-index: 100; background: #060918; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 28px; transition: opacity 0.8s ease, visibility 0.8s ease; }
  .loader-wrap.hide { opacity: 0; visibility: hidden; }
  .loader-icon { width: 80px; height: 80px; border-radius: 24px; background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3)); border: 1px solid rgba(99,102,241,0.4); display: flex; align-items: center; justify-content: center; font-size: 2.2rem; box-shadow: 0 0 40px rgba(99,102,241,0.3); animation: iconPulse 2s ease-in-out infinite; margin-bottom: 4px; }
  @keyframes iconPulse { 0%,100% { box-shadow: 0 0 40px rgba(99,102,241,0.3); } 50% { box-shadow: 0 0 70px rgba(99,102,241,0.6); } }
  .loader-title { font-size: 1.5rem; font-weight: 900; color: #f8fafc; letter-spacing: -0.3px; }
  .loader-sub { font-size: 0.75rem; color: #475569; font-weight: 500; text-align: center; margin-top: 2px; }
  .loader-bar-wrap { width: 220px; }
  .loader-bar-track { width: 100%; height: 3px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
  .loader-bar-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899); border-radius: 99px; width: 0%; transition: width 0.5s ease; }
  .loader-pct { font-family: 'JetBrains Mono', monospace; font-size: 0.7rem; color: #475569; text-align: right; margin-top: 6px; }
  .loader-dots { display: flex; gap: 6px; }
  .loader-dot { width: 6px; height: 6px; border-radius: 50%; background: rgba(99,102,241,0.4); animation: dotBounce 1.2s ease-in-out infinite; }
  .loader-dot:nth-child(2) { animation-delay: 0.2s; }
  .loader-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotBounce { 0%,100% { transform: translateY(0); background: rgba(99,102,241,0.4); } 50% { transform: translateY(-8px); background: #6366f1; } }

  /* ── LANDING ── */
  .landing { position: relative; z-index: 1; min-height: 100vh; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 2rem 1.25rem; text-align: center; transition: opacity 0.6s ease, transform 0.6s ease; }
  .landing.exit { opacity: 0; transform: translateY(-30px); pointer-events: none; }
  .landing-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.12); border: 1px solid rgba(99,102,241,0.25); border-radius: 99px; padding: 6px 16px; font-size: 0.68rem; font-weight: 700; color: #a5b4fc; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 2rem; animation: fadeInUp 0.8s ease 0.2s both; }
  .live-dot { width: 7px; height: 7px; background: #6366f1; border-radius: 50%; animation: livePulse 2s ease infinite; flex-shrink: 0; }
  @keyframes livePulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.6); } }
  .landing-title { font-size: clamp(2.4rem, 8vw, 4.5rem); font-weight: 900; line-height: 1.05; letter-spacing: -1.5px; margin-bottom: 1.5rem; animation: fadeInUp 0.8s ease 0.4s both; }
  .grad-text { background: linear-gradient(135deg, #f8fafc 0%, #c7d2fe 40%, #f472b6 70%, #c084fc 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .landing-desc { max-width: 480px; font-size: clamp(0.9rem, 2.5vw, 1.05rem); color: #64748b; line-height: 1.7; font-weight: 500; margin-bottom: 2.5rem; animation: fadeInUp 0.8s ease 0.6s both; }
  .feature-pills { display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; margin-bottom: 2.5rem; animation: fadeInUp 0.8s ease 0.7s both; }
  .pill { display: flex; align-items: center; gap: 6px; padding: 7px 14px; border-radius: 99px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); font-size: 0.75rem; font-weight: 600; color: #64748b; }
  .landing-cta { display: flex; flex-direction: column; align-items: center; gap: 14px; animation: fadeInUp 0.8s ease 0.8s both; }
  .btn-predict { display: flex; align-items: center; gap: 12px; padding: 18px 44px; background: linear-gradient(135deg, #6366f1, #8b5cf6, #a855f7); color: white; border: none; border-radius: 18px; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 1.1rem; cursor: pointer; transition: all 0.3s; touch-action: manipulation; box-shadow: 0 8px 32px rgba(99,102,241,0.45), inset 0 1px 0 rgba(255,255,255,0.15); }
  .btn-predict:hover { transform: translateY(-3px); box-shadow: 0 16px 48px rgba(99,102,241,0.55); }
  .btn-predict:active { transform: translateY(-1px); }
  .btn-arrow { font-size: 1.1rem; transition: transform 0.3s; display: inline-block; }
  .btn-predict:hover .btn-arrow { transform: translateX(5px); }
  .landing-note { font-size: 0.72rem; color: #334155; font-weight: 500; }
  .stats-row { display: flex; gap: 2.5rem; justify-content: center; flex-wrap: wrap; margin-top: 4rem; animation: fadeInUp 0.8s ease 1s both; }
  .stat-num { font-size: 1.6rem; font-weight: 900; font-family: 'JetBrains Mono', monospace; background: linear-gradient(135deg, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .stat-label { font-size: 0.68rem; color: #334155; font-weight: 600; text-transform: uppercase; letter-spacing: 0.08em; margin-top: 2px; }
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

  /* ── APP ── */
  .app-page { position: relative; z-index: 1; animation: fadeInUp 0.5s ease; }
  .app-topbar { display: flex; align-items: center; justify-content: space-between; padding: 1.25rem 1.5rem; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(6,9,24,0.85); backdrop-filter: blur(20px); position: sticky; top: 0; z-index: 10; }
  .topbar-brand { display: flex; align-items: center; gap: 10px; }
  .topbar-icon { width: 36px; height: 36px; border-radius: 10px; background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3)); border: 1px solid rgba(99,102,241,0.3); display: flex; align-items: center; justify-content: center; font-size: 1rem; }
  .topbar-name { font-weight: 800; font-size: 0.95rem; color: #f1f5f9; }
  .topbar-back { display: flex; align-items: center; gap: 6px; padding: 8px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; color: #64748b; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: all 0.2s; touch-action: manipulation; }
  .topbar-back:hover { background: rgba(255,255,255,0.09); color: #94a3b8; }
  .container { max-width: 600px; margin: 0 auto; padding: 2rem 1rem 5rem; }
  .card { background: rgba(15,23,42,0.7); backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; padding: 1.5rem; margin-bottom: 1.25rem; box-shadow: 0 25px 50px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.05); animation: fadeInUp 0.4s ease; }
  .card-title { font-size: 1rem; font-weight: 800; color: #f1f5f9; margin-bottom: 1.25rem; }
  .tabs { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 1.5rem; }
  .tab-btn { padding: 13px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.06); background: rgba(255,255,255,0.04); color: #94a3b8; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.88rem; cursor: pointer; transition: all 0.25s; touch-action: manipulation; }
  .tab-btn:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
  .tab-btn.active { background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.2)); border-color: rgba(99,102,241,0.5); color: #c7d2fe; box-shadow: 0 0 20px rgba(99,102,241,0.2), inset 0 1px 0 rgba(255,255,255,0.1); }
  .upload-zone { border: 2px dashed rgba(99,102,241,0.3); border-radius: 20px; padding: 3rem 1.5rem; text-align: center; cursor: pointer; transition: all 0.3s; background: rgba(99,102,241,0.04); touch-action: manipulation; }
  .upload-zone:hover, .upload-zone.drag { border-color: rgba(99,102,241,0.7); background: rgba(99,102,241,0.08); transform: scale(1.01); }
  .upload-icon-wrap { width: 64px; height: 64px; border-radius: 20px; background: linear-gradient(135deg, rgba(99,102,241,0.2), rgba(168,85,247,0.2)); border: 1px solid rgba(99,102,241,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 1.8rem; }
  .upload-title { font-weight: 800; color: #e2e8f0; font-size: 0.95rem; margin-bottom: 4px; }
  .upload-sub { font-size: 0.72rem; color: #475569; }
  .img-wrap { position: relative; border-radius: 18px; overflow: hidden; margin-bottom: 16px; }
  .img-wrap img { width: 100%; max-height: 280px; object-fit: cover; display: block; }
  .img-overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, transparent 60%, rgba(0,0,0,0.5)); }
  .close-btn { position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.1); border-radius: 50%; width: 36px; height: 36px; color: white; font-size: 0.9rem; cursor: pointer; display: flex; align-items: center; justify-content: center; touch-action: manipulation; }
  .btn-primary { width: 100%; padding: 15px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 16px; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.95rem; cursor: pointer; transition: all 0.25s; touch-action: manipulation; box-shadow: 0 4px 20px rgba(99,102,241,0.4), inset 0 1px 0 rgba(255,255,255,0.15); }
  .btn-primary:hover { transform: translateY(-2px); box-shadow: 0 8px 30px rgba(99,102,241,0.5); }
  .btn-primary:disabled { background: rgba(99,102,241,0.3); cursor: not-allowed; transform: none; box-shadow: none; }
  .btn-secondary { padding: 15px; background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: #94a3b8; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; touch-action: manipulation; width: 100%; }
  .btn-secondary:hover { background: rgba(255,255,255,0.1); color: #e2e8f0; }
  .btn-ghost { width: 100%; padding: 15px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.1); border-radius: 16px; color: #94a3b8; font-family: 'Outfit', sans-serif; font-weight: 700; font-size: 0.9rem; cursor: pointer; transition: all 0.2s; touch-action: manipulation; }
  .btn-ghost:hover { background: rgba(255,255,255,0.08); color: #e2e8f0; }
  .btn-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .cam-center { text-align: center; padding: 1.5rem 0; }
  .cam-icon-wrap { width: 72px; height: 72px; border-radius: 22px; background: linear-gradient(135deg, rgba(6,182,212,0.15), rgba(99,102,241,0.15)); border: 1px solid rgba(6,182,212,0.3); display: flex; align-items: center; justify-content: center; margin: 0 auto 14px; font-size: 2rem; }
  .cam-title { font-weight: 800; color: #e2e8f0; margin-bottom: 4px; font-size: 0.95rem; }
  .cam-sub { font-size: 0.72rem; color: #475569; margin-bottom: 20px; }
  .btn-cam-open { padding: 13px 36px; background: linear-gradient(135deg, rgba(6,182,212,0.2), rgba(99,102,241,0.2)); border: 1px solid rgba(6,182,212,0.4); border-radius: 16px; color: #67e8f9; font-family: 'Outfit', sans-serif; font-weight: 800; font-size: 0.9rem; cursor: pointer; transition: all 0.25s; touch-action: manipulation; }
  .btn-cam-open:hover { background: linear-gradient(135deg, rgba(6,182,212,0.3), rgba(99,102,241,0.3)); transform: translateY(-1px); }
  .video-wrap { border-radius: 18px; overflow: hidden; background: #000; margin-bottom: 16px; border: 1px solid rgba(255,255,255,0.06); }
  .video-wrap video { width: 100%; max-height: 300px; object-fit: cover; display: block; }
  .error-box { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 16px; padding: 1rem 1.25rem; margin-bottom: 1.25rem; display: flex; gap: 10px; animation: fadeInUp 0.3s ease; }
  .error-text { color: #fca5a5; font-size: 0.85rem; font-weight: 600; }
  .result-header { border-radius: 20px; padding: 1.25rem; margin-bottom: 1.25rem; position: relative; overflow: hidden; }
  .result-header::before { content: ''; position: absolute; inset: 0; opacity: 0.06; background: repeating-linear-gradient(45deg, currentColor 0, currentColor 1px, transparent 0, transparent 50%); background-size: 8px 8px; }
  .result-icon { font-size: 2rem; margin-bottom: 6px; }
  .result-name { font-size: 1.4rem; font-weight: 900; margin-bottom: 2px; letter-spacing: -0.3px; }
  .result-danger { font-size: 0.72rem; font-weight: 700; opacity: 0.8; text-transform: uppercase; letter-spacing: 0.08em; }
  .conf-labels { display: flex; justify-content: space-between; font-size: 0.7rem; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 8px; }
  .conf-val { font-family: 'JetBrains Mono', monospace; color: #94a3b8; }
  .conf-track { width: 100%; height: 8px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; border: 1px solid rgba(255,255,255,0.04); margin-bottom: 1.25rem; }
  .conf-bar { height: 100%; border-radius: 99px; transition: width 1.2s cubic-bezier(0.4,0,0.2,1); }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
  @media (max-width: 480px) { .info-grid { grid-template-columns: 1fr; } }
  .info-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.06); border-radius: 14px; padding: 1rem; }
  .info-label { font-size: 0.62rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .info-text { font-size: 0.82rem; color: #94a3b8; line-height: 1.5; font-weight: 500; }
  .action-box { border-radius: 14px; padding: 1rem; margin-top: 10px; }
  .action-label { font-size: 0.62rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 6px; }
  .action-text { font-size: 0.88rem; font-weight: 600; line-height: 1.5; }
  .probs-toggle { width: 100%; display: flex; justify-content: space-between; align-items: center; background: none; border: none; cursor: pointer; padding: 0; touch-action: manipulation; }
  .probs-label { font-size: 0.65rem; font-weight: 700; color: #334155; text-transform: uppercase; letter-spacing: 0.08em; }
  .prob-row { margin-bottom: 12px; }
  .prob-meta { display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: #475569; margin-bottom: 5px; }
  .prob-track { width: 100%; height: 5px; background: rgba(255,255,255,0.06); border-radius: 99px; overflow: hidden; }
  .prob-fill { height: 100%; background: linear-gradient(90deg, #6366f1, #8b5cf6); border-radius: 99px; transition: width 0.8s ease; }
  .disclaimer { background: rgba(99,102,241,0.06); border: 1px solid rgba(99,102,241,0.15); border-radius: 16px; padding: 1rem 1.25rem; display: flex; gap: 12px; align-items: flex-start; margin-bottom: 1.25rem; }
  .disclaimer p { font-size: 0.73rem; color: #475569; line-height: 1.6; font-weight: 500; }
  .loading-text { display: flex; align-items: center; justify-content: center; gap: 8px; }
  .spinner { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.2); border-top-color: white; border-radius: 50%; animation: spin 0.7s linear infinite; }
  @keyframes spin { to { transform: rotate(360deg); } }
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(99,102,241,0.3); border-radius: 99px; }
`;

// ─────────────────────────────────────────────
// LOADER
// ─────────────────────────────────────────────
function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [hide, setHide] = useState(false);
  const barRef = useRef(null);

  useEffect(() => {
    const steps = [
      { val: 30,  delay: 200 },
      { val: 60,  delay: 700 },
      { val: 85,  delay: 1200 },
      { val: 100, delay: 1700 },
    ];
    steps.forEach(({ val, delay }) => {
      setTimeout(() => {
        setPct(val);
        if (barRef.current) barRef.current.style.width = val + "%";
      }, delay);
    });
    setTimeout(() => { setHide(true); setTimeout(onDone, 800); }, 2400);
  }, []);

  return (
    <div className={"loader-wrap" + (hide ? " hide" : "")}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div className="loader-icon">🔬</div>
        <p className="loader-title">SkinAI</p>
        <p className="loader-sub">Initializing AI </p>
      </div>
      <div className="loader-bar-wrap">
        <div className="loader-bar-track">
          <div ref={barRef} className="loader-bar-fill" />
        </div>
        <p className="loader-pct">{pct}%</p>
      </div>
      <div className="loader-dots">
        <div className="loader-dot" />
        <div className="loader-dot" />
        <div className="loader-dot" />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// LANDING PAGE
// ─────────────────────────────────────────────
// function LandingPage({ onEnter }) {
//   const [exiting, setExiting] = useState(false);

//   const handleEnter = () => {
//     setExiting(true);
//     setTimeout(onEnter, 600);
//   };

//   return (
//     <div className={"landing" + (exiting ? " exit" : "")}>
//       <div className="landing-badge">
//         <div className="live-dot" />
//         AI Skin Analysis · 7 Disease Classes
//       </div>

//       <h1 className="landing-title">
//         <span className="grad-text">Predict Skin</span>
//         <br />
//         <span className="grad-text">Disease Instantly</span>
//       </h1>

//       <p className="landing-desc">
//         Upload a photo or use your camera. Our AI model trained on 10,000+ medical
//         images gives you an instant skin disease prediction with clear, actionable advice.
//       </p>

//       <div className="feature-pills">
//         {["🔬 AI Powered", "📷 Live Camera", "⚡ Instant Results", "🩺 7 Disease Classes"].map(f => (
//           <div key={f} className="pill">{f}</div>
//         ))}
//       </div>

//       <div className="landing-cta">
//         <button className="btn-predict" onClick={handleEnter}>
//           🔬 Predict Disease
//           <span className="btn-arrow">→</span>
//         </button>
//         <p className="landing-note">No sign up required · Free to use</p>
//       </div>

//       <div className="stats-row">
//         {[["10K+", "Training Images"], ["7", "Disease Classes"], ["AI", "Powered Model"]].map(([num, label]) => (
//           <div key={label} style={{ textAlign: "center" }}>
//             <div className="stat-num">{num}</div>
//             <div className="stat-label">{label}</div>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }

// ─────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────
function MainApp({ onBack }) {
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
      setError("Could not connect to AI server. Make sure FastAPI is running on port 8000.");
    } finally {
      setLoading(false);
    }
  };

  const exp = result ? EXPLANATIONS[result.predicted_class] : null;
  const theme = exp ? THEME[exp.color] : null;
  const confText = result
    ? result.confidence >= 80 ? "Very confident"
    : result.confidence >= 60 ? "Fairly confident"
    : result.confidence >= 40 ? "Moderate"
    : "Low confidence"
    : "";

  return (
    <div className="app-page">
      {/* Top bar */}
      <div className="app-topbar">
        <div className="topbar-brand">
          <div className="topbar-icon">🔬</div>
          <span className="topbar-name">SkinAI</span>
        </div>
        <button className="topbar-back" onClick={() => { reset(); closeCamera(); onBack(); }}>
          ← Back
        </button>
      </div>

      <div className="container">

        {/* Tabs */}
        <div className="tabs">
          {[{ id: "upload", label: "📁  Upload Image" }, { id: "camera", label: "📷  Live Camera" }].map(t => (
            <button
              key={t.id}
              className={"tab-btn" + (tab === t.id ? " active" : "")}
              onClick={() => { setTab(t.id); reset(); closeCamera(); }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Upload Tab */}
        {tab === "upload" && (
          <div className="card">
            <p className="card-title">Upload Skin Image</p>
            {!preview ? (
              <div
                className={"upload-zone" + (dragOver ? " drag" : "")}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current.click()}
              >
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

        {/* Camera Tab */}
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
                <div className="video-wrap">
                  <video ref={videoRef} autoPlay playsInline muted />
                </div>
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

        {/* Error */}
        {error && (
          <div className="error-box">
            <span>⚠️</span>
            <p className="error-text">{error}</p>
          </div>
        )}

        {/* Results */}
        {result && exp && theme && (
          <>
            <div className="card">
              <p style={{ fontSize: "0.62rem", fontWeight: 700, color: "#334155", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 12 }}>
                Diagnosis Result
              </p>

              <div className="result-header" style={{ background: theme.soft, border: `1px solid ${theme.border}`, color: theme.text }}>
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
                <span style={{ color: "#334155", fontSize: "0.75rem", display: "inline-block", transform: showAllProbs ? "rotate(180deg)" : "none", transition: "0.2s" }}>▼</span>
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

// ─────────────────────────────────────────────
// ROOT
// ─────────────────────────────────────────────
export default function SkinDiseaseApp() {
  const [screen, setScreen] = useState("loader");

  return (
    <>
      <style>{css}</style>
      <div className="skin-root">
        <div className="orb orb-1" />
        {/* <div className="orb orb-2" /> */}
        <div className="orb orb-3" />
         {screen === "loader"  && <Loader onDone={() => setScreen("app")} />}
          {/* {screen === "landing" && <LandingPage onEnter={() => setScreen("app")} />} */}
        {screen === "app"     && <MainApp onBack={() => setScreen("landing")} />}
      </div>
    </>
  );
}
