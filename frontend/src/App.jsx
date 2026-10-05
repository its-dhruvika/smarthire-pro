import { useState } from "react";
import UploadPanel from "./UploadPanel";
import ScoreReport from "./ScoreReport";
import InterviewPrep from "./InterviewPrep";
import EvolutionTracker from "./EvolutionTracker";
import { getTrack } from "./api";

const TABS = [
  { key: "upload", label: "Analyze", icon: "⌁" },
  { key: "report", label: "Score Report", icon: "◈" },
  { key: "interview", label: "Interview Prep", icon: "◌" },
  { key: "evolution", label: "Evolution", icon: "↗" },
];

export default function App() {
  const [mode, setMode] = useState("student");
  const [activeTab, setActiveTab] = useState("upload");
  const [trackId, setTrackId] = useState(null);
  const [currentVersion, setCurrentVersion] = useState(null);
  const [track, setTrack] = useState(null);

  async function handleResult(result) {
    setTrackId(result.trackId);
    setCurrentVersion(result.version);
    setActiveTab("report");
    try {
      const fullTrack = await getTrack(result.trackId);
      setTrack(fullTrack);
    } catch (e) {
      console.error("Could not refresh track history:", e);
    }
  }

  const navigate = (tab) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToAnalyzer = () => {
    document.getElementById("analyzer")?.scrollIntoView({ behavior: "smooth" });
  };

  const showLanding = activeTab === "upload" && !trackId;

  if (showLanding) {
    return (
      <div className="landing-shell">
        <div className="landing-noise" />
        <div className="landing-orb orb-a" />
        <div className="landing-orb orb-b" />
        <div className="landing-orb orb-c" />

        <header className="landing-nav">
          <button className="landing-brand" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            <span className="landing-logo"><i /><i /></span>
            <span>SmartHire <em>Pro</em></span>
          </button>
          <nav>
            <button className="nav-active" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>Home</button>
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}>Features</button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}>How it works</button>
            <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: "smooth" })}>About</button>
          </nav>
          <button className="landing-nav-cta" onClick={scrollToAnalyzer}>Get Started <span>↗</span></button>
        </header>

        <main>
          <section className="hero-section">
            <div className="hero-copy">
              <div className="eyebrow"><span>✦</span> AI-POWERED RESUME INTELLIGENCE</div>
              <h1>Turn Your Resume<br />Into Your <span>Career Advantage.</span></h1>
              <p className="hero-description">Stop guessing what recruiters want. SmartHire Pro analyzes your resume, finds the gaps that matter, and turns your next application into a smarter one.</p>
              <div className="hero-actions">
                <button className="hero-primary" onClick={scrollToAnalyzer}>Start Analyzing <span>→</span></button>
                <button className="hero-secondary" onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}><span className="play">▶</span> See how it works</button>
              </div>
              <div className="trust-row"><div className="trust-avatars"><span>DS</span><span>AR</span><span>NK</span><span>+10K</span></div><div><div className="stars">★★★★★</div><small>Built for ambitious job seekers</small></div></div>
            </div>

            <div className="hero-visual" aria-label="SmartHire Pro AI resume analysis preview">
              <div className="visual-grid" />
              <div className="scan-ring" />
              <div className="floating-card analysis-preview">
                <div className="mini-card-head"><span>Resume Analysis</span><b>AI</b></div>
                <div className="score-ring"><div><strong>87%</strong><small>match score</small></div></div>
                <div className="check-list"><span>✓ Skills match</span><span>✓ Experience</span><span>✓ ATS friendly</span></div>
              </div>
              <div className="floating-card insight-preview"><div className="mini-icon">✦</div><div><b>AI Insight</b><p>Strong technical profile detected.</p></div></div>
              <div className="floating-card skill-preview"><div className="mini-icon blue">↗</div><div><b>Skill Coverage</b><p>14 / 17 skills matched</p><div className="mini-progress"><i /></div></div></div>
              <div className="resume-stack"><div className="resume-sheet back"><span /><span /><span /><span /></div><div className="resume-sheet front"><div className="resume-avatar">✦</div><b>RESUME</b><span /><span /><span /><span /><span /></div></div>
              <div className="ai-pulse"><span /> AI scanning</div>
              <div className="hand-note">Better insights.<br />Better opportunities. <b>↗</b></div>
            </div>
          </section>

          <section className="feature-strip" id="features">
            <div><span className="feature-icon">▣</span><div><b>Smart Analysis</b><small>Know what works</small></div></div>
            <div><span className="feature-icon cyan">◎</span><div><b>Personalized Feedback</b><small>Improve with clarity</small></div></div>
            <div><span className="feature-icon violet">✦</span><div><b>Interview Prep</b><small>Practice with purpose</small></div></div>
            <div><span className="feature-icon green">↗</span><div><b>Track Your Growth</b><small>See your progress</small></div></div>
          </section>

          <section className="coach-section" id="about">
            <div className="section-copy"><div className="eyebrow compact"><span>✦</span> WHY SMARTHIRE PRO?</div><h2>More Than a Resume Checker.<br /><span>It’s Your AI Career Coach.</span></h2><p>From your first upload to your next interview, SmartHire Pro gives you a clear path to improve—not just another score.</p><div className="quote">“Small improvements compound into bigger opportunities.”</div></div>
            <div className="coach-visual"><div className="glow-line" /><div className="mini-dashboard"><div className="dash-top"><b>Profile readiness</b><span>+12%</span></div><div className="dash-score">82<span>/100</span></div><div className="dash-bars"><i /><i /><i /></div></div><div className="floating-tag tag-one">✓ ATS ready</div><div className="floating-tag tag-two">✦ AI feedback</div><div className="floating-tag tag-three">↗ Growth +18%</div></div>
          </section>

          <section className="steps-section" id="how-it-works">
            <div className="section-copy center"><div className="eyebrow compact"><span>01</span> HOW IT WORKS</div><h2>From resume to <span>ready.</span></h2><p>Four simple steps. One clearer career direction.</p></div>
            <div className="steps-grid"><article><span>01</span><b>Upload</b><p>Add your PDF, DOCX, or TXT resume.</p></article><article><span>02</span><b>Analyze</b><p>Compare it with the role you want.</p></article><article><span>03</span><b>Understand</b><p>See scores, strengths, gaps, and insights.</p></article><article><span>04</span><b>Improve</b><p>Practice, refine, and track your growth.</p></article></div>
          </section>

          <section className="analyzer-section" id="analyzer">
            <div className="analyzer-heading"><div><div className="eyebrow compact"><span>✦</span> YOUR NEXT STEP</div><h2>Ready to see what your resume can do?</h2><p>Upload your resume and paste a job description to unlock your analysis.</p></div><div className="mode-switch landing-mode"><button className={mode === "student" ? "selected" : ""} onClick={() => setMode("student")}>Student</button><button className={mode === "recruiter" ? "selected" : ""} onClick={() => setMode("recruiter")}>Recruiter</button></div></div>
            <UploadPanel mode={mode} trackId={null} onResult={handleResult} />
          </section>
        </main>

        <footer className="landing-footer"><b>SmartHire <em>Pro</em></b><span>Analyze smarter. Improve faster. Get ready.</span><small>© 2026 SmartHire Pro</small></footer>
      </div>
    );
  }

  return <div className="app-shell">
    <div className="ambient ambient-one" /><div className="ambient ambient-two" />
    <aside className="sidebar">
      <div>
        <div className="brand"><div className="brand-mark"><span>✦</span></div><div><div className="brand-name">SmartHire <em>Pro</em></div><div className="brand-subtitle">AI resume intelligence</div></div></div>
        <div className="workspace-pill"><span className="status-dot" /> Workspace active</div>
        <nav className="sidebar-nav" aria-label="Primary navigation"><div className="nav-caption">WORKSPACE</div>{TABS.map(tab => <button key={tab.key} className={`nav-item ${activeTab === tab.key ? "active" : ""}`} onClick={() => navigate(tab.key)}><span className="nav-icon">{tab.icon}</span><span>{tab.label}</span>{activeTab === tab.key && <span className="nav-arrow">›</span>}</button>)}</nav>
      </div>
      <div className="sidebar-bottom"><div className="mode-label">WORKSPACE MODE</div><div className="mode-switch" role="group" aria-label="Application mode"><button className={mode === "student" ? "selected" : ""} onClick={() => setMode("student")}>Student</button><button className={mode === "recruiter" ? "selected" : ""} onClick={() => setMode("recruiter")}>Recruiter</button></div>{trackId && <div className="tracking-note"><span className="tracking-kicker">TRACKING</span><strong>{track?.candidateName || "Candidate"}</strong><span>{track?.versions?.length || 1} resume version{(track?.versions?.length || 1) > 1 ? "s" : ""}</span></div>}<div className="sidebar-footer">SmartHire Pro <span>v1.0</span></div></div>
    </aside>
    <main className="main-content"><header className="topbar"><div className="breadcrumb"><span>SmartHire Pro</span><b>/</b><strong>{TABS.find(t => t.key === activeTab)?.label}</strong></div><div className="topbar-right"><button className="back-home" onClick={() => { setTrackId(null); setCurrentVersion(null); setTrack(null); setActiveTab("upload"); }}>← Home</button><span className="secure-badge">● Private analysis</span></div></header>{activeTab === "upload" && <div className="page-wrap upload-page"><UploadPanel mode={mode} trackId={trackId} onResult={handleResult} /></div>}{activeTab === "report" && <div className="page-wrap"><ScoreReport version={currentVersion} /></div>}{activeTab === "interview" && <div className="page-wrap"><InterviewPrep version={currentVersion} /></div>}{activeTab === "evolution" && <div className="page-wrap"><EvolutionTracker track={track} /></div>}</main>
  </div>;
}
