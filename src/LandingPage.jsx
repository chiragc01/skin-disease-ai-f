import { useState } from "react";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;600&display=swap');
  .lp-orb{position:fixed;border-radius:50%;filter:blur(80px);pointer-events:none;z-index:0}
  .lp-orb-1{width:550px;height:550px;background:radial-gradient(circle,rgba(99,102,241,0.2),transparent);top:-180px;left:-120px;animation:lpFloat 10s ease-in-out infinite}
  .lp-orb-2{width:380px;height:380px;background:radial-gradient(circle,rgba(236,72,153,0.16),transparent);top:30%;right:-80px;animation:lpFloat 13s ease-in-out infinite reverse}
  .lp-orb-3{width:420px;height:420px;background:radial-gradient(circle,rgba(6,182,212,0.12),transparent);bottom:-60px;left:10%;animation:lpFloat 11s ease-in-out infinite 3s}
  @keyframes lpFloat{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-25px) scale(1.06)}}
  .landing-page{position:relative;z-index:1;min-height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:2rem 1.25rem 3rem;text-align:center;font-family:'Outfit',sans-serif;transition:opacity 0.6s ease,transform 0.6s ease}
  .landing-page.exit{opacity:0;transform:translateY(-30px);pointer-events:none}
  .lp-content{position:relative;z-index:1;max-width:560px;width:100%}
  .lp-badge{display:inline-flex;align-items:center;gap:8px;background:rgba(99,102,241,0.1);border:1px solid rgba(99,102,241,0.22);border-radius:99px;padding:6px 16px;font-size:0.68rem;font-weight:700;color:#a5b4fc;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:2rem;animation:lpFadeUp 0.7s ease 0.1s both}
  .lp-live-dot{width:7px;height:7px;background:#6366f1;border-radius:50%;animation:livePulse 2s ease infinite;flex-shrink:0}
  @keyframes livePulse{0%,100%{opacity:1;transform:scale(1)}50%{opacity:0.4;transform:scale(1.7)}}
  .lp-title{font-size:clamp(2.5rem,9vw,4.8rem);font-weight:900;line-height:1.04;letter-spacing:-2px;margin-bottom:1.5rem;animation:lpFadeUp 0.7s ease 0.25s both}
  .lp-grad{background:linear-gradient(135deg,#f8fafc 0%,#c7d2fe 35%,#f472b6 65%,#c084fc 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .lp-desc{font-size:clamp(0.9rem,2.5vw,1rem);color:#475569;line-height:1.75;font-weight:500;margin-bottom:2rem;animation:lpFadeUp 0.7s ease 0.4s both}
  .lp-pills{display:flex;gap:8px;flex-wrap:wrap;justify-content:center;margin-bottom:2.5rem;animation:lpFadeUp 0.7s ease 0.5s both}
  .lp-pill{display:flex;align-items:center;gap:6px;padding:7px 14px;border-radius:99px;background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.07);font-size:0.76rem;font-weight:600;color:#64748b}
  .lp-cta{display:flex;flex-direction:column;align-items:center;gap:14px;animation:lpFadeUp 0.7s ease 0.65s both}
  .lp-btn{display:inline-flex;align-items:center;gap:12px;padding:18px 48px;background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 50%,#a855f7 100%);color:white;border:none;border-radius:18px;font-family:'Outfit',sans-serif;font-weight:800;font-size:1.1rem;cursor:pointer;transition:all 0.3s ease;touch-action:manipulation;box-shadow:0 8px 30px rgba(99,102,241,0.4),inset 0 1px 0 rgba(255,255,255,0.15);position:relative;overflow:hidden}
  .lp-btn::before{content:'';position:absolute;inset:0;background:linear-gradient(135deg,rgba(255,255,255,0.12),transparent);opacity:0;transition:opacity 0.3s}
  .lp-btn:hover::before{opacity:1}
  .lp-btn:hover{transform:translateY(-3px);box-shadow:0 16px 50px rgba(99,102,241,0.55),0 0 0 6px rgba(99,102,241,0.1),inset 0 1px 0 rgba(255,255,255,0.15)}
  .lp-btn:active{transform:translateY(-1px)}
  .lp-btn-arrow{font-size:1.1rem;transition:transform 0.3s;display:inline-block}
  .lp-btn:hover .lp-btn-arrow{transform:translateX(5px)}
  .lp-note{font-size:0.72rem;color:#334155;font-weight:500}
  .lp-stats{display:flex;gap:clamp(1.5rem,5vw,3rem);justify-content:center;flex-wrap:wrap;margin-top:4rem;animation:lpFadeUp 0.7s ease 0.85s both}
  .lp-stat{text-align:center}
  .lp-stat-num{font-size:1.7rem;font-weight:900;font-family:'JetBrains Mono',monospace;background:linear-gradient(135deg,#818cf8,#c084fc);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text}
  .lp-stat-label{font-size:0.68rem;color:#334155;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;margin-top:3px}
  .lp-stat-div{width:1px;background:rgba(255,255,255,0.06);align-self:stretch}
  @keyframes lpFadeUp{from{opacity:0;transform:translateY(22px)}to{opacity:1;transform:translateY(0)}}
`;

export default function LandingPage({ onEnter }) {
  const [exiting, setExiting] = useState(false);

  const handleEnter = () => {
    setExiting(true);
    setTimeout(onEnter, 620);
  };

  return (
    <>
      <style>{css}</style>
      <div className="lp-orb lp-orb-1" />
      <div className="lp-orb lp-orb-2" />
      <div className="lp-orb lp-orb-3" />

      <div className={"landing-page" + (exiting ? " exit" : "")}>
        <div className="lp-content">

          <div className="lp-badge">
            <div className="lp-live-dot" />
            AI Skin Analysis · 7 Disease Classes
          </div>

          <h1 className="lp-title">
            <span className="lp-grad">Predict Skin</span><br />
            <span className="lp-grad">Disease Instantly</span>
          </h1>

          <p className="lp-desc">
            Upload a photo or use your camera. Our AI model trained on 10,000+ medical
            images gives you an instant skin disease prediction with clear, actionable advice.
          </p>

          <div className="lp-pills">
            {["🔬 AI Powered", "📷 Live Camera", "⚡ Instant Results", "🩺 7 Disease Classes", "🔒 Private"].map(f => (
              <div key={f} className="lp-pill">{f}</div>
            ))}
          </div>

          <div className="lp-cta">
            <button className="lp-btn" onClick={handleEnter}>
              🔬 Predict Disease
              <span className="lp-btn-arrow">→</span>
            </button>
            <p className="lp-note">No sign up required · Free to use</p>
          </div>

          <div className="lp-stats">
            <div className="lp-stat">
              <div className="lp-stat-num">10K+</div>
              <div className="lp-stat-label">Training Images</div>
            </div>
            <div className="lp-stat-div" />
            <div className="lp-stat">
              <div className="lp-stat-num">7</div>
              <div className="lp-stat-label">Disease Classes</div>
            </div>
            <div className="lp-stat-div" />
            <div className="lp-stat">
              <div className="lp-stat-num">AI</div>
              <div className="lp-stat-label">Powered Model</div>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
