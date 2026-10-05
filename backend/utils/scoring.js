import { ALL_SKILLS, LEARNING_RESOURCES } from "./skillsTaxonomy.js";

// ---------- Text utilities ----------

const STOPWORDS = new Set([
  "the","a","an","and","or","but","is","are","was","were","be","been","being",
  "to","of","in","on","for","with","as","by","at","from","this","that","it",
  "will","we","you","your","our","i","he","she","they","them","their","its",
  "have","has","had","do","does","did","not","no","so","if","than","then",
  "into","about","over","under","after","before","up","down","out","off"
]);

export function tokenize(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^a-z0-9+.\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 1 && !STOPWORDS.has(w));
}

// ---------- TF-IDF + cosine similarity ----------
// Treats resume and JD as a 2-document corpus for IDF purposes.

function termFrequency(tokens) {
  const tf = {};
  tokens.forEach((t) => (tf[t] = (tf[t] || 0) + 1));
  const total = tokens.length || 1;
  Object.keys(tf).forEach((k) => (tf[k] = tf[k] / total));
  return tf;
}

function buildVocab(...tokenLists) {
  const vocab = new Set();
  tokenLists.forEach((list) => list.forEach((t) => vocab.add(t)));
  return Array.from(vocab);
}

function inverseDocFreq(vocab, docsTokens) {
  const idf = {};
  const N = docsTokens.length;
  vocab.forEach((term) => {
    const containing = docsTokens.filter((doc) => doc.includes(term)).length;
    idf[term] = Math.log((N + 1) / (containing + 1)) + 1; // smoothed idf
  });
  return idf;
}

function tfidfVector(tf, idf, vocab) {
  return vocab.map((term) => (tf[term] || 0) * (idf[term] || 0));
}

function cosineSimilarity(vecA, vecB) {
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    magA += vecA[i] * vecA[i];
    magB += vecB[i] * vecB[i];
  }
  if (magA === 0 || magB === 0) return 0;
  return dot / (Math.sqrt(magA) * Math.sqrt(magB));
}

/**
 * Computes a 0-100 JD-match score using TF-IDF weighted cosine similarity
 * between the resume text and the job description text.
 */
export function computeJdMatchScore(resumeText, jdText) {
  const resumeTokens = tokenize(resumeText);
  const jdTokens = tokenize(jdText);

  const vocab = buildVocab(resumeTokens, jdTokens);
  const idf = inverseDocFreq(vocab, [resumeTokens, jdTokens]);

  const resumeVec = tfidfVector(termFrequency(resumeTokens), idf, vocab);
  const jdVec = tfidfVector(termFrequency(jdTokens), idf, vocab);

  const similarity = cosineSimilarity(resumeVec, jdVec);
  return Math.round(similarity * 100);
}

// ---------- ATS simulation scorer ----------
// Weighted across 5 criteria that real ATS platforms (Workday, Greenhouse, etc.)
// commonly parse for: keyword match, section structure, formatting/parseability,
// quantified achievements, and contact/section completeness.

const ATS_CRITERIA = [
  { key: "keywordMatch", label: "Keyword Match", weight: 0.35 },
  { key: "sectionStructure", label: "Section Structure", weight: 0.2 },
  { key: "quantifiedImpact", label: "Quantified Achievements", weight: 0.2 },
  { key: "formatting", label: "Formatting / Parseability", weight: 0.15 },
  { key: "completeness", label: "Contact & Section Completeness", weight: 0.1 },
];

function scoreKeywordMatch(resumeText, jdText) {
  return computeJdMatchScore(resumeText, jdText);
}

function scoreSectionStructure(resumeText) {
  const sections = ["experience", "education", "project", "skill"];
  const lower = resumeText.toLowerCase();
  const found = sections.filter((s) => lower.includes(s)).length;
  return Math.round((found / sections.length) * 100);
}

function scoreQuantifiedImpact(resumeText) {
  // Looks for numbers/percentages near action verbs — a proxy for measurable impact.
  const matches = resumeText.match(/\d+(\.\d+)?%|\b\d{2,}\+?\b/g) || [];
  const density = matches.length / Math.max(resumeText.split(/\n/).length, 1);
  return Math.min(100, Math.round(density * 200));
}

function scoreFormatting(resumeText) {
  // Penalize very long unbroken lines / lack of line breaks (proxy for tables/columns
  // that break real ATS parsers), reward clear line-based structure.
  const lines = resumeText.split(/\n/).filter(Boolean);
  const avgLen = resumeText.length / Math.max(lines.length, 1);
  if (avgLen > 300) return 40; // likely dense/table-like, hard to parse
  if (avgLen > 150) return 70;
  return 95;
}

function scoreCompleteness(resumeText) {
  const checks = [
    /\b[\w.+-]+@[\w-]+\.[\w.-]+\b/, // email
    /\+?\d[\d\s-]{8,}\d/, // phone
    /education/i,
    /(experience|intern)/i,
    /project/i,
  ];
  const passed = checks.filter((re) => re.test(resumeText)).length;
  return Math.round((passed / checks.length) * 100);
}

export function computeAtsScore(resumeText, jdText) {
  const scores = {
    keywordMatch: scoreKeywordMatch(resumeText, jdText),
    sectionStructure: scoreSectionStructure(resumeText),
    quantifiedImpact: scoreQuantifiedImpact(resumeText),
    formatting: scoreFormatting(resumeText),
    completeness: scoreCompleteness(resumeText),
  };

  const overall = ATS_CRITERIA.reduce(
    (sum, c) => sum + scores[c.key] * c.weight,
    0
  );

  return {
    overall: Math.round(overall),
    breakdown: ATS_CRITERIA.map((c) => ({
      label: c.label,
      score: scores[c.key],
      weight: c.weight,
    })),
  };
}

// ---------- Skill-gap analysis ----------

export function analyzeSkillGap(resumeText, jdText) {
  const resumeLower = resumeText.toLowerCase();
  const jdLower = jdText.toLowerCase();

  const jdSkills = ALL_SKILLS.filter((skill) => jdLower.includes(skill));
  const resumeSkills = ALL_SKILLS.filter((skill) => resumeLower.includes(skill));

  const matched = jdSkills.filter((s) => resumeSkills.includes(s));
  const missing = jdSkills.filter((s) => !resumeSkills.includes(s));

  const roadmap = missing.map((skill) => ({
    skill,
    resource:
      LEARNING_RESOURCES[skill] ||
      `Search for a focused tutorial or short course on "${skill}" and build one small project applying it.`,
    priority: jdLower.split(skill).length - 1 > 1 ? "High" : "Medium",
  }));

  return {
    jdSkillsFound: jdSkills,
    matchedSkills: matched,
    missingSkills: missing,
    matchPercent: jdSkills.length
      ? Math.round((matched.length / jdSkills.length) * 100)
      : 0,
    roadmap,
  };
}
