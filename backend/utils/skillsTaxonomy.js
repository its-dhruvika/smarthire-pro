// A curated taxonomy of skills grouped by domain.
// Used for skill-gap detection and generating a prioritized learning roadmap.
// Extend this list any time — it's plain data, no logic changes needed.

export const SKILLS_TAXONOMY = {
  "Frontend": [
    "react", "redux", "vue", "angular", "javascript", "typescript", "html", "css",
    "tailwind", "sass", "webpack", "vite", "next.js", "responsive design", "accessibility"
  ],
  "Backend": [
    "node.js", "express", "django", "flask", "spring boot", "rest api", "graphql",
    "microservices", "websockets", "authentication", "jwt", "oauth"
  ],
  "Database": [
    "mongodb", "postgresql", "mysql", "redis", "sql", "nosql", "database design",
    "indexing", "orm", "mongoose"
  ],
  "AI/ML": [
    "python", "machine learning", "deep learning", "nlp", "scikit-learn", "tensorflow",
    "pytorch", "pandas", "numpy", "xgboost", "shap", "tf-idf", "cosine similarity",
    "data preprocessing", "feature engineering", "model deployment"
  ],
  "DevOps/Cloud": [
    "docker", "kubernetes", "aws", "gcp", "azure", "ci/cd", "git", "github actions",
    "linux", "nginx", "terraform"
  ],
  "CS Fundamentals": [
    "data structures", "algorithms", "system design", "oop", "dbms",
    "operating systems", "networking", "time complexity"
  ],
  "Soft/Process": [
    "agile", "scrum", "communication", "leadership", "documentation",
    "cross-functional collaboration", "code review"
  ]
};

// Flat list, used for quick matching against resume/JD text
export const ALL_SKILLS = Object.values(SKILLS_TAXONOMY).flat();

// Simple learning-resource suggestions per skill (used to build the roadmap).
// Keeping this data-driven means adding a resource is a one-line change.
export const LEARNING_RESOURCES = {
  "react": "Official React docs — 'Learn React' tutorial + build 2 small projects",
  "system design": "Read 'System Design Interview' by Alex Xu, Vol 1",
  "docker": "Docker's official 'Get Started' guide + containerize one existing project",
  "aws": "AWS Cloud Practitioner Essentials (free tier)",
  "graphql": "'How to GraphQL' interactive tutorial",
  "websockets": "Build a small real-time chat app using Socket.io",
  // default fallback resource is generated dynamically if a skill isn't listed here
};
