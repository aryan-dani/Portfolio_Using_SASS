const projectEntries = [
  {
    id: 1,
    title: "The Fourth Clover",
    category: "web-dev",
    year: "2025 - 2026",
    description: `A modern, minimalist blogging platform built for writers and thinkers. Features include a rich writing experience with real-time auto-save, threaded comments with nested replies, social sharing, Google OAuth authentication, and seamless image upload with Supabase Storage. Built with Next.js 15 App Router for optimal performance and SEO.`,
    image: "/Images/Projects/The_Fourth_Clover.jpg",
    tags: [
      "Next.js",
      "TypeScript",
      "Supabase",
      "Tailwind CSS",
      "React Hook Form",
    ],
    skillIds: ["nextjs", "typescript", "supabase", "tailwind", "react", "javascript", "html5", "css3", "git", "vercel"],
    links: {
      github: "https://github.com/aryan-dani/The-Fourth-Clover",
      preview: "https://thefourthclover.bio/",
    },
  },
  {
    id: 10,
    title: "The Shadow Instructor",
    category: "ai-ml",
    year: "2026",
    description: `A real-time, dual-agent technical interview simulation platform powered by Google's Gemini 3.0. Features an Interviewer Agent (Gemini 3.0 Flash) for low-latency conversation and a Shadow Agent (Gemini 3.0 Pro) for real-time analysis of technical accuracy, communication patterns, and confidence. Includes PDF resume parsing to tailor interviews dynamically.`,
    image: "/Images/Projects/Shadow_Instructor.jpg",
    tags: [
      "Gemini 3.0",
      "Next.js",
      "FastAPI",
      "WebSockets",
      "Dual-Agent Architecture",
    ],
    skillIds: ["llms", "agentic", "nextjs", "fastapi", "websockets", "python", "prompt-engineering", "git", "vercel"],
    links: {
      github: "https://github.com/aryan-dani/The_Shadow_Instructor",
      preview: "https://the-shadow-instructor.vercel.app/",
    },
  },
  {
    id: 11,
    title: "Arbiter: RIFT 2026",
    category: "ai-ml",
    year: "2026",
    description: `An autonomous CI/CD healing agent built for RIFT 2026. Leveraging a Multi-Agent Architecture with Gemini 2.5 Flash, it identifies, debugs, and fixes repository errors within secure Docker sandboxes. Features a sophisticated state machine with nodes for Discovery, Testing, Anchor-based Debugging, and Git operations.`,
    image: "/Images/Projects/Arbiter.jpg",
    tags: [
      "Gemini 2.5",
      "FastAPI",
      "LangGraph",
      "Docker",
      "Multi-Agent Systems",
    ],
    skillIds: ["llms", "agentic", "langgraph", "fastapi", "docker", "python", "prompt-engineering", "git", "vercel", "github-actions"],
    links: {
      github: "https://github.com/aryan-dani/Arbiter",
      preview: "https://thearbiter.vercel.app/",
    },
  },
  {
    id: 16,
    title: "Samiksha",
    category: "web-dev",
    year: "2025 - 2026",
    description: `Frontend for a Cloud Security Posture Management console — the operator UI for runtime and IaC findings, compliance posture, AI insights, and ticketing. I owned the React/TypeScript client: auth and routing shells, responsive layouts, light/dark theming, and consistent page chrome across the product surface. Live at samikshaunited.app (team backend handles scanners and cloud integrations).`,
    image: "/Images/Projects/Samiksha.jpg",
    tags: ["React", "TypeScript", "Vite", "CSS", "UI"],
    skillIds: ["react", "typescript", "vite", "javascript", "html5", "css3", "git"],
    links: {
      github: "https://github.com/atamalajopyetie/CSPM_Capstone",
      preview: "https://samikshaunited.app/",
    },
  },
  {
    id: 17,
    title: "Aegis",
    category: "web-dev",
    year: "2025 - 2026",
    description: `Local-first Windows desktop password manager built with Tauri, Rust, and React. Vault data stays on the device with zero-knowledge master-password key derivation (Argon2id), AES-256-GCM entry encryption, and a SQLCipher-protected database. Designed for focused local secrets without background sync, account recovery, or telemetry — signed updates ship via GitHub Releases.`,
    image: "/Images/Projects/Aegis.jpg",
    tags: ["Tauri", "Rust", "React", "SQLCipher", "Security"],
    skillIds: ["tauri", "rust", "react", "typescript", "vite", "javascript", "git"],
    problem:
      "Most password managers push cloud sync and account recovery, which conflicts with users who want secrets to stay on their machine with no telemetry.",
    solution:
      "Aegis keeps the vault local, derives keys only from the master password, and limits network use to signed update checks and optional breach lookups.",
    architecture:
      "Tauri desktop shell with a React UI, Rust backend, Argon2id key derivation, AES-256-GCM for entries, and SQLCipher for the on-disk vault.",
    results:
      "Windows installer + in-app signed updates from GitHub Releases; losing the master password permanently loses vault access by design.",
    links: {
      github: "https://github.com/aryan-dani/Aegis",
    },
  },
  {
    id: 12,
    title: "Democrazy",
    category: "web-dev",
    year: "2026",
    description: `Interactive election-readiness learning app: scripted voter journeys, adaptive Gemini-powered simulation, quizzes with history and badges, timeline explorer, and an optional Firebase sign-in + Firestore progress mirror. Built as a React SPA (Vite) with lightweight serverless endpoints for Gemini on Vercel.`,
    image: "/Images/Projects/Democrazy.jpg",
    tags: ["React", "Vite", "Gemini", "Vercel", "Serverless", "Firebase"],
    skillIds: ["react", "vite", "llms", "firebase", "javascript", "html5", "css3", "prompt-engineering", "git", "vercel"],
    links: {
      github: "https://github.com/aryan-dani/Democrazy",
      preview: "https://democrazy-omega.vercel.app/",
    },
  },
  {
    id: 13,
    title: "Utility",
    category: "web-dev",
    year: "2026",
    description: `Academic OS: a minimalist academic workspace for students with Document Intelligence (RAG), a Parallel Indexing Engine, Supabase auth & storage, a Pomodoro focus timer, GPA calculator, and study tools. Built with Next.js, Tailwind, and deployed on Vercel.`,
    image: "/Images/Projects/Utility.jpg",
    tags: ["Next.js", "Supabase", "TypeScript", "Tailwind CSS", "Vercel", "AI"],
    skillIds: ["nextjs", "supabase", "typescript", "tailwind", "rag", "javascript", "html5", "css3", "git", "vercel"],
    links: {
      github: "https://github.com/aryan-dani/Utility",
      preview: "https://utilityos.tech",
    },
  },
  {
    id: 14,
    title: "Ishani",
    category: "web-dev",
    year: "2026",
    description: `Ishani - a timetable and department portal with an AI assistant for MIT-WPU (Groq-backed), multi-semester grids, staff directory, and admin APIs. Built as a React (Vite) frontend with a FastAPI backend and optional RAG-powered chat.`,
    image: "/Images/Projects/Ishani.jpg",
    tags: ["React", "Vite", "FastAPI", "Groq", "AI"],
    skillIds: ["react", "vite", "fastapi", "groq", "rag", "python", "llms", "prompt-engineering", "javascript", "html5", "css3", "rest-api"],
    links: {
      preview: "https://miniproject-aies.pages.dev/",
    },
  },
  {
    id: 2,
    title: "DebateBot",
    category: "ai-ml",
    year: "2026",
    description: `An intelligent debating platform powered by LLaMA 3.3 70B and LangGraph. Features dual-AI debates with formal stages (Opening, Rebuttal, Closing), a Live Arena where users can challenge the AI directly, smart scoring with feedback on coherence, evidence usage, and logical fallacies, plus real-time streaming for fluid argument generation.`,
    image: "/Images/Projects/DebateBot.jpg",
    tags: ["Python", "FastAPI", "React", "LangGraph", "LLaMA 3.3"],
    skillIds: ["python", "fastapi", "react", "langgraph", "llms", "prompt-engineering", "rest-api", "git"],
    links: {
      github: "https://github.com/aryan-dani/DebateBot",
      preview: "https://debate-bot-psi.vercel.app",
    },
  },
  {
    id: 3,
    title: "PosePro",
    category: "ai-ml",
    year: "2026",
    description: `AI-powered real-time shoulder raise form analyzer. Features live camera tracking with MediaPipe pose detection, automatic rep counting, instant feedback with angle visualization, and comprehensive metrics including range of motion, bilateral symmetry, torso stability, and elbow position. Includes a performance dashboard, session history, leaderboards, achievements, and an AI form assistant chatbot for personalized technique advice.`,
    image: "/Images/Projects/PosePro.jpg",
    tags: ["Python", "Flask", "MediaPipe", "OpenCV", "Computer Vision"],
    skillIds: ["python", "flask", "mediapipe", "opencv", "computer-vision", "rest-api", "git"],
    links: {
      github: "https://github.com/aryan-dani/Pose_Pro",
    },
  },
  {
    id: 4,
    title: "North-Star",
    category: "ai-ml",
    year: "2025",
    description: `NASA Space Apps Challenge 2025 submission for exoplanet candidate classification. A full-stack ML web application achieving 76% accuracy with Random Forest on NASA Kepler data. Features 7 trained ML models, real-time WebSocket training studio, comprehensive analytics with confusion matrices and ROC curves, batch predictions, and a space-themed React + TypeScript frontend with FastAPI backend.`,
    image: "/Images/Projects/North_Star.jpg",
    tags: ["Python", "FastAPI", "React", "TypeScript", "scikit-learn"],
    skillIds: ["python", "fastapi", "react", "typescript", "scikit-learn", "data-analysis", "websockets", "git"],
    links: {
      github: "https://github.com/aryan-dani/North-Star",
    },
  },
  {
    id: 5,
    title: "Real Time Threat Detection System",
    category: "ai-ml",
    year: "2024 - 2025",
    description: `MIT-WPU capstone system for real-time threat detection using YOLO v11 and EfficientNetV2. Identifies potential security risks through live video analysis and X-ray scan classification with a focus on weapon detection. Integrates with security workflows for automated alerts, monitoring dashboards, and model evaluation pipelines.`,
    image: "/Images/Projects/Threat_Detection_System.jpg",
    tags: ["Python", "Yolo v11", "Deep Learning", "EfficientNetV2", "Angular"],
    skillIds: ["python", "pytorch", "deep-learning", "opencv", "computer-vision", "angular", "git"],
    links: {
      preview: "https://aryan-dani.github.io/Threat_Detection_System/",
      github: "https://github.com/aryan-dani/Threat_Detection_System",
    },
  },
  {
    id: 6,
    title: "Automated Dicom Slice Analyzer",
    category: "ai-ml",
    year: "2025",
    description: `Upon experimenting various CNN models like InceptionResnetV2 and Vision Transformers, optimizing them to identify anomalies in Dicom Slices and then deploying a Vision Language Model to describe what the anomaly is and in which slice it is presented. This project aims to assist radiologists in identifying and diagnosing anomalies more efficiently.`,
    image: "/Images/Projects/Dicom_Slice.jpg",
    tags: ["CNN's", "Vision Language Models", "Vision Transformers"],
    skillIds: ["python", "tensorflow", "deep-learning", "computer-vision"],
    links: {
      github: "https://github.com/aryan-dani/Dicom-Classifier",
    },
  },
  {
    id: 7,
    title: "API Demonstration Application",
    category: "web-dev",
    year: "2025",
    description: `Sometimes projects aren't just about showing off skills-they're about satisfying pure curiosity! I used this project as a hands-on experiment to finally understand client-side APIs. I built simple projects that call three different API endpoints, which helped me see how requests, responses, and asynchronous flows all come together in real time.`,
    image: "/Images/Projects/API_Demonstration.jpg",
    tags: ["Axios", "Javascript", "API Development", "Github Copilot"],
    skillIds: ["javascript", "nodejs", "mongodb", "rest-api", "html5", "css3", "git"],
    links: {
      preview: "https://aryan-dani.github.io/API_Demonstration/",
      github: "https://github.com/aryan-dani/API_Demonstration",
    },
  },
  {
    id: 8,
    title: "Speech-to-Text Web Application",
    category: "web-dev",
    year: "2024",
    description: `A real-time speech-to-text web application that leverages the browser's native Web Speech API to convert spoken words into text. This project features voice command controls, real-time transcription, text editing capabilities, and export functionality.`,
    image: "/Images/Projects/Speech_To_Text.jpg",
    tags: [
      "JavaScript",
      "Web Speech API",
      "HTML5",
      "CSS3",
      "Speech Recognition",
    ],
    skillIds: ["javascript", "html5", "css3"],
    links: {
      github: "https://github.com/aryan-dani/Speech_To_Text",
    },
  },
  {
    id: 9,
    title: "Capstone Data Science",
    category: "ai-ml",
    year: "2025",
    description: `This capstone project showcases my ability to address real-world challenges through data-driven solutions. Using Python and essential libraries like NumPy, Pandas, and Scikit-learn, I analyzed a complex dataset to uncover actionable insights and develop predictive models.`,
    image: "/Images/Projects/Data_Sceince_Capstone.jpg",
    tags: [
      "Exploratory Data Analysis (EDA)",
      "Machine Learning",
      "Data Visualization",
    ],
    skillIds: ["python", "scikit-learn", "tensorflow", "data-analysis"],
    links: {
      github: "https://github.com/aryan-dani/Capstone_ds",
    },
  },
];

const splitDescriptionSentences = (description = "") =>
  description
    .match(/[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g)
    ?.map((sentence) => sentence.trim())
    .filter(Boolean) || [];

const buildProjectDetailSections = (project) => {
  if (project.detailSections?.length) {
    return project.detailSections;
  }

  const explicitSections = [
    project.problem && { title: "Problem", body: project.problem },
    project.solution && { title: "Solution", body: project.solution },
    project.architecture && { title: "Architecture", body: project.architecture },
    project.results && { title: "Results", body: project.results },
  ].filter(Boolean);

  if (explicitSections.length) {
    return explicitSections;
  }

  const [focus, ...supportingDetails] = splitDescriptionSentences(project.description);
  const sections = [];

  if (focus) {
    sections.push({ title: "Focus", body: focus });
  }

  const featureDetails = supportingDetails.slice(0, 2).join(" ");
  if (featureDetails && featureDetails !== focus) {
    sections.push({ title: "Key Details", body: featureDetails });
  }

  if (project.tags?.length) {
    sections.push({
      title: "Stack Signal",
      body: project.tags.slice(0, 5).join(" / "),
    });
  }

  return sections;
};

export const projects = projectEntries.map((project) => ({
  ...project,
  imageAlt:
    project.imageAlt ||
    `${project.title} project screenshot from Aryan Dani's ${project.category === "ai-ml" ? "AI and machine learning" : "full-stack web development"} portfolio`,
  detailSections: buildProjectDetailSections(project),
}));

export const projectCategories = [
  { id: "all", label: "All" },
  { id: "web-dev", label: "Web Dev" },
  { id: "ai-ml", label: "AI & ML" },
];

// Helper: Get a project by ID
export function getProjectById(projectId) {
  return projects.find((p) => p.id === projectId) || null;
}

// Helper: Get projects that use a specific skill
export function getProjectsForSkill(skillId) {
  return projects.filter((p) => p.skillIds && p.skillIds.includes(skillId));
}
