import mongoose from "mongoose";

const interviewQuestionSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
    targets: {
      type: String,
      default: "",
    },
    modelAnswerOutline: {
      type: String,
      default: "",
    },
  },
  { _id: false }
);

const versionSchema = new mongoose.Schema(
  {
    versionNumber: {
      type: Number,
      required: true,
    },

    resumeText: {
      type: String,
      required: true,
    },

    fileName: String,

    jdText: {
      type: String,
      required: true,
    },

    jdMatchScore: {
      type: Number,
      required: true,
    },

    atsScore: {
      overall: Number,
      breakdown: [
        {
          label: String,
          score: Number,
          weight: Number,
        },
      ],
    },

    skillGap: {
      jdSkillsFound: [String],
      matchedSkills: [String],
      missingSkills: [String],
      matchPercent: Number,

      roadmap: [
        {
          skill: String,
          resource: String,
          priority: String,
        },
      ],
    },

    interviewQuestions: {
      source: {
        type: String,
        default: "rule-based",
      },

      questions: {
        type: [interviewQuestionSchema],
        default: [],
      },
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

const resumeAnalysisSchema = new mongoose.Schema(
  {
    candidateName: {
      type: String,
      required: true,
    },

    targetRole: {
      type: String,
      default: "General",
    },

    mode: {
      type: String,
      enum: ["student", "recruiter"],
      default: "student",
    },

    versions: [versionSchema],
  },
  {
    timestamps: true,
  }
);

export default mongoose.model(
  "ResumeAnalysis",
  resumeAnalysisSchema
);
