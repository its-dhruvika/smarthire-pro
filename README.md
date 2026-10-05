# SmartHire Pro

An explainable AI resume analyzer built on the MERN stack, with two features designed
to stand out beyond a typical resume-scoring tool:

1. **AI Mock-Interview Generator** — generates interview questions specifically targeting
   the gap between your resume and the job description (not generic questions).
2. **Resume Evolution Tracker** — every re-upload is saved as a new version, and you can
   see your JD-match, ATS, and skill-coverage scores improve over time on a trend chart.

Plus the core engine: TF-IDF + cosine similarity JD-match scoring, a 5-criteria weighted
ATS simulation score, and a skill-gap roadmap with learning resources.

---

## 1. What you need before starting (one-time setup)

You said you're new to Node/MongoDB — here's exactly what to install/create. This whole
section only needs to be done once.

### a) Install Node.js
Download and install the **LTS version** from https://nodejs.org — just click through the
installer. Verify it worked by opening a terminal and running:
```
node -v
npm -v
```
Both should print a version number.

### b) Create a free MongoDB Atlas database (no local install needed)
1. Go to https://www.mongodb.com/cloud/atlas/register and create a free account.
2. Create a free "M0" cluster (takes ~2 minutes to provision).
3. Under **Database Access**, create a database user with a username/password.
4. Under **Network Access**, click "Add IP Address" → "Allow access from anywhere" (fine for a demo project).
5. Click "Connect" on your cluster → "Drivers" → copy the connection string. It looks like:
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/
   ```
6. Replace `<username>` and `<password>` with the ones you made, and add a database name
   at the end, e.g.:
   ```
   mongodb+srv://dhruvika:yourpassword@cluster0.xxxxx.mongodb.net/smarthire-pro
   ```

### c) (Optional but recommended) Get an Anthropic API key
This powers the AI-generated interview questions. Without it, the app still works fully —
it automatically falls back to a rule-based question generator.
1. Go to https://console.anthropic.com/settings/keys
2. Create a key and copy it.

---

## 2. Project setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
```
Open `.env` in any text editor and fill in:
```
MONGO_URI=<your Atlas connection string from step 1b>
PORT=5000
ANTHROPIC_API_KEY=<your key from step 1c, or leave blank>
```
Then start it:
```bash
npm run dev
```
You should see:
```
MongoDB connected
SmartHire Pro backend running on port 5000
```

### Frontend
Open a **second terminal** (keep the backend running in the first one):
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```
It will print a local URL, usually `http://localhost:5173` — open that in your browser.

---

## 3. Using the app

1. **Upload & Analyze tab** — enter your name, paste a job description, upload your resume
   (PDF/DOCX/TXT), click "Run analysis."
2. **Score Report tab** — see your JD-match score, ATS breakdown, and skill-gap roadmap.
3. **Interview Prep tab** — see AI-generated (or rule-based) interview questions targeting
   your specific gaps, each with a suggested answer outline.
4. **Evolution Tracker tab** — after you improve your resume and re-upload it from the
   Upload tab (a second form appears once you have an active track), you'll see a trend
   chart of your scores across versions.

---

## 4. Project structure

```
smarthire-pro/
├── backend/
│   ├── server.js              # Express app entry point
│   ├── config/db.js           # MongoDB connection
│   ├── models/ResumeAnalysis.js   # Schema: candidate + version history
│   ├── routes/resumeRoutes.js     # POST /analyze, GET /track/:id, GET /tracks
│   └── utils/
│       ├── textExtract.js     # PDF/DOCX/TXT parsing
│       ├── scoring.js         # TF-IDF + cosine similarity, ATS scorer, skill-gap logic
│       ├── skillsTaxonomy.js  # Skills data + learning resources
│       └── interviewGenerator.js  # Claude API call + rule-based fallback
└── frontend/
    └── src/
        ├── App.jsx             # Tab navigation + state
        ├── UploadPanel.jsx     # Upload form
        ├── ScoreReport.jsx     # Score dashboard
        ├── InterviewPrep.jsx   # Mock interview questions
        ├── EvolutionTracker.jsx    # Score trend chart (recharts)
        └── api.js              # Backend API calls
```

---

## 5. How I'd explain this project in an interview

Be ready to answer:
- **"Walk me through the JD-match score."** — It's computed with TF-IDF (term frequency
  weighted by how rare a word is across the two documents) to build vectors for the resume
  and job description, then cosine similarity between those vectors gives a 0-100 match
  score. This is the same core technique used in real ATS/search-ranking systems.
- **"Why the Evolution Tracker?"** — Most resume tools give a one-shot score with no memory.
  This treats resume improvement as a process, storing every version so a candidate can see
  measurable proof of improvement — a genuinely different framing.
- **"Why the AI mock-interview feature?"** — The interview questions aren't generic; they're
  generated from the specific skill gaps and matched-skill list found for *this* resume
  against *this* job description, so the prep is targeted, not templated.
- **"What would you do with more time?"** — auth per user, live collaborative recruiter
  review (multiple recruiters annotating the same resume via WebSockets), and a resume
  parser that also flags formatting issues (multi-column layouts, embedded tables) that
  real ATS platforms fail to parse.

---

## 6. Notes

- I tested the scoring engine, skill-gap logic, and interview question generator (both
  AI and rule-based paths) directly — all working correctly. The frontend builds cleanly.
  Full database read/write wasn't testable in my sandboxed environment (no internet access
  to MongoDB's servers), so test that end-to-end once you connect your own Atlas cluster —
  the code path is straightforward and this is the most likely spot to double check first
  if something doesn't work.
- If you get a MongoDB connection error, double check: password has no unescaped special
  characters, and Network Access allows your IP (or "allow from anywhere").
