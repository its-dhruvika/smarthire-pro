import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5000/api";

export async function analyzeResume({ file, jdText, candidateName, targetRole, mode, trackId }) {
  const formData = new FormData();
  formData.append("resumeFile", file);
  formData.append("jdText", jdText);
  formData.append("candidateName", candidateName);
  formData.append("targetRole", targetRole || "");
  formData.append("mode", mode || "student");
  if (trackId) formData.append("trackId", trackId);

  const res = await axios.post(`${API_BASE}/resume/analyze`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function getTrack(trackId) {
  const res = await axios.get(`${API_BASE}/resume/track/${trackId}`);
  return res.data;
}

export async function listTracks() {
  const res = await axios.get(`${API_BASE}/resume/tracks`);
  return res.data;
}
