// Generates targeted mock-interview questions based on the gap between
// a resume and a job description. Uses the Anthropic Messages API when
// ANTHROPIC_API_KEY is set; otherwise falls back to a rule-based generator
// so the app still works fully offline / without a key.

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

function buildPrompt({ resumeText, jdText, missingSkills, matchedSkills }) {
  return `You are an experienced technical interviewer. Based on the candidate's resume and the job description below, generate 6 realistic interview questions the candidate is likely to be asked.

Focus especially on:
1. Probing the gap areas: ${missingSkills.join(", ") || "none major"}
2. Verifying depth on claimed strengths: ${matchedSkills.join(", ") || "general background"}
3. At least 2 behavioral/project-deep-dive questions specific to their resume content.

Return ONLY valid JSON, no preamble, no markdown fences, in this exact shape:
[
  { "question": "...", "type": "technical" | "behavioral" | "project-deep-dive", "targets": "short phrase on what this question probes", "modelAnswerOutline": "2-3 sentence outline of a strong answer" }
]

RESUME:
"""${resumeText.slice(0, 6000)}"""

JOB DESCRIPTION:
"""${jdText.slice(0, 3000)}"""`;
}

async function callAnthropic(prompt) {
  const response = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Anthropic API error: ${response.status} ${errText}`);
  }

  const data = await response.json();
  const textBlock = data.content.find((b) => b.type === "text");
  const cleaned = (textBlock?.text || "[]")
    .replace(/```json|```/g, "")
    .trim();

  return JSON.parse(cleaned);
}

function fallbackQuestions({ missingSkills, matchedSkills }) {
  const questions = [];

  missingSkills.slice(0, 3).forEach((skill) => {
    questions.push({
      question: `The role expects familiarity with ${skill}, which isn't clearly reflected in your resume. Can you walk me through any exposure you've had to it, even informally?`,
      type: "technical",
      targets: `Gap area: ${skill}`,
      modelAnswerOutline: `Mention any coursework, side projects, or self-study touching ${skill}. Be honest about depth, then pivot to how quickly you pick up related tools, with a concrete past example.`,
    });
  });

  matchedSkills.slice(0, 2).forEach((skill) => {
    questions.push({
      question: `Your resume lists ${skill}. Tell me about the most technically challenging thing you built with it.`,
      type: "technical",
      targets: `Depth check: ${skill}`,
      modelAnswerOutline: `Pick one specific project. Describe the hardest technical decision, why you made it, and what you'd do differently now.`,
    });
  });

  questions.push({
    question: "Walk me through a project from your resume end-to-end, as if I've never seen it before.",
    type: "project-deep-dive",
    targets: "Overall project ownership and communication",
    modelAnswerOutline: "Structure as: problem -> approach -> your specific contribution -> one obstacle -> outcome/metrics.",
  });

  questions.push({
    question: "Tell me about a time a project didn't go as planned. What happened and what did you do?",
    type: "behavioral",
    targets: "Resilience and problem-solving under ambiguity",
    modelAnswerOutline: "Use STAR: brief situation, your specific action, and a measurable or learned outcome.",
  });

  return questions;
}

export async function generateMockInterviewQuestions({
  resumeText,
  jdText,
  missingSkills,
  matchedSkills,
}) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return { source: "rule-based", questions: fallbackQuestions({ missingSkills, matchedSkills }) };
  }

  try {
    const prompt = buildPrompt({ resumeText, jdText, missingSkills, matchedSkills });
    const questions = await callAnthropic(prompt);
    return { source: "ai-generated", questions };
  } catch (err) {
    console.error("Falling back to rule-based interview questions:", err.message);
    return { source: "rule-based-fallback", questions: fallbackQuestions({ missingSkills, matchedSkills }) };
  }
}
