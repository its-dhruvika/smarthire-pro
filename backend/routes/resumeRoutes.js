import express from "express";
import multer from "multer";
import ResumeAnalysis from "../models/ResumeAnalysis.js";
import { extractTextFromFile } from "../utils/textExtract.js";
import {
  computeJdMatchScore,
  computeAtsScore,
  analyzeSkillGap,
} from "../utils/scoring.js";
import { generateMockInterviewQuestions } from "../utils/interviewGenerator.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

/**
 * POST /api/resume/analyze
 * form-data: resumeFile (file), jdText (string), candidateName (string),
 *            targetRole (string, optional), mode ("student" | "recruiter"),
 *            trackId (optional - if re-uploading a new version for evolution tracking)
 */
router.post("/analyze", upload.single("resumeFile"), async (req, res) => {
  try {
    const { jdText, candidateName, targetRole, mode, trackId } = req.body;

    if (!req.file) return res.status(400).json({ error: "resumeFile is required" });
    if (!jdText) return res.status(400).json({ error: "jdText is required" });
    if (!candidateName) return res.status(400).json({ error: "candidateName is required" });

    const resumeText = await extractTextFromFile(
      req.file.buffer,
      req.file.mimetype,
      req.file.originalname
    );

    const jdMatchScore = computeJdMatchScore(resumeText, jdText);
    const atsScore = computeAtsScore(resumeText, jdText);
    const skillGap = analyzeSkillGap(resumeText, jdText);
    const interviewQuestions = await generateMockInterviewQuestions({
      resumeText,
      jdText,
      missingSkills: skillGap.missingSkills,
      matchedSkills: skillGap.matchedSkills,
    });

    const versionPayload = {
      resumeText,
      fileName: req.file.originalname,
      jdText,
      jdMatchScore,
      atsScore,
      skillGap,
      interviewQuestions,
    };

    let track;
    if (trackId) {
      track = await ResumeAnalysis.findById(trackId);
      if (!track) return res.status(404).json({ error: "Track not found" });
      const nextVersionNumber = (track.versions.at(-1)?.versionNumber || 0) + 1;
      track.versions.push({ ...versionPayload, versionNumber: nextVersionNumber });
      await track.save();
    } else {
      track = await ResumeAnalysis.create({
        candidateName,
        targetRole: targetRole || "General",
        mode: mode || "student",
        versions: [{ ...versionPayload, versionNumber: 1 }],
      });
    }

    const latest = track.versions.at(-1);
    res.json({ trackId: track._id, version: latest, versionCount: track.versions.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resume/track/:id -> full history for the Evolution Tracker
router.get("/track/:id", async (req, res) => {
  try {
    const track = await ResumeAnalysis.findById(req.params.id);
    if (!track) return res.status(404).json({ error: "Track not found" });
    res.json(track);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/resume/tracks -> list all tracks (for a simple recruiter view)
router.get("/tracks", async (_req, res) => {
  try {
    const tracks = await ResumeAnalysis.find(
      {},
      "candidateName targetRole mode versions.versionNumber versions.jdMatchScore versions.atsScore.overall createdAt updatedAt"
    ).sort({ updatedAt: -1 });
    res.json(tracks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
