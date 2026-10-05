import { useRef, useState } from "react";
import { analyzeResume } from "./api";

export default function UploadPanel({ mode, trackId, onResult }) {
  const [file, setFile] = useState(null), [jdText, setJdText] = useState(""), [candidateName, setCandidateName] = useState(""), [targetRole, setTargetRole] = useState(""), [loading, setLoading] = useState(false), [dragging, setDragging] = useState(false), [error, setError] = useState("");
  const fileRef = useRef(null), isReupload = Boolean(trackId);
  function acceptFile(nextFile) {
    if (!nextFile) return;
    if (!/\.(pdf|docx|txt)$/i.test(nextFile.name)) return setError("Please choose a PDF, DOCX, or TXT resume.");
    if (nextFile.size > 10 * 1024 * 1024) return setError("Resume must be smaller than 10 MB.");
    setError(""); setFile(nextFile);
  }
  async function handleSubmit(e) {
    e.preventDefault(); setError("");
    if (!file || !jdText.trim() || (!isReupload && !candidateName.trim())) return setError("Please add a resume file, a job description, and your name.");
    setLoading(true);
    try { const result = await analyzeResume({ file, jdText, candidateName, targetRole, mode, trackId }); onResult(result); }
    catch (err) { setError(err.response?.data?.error || err.message || "Analysis failed. Please try again."); }
    finally { setLoading(false); }
  }
  return <section className="upload-panel">
    <div className="page-heading"><div><h1>{isReupload ? "Upload a new resume version" : "Analyze your resume against a role"}</h1><p>{isReupload ? "Add another revision to your resume evolution timeline." : "Get an explainable match score, ATS diagnostics, skill gaps, and interview prep."}</p></div></div>
    <div className="analysis-card">
      <div className="card-title-row"><div><h2>{isReupload ? "Upload a new version" : "Start a new analysis"}</h2><p>{isReupload ? "This version will be added to your evolution timeline." : "Compare your resume with a job description and get an explainable readiness report."}</p></div><span className="step-indicator">{isReupload ? "VERSION UPDATE" : "STEP 1 OF 1"}</span></div>
      <form onSubmit={handleSubmit} className="analysis-form">
        {!isReupload && <div className="field-group"><label>Candidate details</label><div className="field-grid"><input value={candidateName} onChange={e => setCandidateName(e.target.value)} placeholder="Candidate name"/><input value={targetRole} onChange={e => setTargetRole(e.target.value)} placeholder="Target role (optional)"/></div></div>}
        <div className="field-group"><label>Resume</label><button type="button" className={`dropzone ${dragging ? "dragging" : ""} ${file ? "has-file" : ""}`} onClick={() => fileRef.current?.click()} onDragOver={e => {e.preventDefault();setDragging(true)}} onDragLeave={() => setDragging(false)} onDrop={e => {e.preventDefault();setDragging(false);acceptFile(e.dataTransfer.files?.[0])}}><span className="dropzone-icon">↑</span><span className="dropzone-copy"><strong>{file ? file.name : "Drop PDF, DOCX, or TXT here"}</strong><small>{file ? `${(file.size/1024/1024).toFixed(2)} MB • Ready to analyze` : "or choose a file • max 10 MB"}</small></span><span className="browse-label">Browse</span></button><input ref={fileRef} className="visually-hidden" type="file" accept=".pdf,.docx,.txt" onChange={e => acceptFile(e.target.files?.[0])}/></div>
        <div className="field-group"><label htmlFor="job-description">Job description</label><textarea id="job-description" value={jdText} onChange={e => setJdText(e.target.value)} placeholder="Paste the full job description here…"/></div>
        {error && <div className="error-banner" role="alert">{error}</div>}
        <div className="form-footer"><p>Local scoring + optional AI interview generation. Your resume is never modified.</p><button className="primary-button" type="submit" disabled={loading}>{loading ? "Analyzing…" : "Run analysis →"}</button></div>
      </form>
    </div>
  </section>;
}
