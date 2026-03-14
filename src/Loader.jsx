import { useState, useEffect, useRef } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
  .loader-wrap {
    position: fixed; inset: 0; z-index: 9999;
    background: #060918;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 28px; font-family: 'Outfit', sans-serif;
    transition: opacity 0.8s ease, visibility 0.8s ease;
  }
  .loader-wrap.hide { opacity: 0; visibility: hidden; }
  .loader-orb-1 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(99,102,241,0.2), transparent); top: -200px; left: -150px; filter: blur(80px); animation: loaderFloat 8s ease-in-out infinite; }
  .loader-orb-2 { position: absolute; width: 350px; height: 350px; border-radius: 50%; background: radial-gradient(circle, rgba(236,72,153,0.15), transparent); bottom: -100px; right: -100px; filter: blur(80px); animation: loaderFloat 10s ease-in-out infinite reverse; }
  @keyframes loaderFloat { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-20px) scale(1.06)} }
  .loader-content { position: relative; z-index: 1; display: flex; flex-direction: column; align-items: center; gap: 28px; }
  .loader-icon-ring { position: relative; width: 90px; height: 90px; display: flex; align-items: center; justify-content: center; }
  .loader-icon-ring::before { content: ''; position: absolute; inset: 0; border-radius: 50%; border: 2px solid transparent; border-top-color: #6366f1; border-right-color: #a855f7; animation: ringSpinFast 1s linear infinite; }
  .loader-icon-ring::after { content: ''; position: absolute; inset: 6px; border-radius: 50%; border: 1px solid transparent; border-top-color: rgba(236,72,153,0.5); animation: ringSpinFast 1.8s linear infinite reverse; }
  @keyframes ringSpinFast { to { transform: rotate(360deg); } }
  .loader-icon-inner { width: 62px; height: 62px; border-radius: 20px; background: linear-gradient(135deg, rgba(99,102,241,0.25), rgba(168,85,247,0.25)); border: 1px solid rgba(99,102,241,0.35); display: flex; align-items: center; justify-content: center; font-size: 1.8rem; box-shadow: 0 0 30px rgba(99,102,241,0.25); animation: iconBreath 3s ease-in-out infinite; }
  @keyframes iconBreath { 0%,100%{box-shadow:0 0 30px rgba(99,102,241,0.25)} 50%{box-shadow:0 0 55px rgba(99,102,241,0.5)} }
  .loader-text { text-align: center; }
  .loader-title { font-size: 1.6rem; font-weight: 900; color: #f8fafc; letter-spacing: -0.4px; margin-bottom: 4px; }
  .loader-title span { background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
  .loader-sub { font-size: 0.72rem; color: #334155; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; }
  .loader-bar-section { width: 240px; }
  .loader-status { font-size: 0.72rem; color: #475569; font-weight: 600; margin-bottom: 10px; min-height: 18px; text-align: center; transition: all 0.3s; }
  .loader-track { width: 100%; height: 3px; background: rgba(255,255,255,0.05); border-radius: 99px; overflow: hidden; }
  .loader-fill { height: 100%; border-radius: 99px; width: 0%; background: linear-gradient(90deg, #6366f1, #a855f7, #ec4899); transition: width 0.5s cubic-bezier(0.4,0,0.2,1); box-shadow: 0 0 10px rgba(99,102,241,0.5); }
  .loader-pct { font-family: 'JetBrains Mono', monospace; font-size: 0.68rem; color: #334155; text-align: right; margin-top: 6px; }
  .loader-dots { display: flex; gap: 6px; }
  .loader-dot { width: 5px; height: 5px; border-radius: 50%; background: rgba(99,102,241,0.35); animation: dotPop 1.3s ease-in-out infinite; }
  .loader-dot:nth-child(2) { animation-delay: 0.2s; }
  .loader-dot:nth-child(3) { animation-delay: 0.4s; }
  @keyframes dotPop { 0%,100%{transform:scale(1);background:rgba(99,102,241,0.35)} 50%{transform:scale(1.6);background:#6366f1} }
`;

const STEPS = [
  { pct: 20,  label: "Loading AI model..." },
  { pct: 45,  label: "Reading dataset metadata..." },
  { pct: 70,  label: "Preparing image pipeline..." },
  { pct: 90,  label: "Warming up classifier..." },
  { pct: 100, label: "Ready!" },
];

export default function Loader({ onDone }) {
  const [pct, setPct] = useState(0);
  const [statusIdx, setStatusIdx] = useState(0);
  const [hide, setHide] = useState(false);
  const fillRef = useRef(null);

  useEffect(() => {
    const delays = [200, 700, 1200, 1700, 2100];
    STEPS.forEach(({ pct: target }, i) => {
      setTimeout(() => {
        setPct(target);
        setStatusIdx(i);
        if (fillRef.current) fillRef.current.style.width = target + "%";
      }, delays[i]);
    });
    setTimeout(() => { setHide(true); setTimeout(onDone, 850); }, 2700);
  }, []);

  return (
    <>
      <style>{css}</style>
      <div className={"loader-wrap" + (hide ? " hide" : "")}>
        <div className="loader-orb-1" />
        <div className="loader-orb-2" />
        <div className="loader-content">
          <div className="loader-icon-ring">
            <div className="loader-icon-inner">🔬</div>
          </div>
          <div className="loader-text">
            <p className="loader-title">Skin<span>AI</span></p>
            <p className="loader-sub">AI-Powered Skin Analysis</p>
          </div>
          <div className="loader-bar-section">
            <p className="loader-status">{STEPS[statusIdx]?.label}</p>
            <div className="loader-track">
              <div ref={fillRef} className="loader-fill" />
            </div>
            <p className="loader-pct">{pct}%</p>
          </div>
          <div className="loader-dots">
            <div className="loader-dot" />
            <div className="loader-dot" />
            <div className="loader-dot" />
          </div>
        </div>
      </div>
    </>
  );
}
