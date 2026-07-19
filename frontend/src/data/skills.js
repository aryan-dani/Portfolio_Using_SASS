// Every skill has a unique `id` used for cross-linking with projects.
// `projectIds` reference the `id` field in projects.js for bidirectional linking.

export const skills = {
  webdev: [
    {
      id: "html5",
      name: "HTML5",
      icon: "FaHtml5",
      level: 82,
      description:
        "Semantic HTML5 markup, accessibility standards, and modern web structure used across every web project - from SPAs to static pages.",
      projectIds: [1, 7, 8, 12, 13, 14, 16],
    },
    {
      id: "css3",
      name: "CSS3",
      icon: "FaCss3Alt",
      level: 78,
      description:
        "Advanced CSS animations, Grid/Flexbox layouts, and responsive design. Styled the portfolio's neo-brutalist design system from scratch.",
      projectIds: [1, 7, 8, 12, 13, 14, 16],
    },
    {
      id: "sass",
      name: "SASS/SCSS",
      icon: "FaSass",
      level: 62,
      description:
        "Modular, maintainable CSS with variables, mixins, nesting, and inheritance - primarily used for this portfolio's component styles.",
      projectIds: [1, 7, 8, 12, 13, 14],
    },
    {
      id: "javascript",
      name: "JavaScript",
      icon: "FaJs",
      level: 72,
      description:
        "Core language across all web projects. ES6+ features, async/await, DOM manipulation, and event-driven architecture.",
      projectIds: [1, 7, 8, 12, 13, 14, 16],
    },
    {
      id: "typescript",
      name: "TypeScript",
      icon: "SiTypescript",
      level: 65,
      description:
        "Type-safe development with interfaces, generics, and strict typing. Used in production apps including The Fourth Clover, North-Star, and Samiksha.",
      projectIds: [1, 4, 13, 16],
    },
    {
      id: "react",
      name: "React",
      icon: "FaReact",
      level: 70,
      description:
        "Primary frontend framework - hooks, context API, component architecture, and state management used across 7+ production projects.",
      projectIds: [1, 2, 4, 10, 11, 12, 13, 14, 16],
    },
    {
      id: "nextjs",
      name: "Next.js",
      icon: "SiNextdotjs",
      level: 64,
      description:
        "Full-stack React framework with App Router, server components, API routes, and SSR. Powers The Fourth Clover, Utility, and The Shadow Instructor.",
      projectIds: [1, 10, 13],
    },
    {
      id: "angular",
      name: "Angular",
      icon: "FaAngular",
      level: 38,
      description:
        "Component-based SPAs with Angular - services, routing, and reactive forms. Used for the Threat Detection System frontend.",
      projectIds: [5],
    },
    {
      id: "vite",
      name: "Vite",
      icon: "SiVite",
      level: 65,
      description:
        "Modern build tool for lightning-fast HMR and optimized production builds. Powers this portfolio, Democrazy, Ishani, and Samiksha.",
      projectIds: [12, 14, 16],
    },
    {
      id: "tailwind",
      name: "Tailwind CSS",
      icon: "SiTailwindcss",
      level: 68,
      description:
        "Utility-first CSS framework for rapid UI development. Used across The Fourth Clover, Utility, and several AI project frontends.",
      projectIds: [1, 13],
    },
    {
      id: "nodejs",
      name: "Node.js",
      icon: "FaNodeJs",
      level: 58,
      description:
        "Server-side JavaScript runtime for building APIs, handling file I/O, and serverless functions.",
      projectIds: [7, 12],
    },
    {
      id: "fastapi",
      name: "FastAPI",
      icon: "SiFastapi",
      level: 68,
      description:
        "High-performance async Python APIs with auto-generated OpenAPI docs. Backend for DebateBot, North-Star, Shadow Instructor, Arbiter, and Ishani.",
      projectIds: [2, 4, 10, 11, 14],
    },
    {
      id: "flask",
      name: "Flask",
      icon: "SiFlask",
      level: 52,
      description:
        "Lightweight Python web framework for building REST APIs. Powers PosePro's real-time pose analysis backend.",
      projectIds: [3],
    },
    {
      id: "supabase",
      name: "Supabase",
      icon: "SiSupabase",
      level: 58,
      description:
        "Open-source Firebase alternative - PostgreSQL database, auth, row-level security, and storage. Used in The Fourth Clover and Utility.",
      projectIds: [1, 13],
    },
    {
      id: "firebase",
      name: "Firebase",
      icon: "SiFirebase",
      level: 48,
      description:
        "Google's app platform for auth (Google Sign-In) and Firestore real-time database. Powers Democrazy's progress tracking.",
      projectIds: [12],
    },
    {
      id: "mongodb",
      name: "MongoDB",
      icon: "SiMongodb",
      level: 55,
      description:
        "NoSQL document database for flexible data modeling. Used with MongoDB Atlas cloud hosting in the API Demonstration project.",
      projectIds: [7],
    },
    {
      id: "websockets",
      name: "WebSockets",
      icon: "FaServer",
      level: 58,
      description:
        "Real-time bidirectional communication for live streaming, chat, and training updates. Used in Shadow Instructor and North-Star.",
      projectIds: [4, 10],
    },
    {
      id: "rest-api",
      name: "REST API Design",
      icon: "FaServer",
      level: 72,
      description:
        "Designing RESTful APIs with proper status codes, authentication, pagination, and OpenAPI documentation across multiple backend projects.",
      projectIds: [2, 3, 4, 7, 14],
    },
  ],
  machinelearning: [
    {
      id: "python",
      name: "Python",
      icon: "FaPython",
      level: 74,
      description:
        "Core language for AI/ML, backend development, and data science. Used across 8+ projects for everything from FastAPI backends to deep learning pipelines.",
      projectIds: [2, 3, 4, 5, 6, 9, 10, 11, 14],
    },
    {
      id: "llms",
      name: "LLMs & Agentic AI",
      icon: "FaRobot",
      level: 80,
      description:
        "Building sophisticated agentic workflows using Gemini 3.0/2.5, LLaMA 3.3 70B, and Groq. Prompt engineering, tool-calling, and multi-turn conversation design.",
      projectIds: [2, 10, 11, 12, 14],
    },
    {
      id: "agentic",
      name: "Agentic Architectures",
      icon: "FaBrain",
      level: 72,
      description:
        "Designing Dual-Agent and Multi-Agent state machines - interview simulation (Shadow Instructor) and autonomous CI/CD healing (Arbiter).",
      projectIds: [10, 11],
    },
    {
      id: "langgraph",
      name: "LangGraph",
      icon: "FaBrain",
      level: 62,
      description:
        "Building stateful, multi-step AI agent graphs with branching logic, tool nodes, and conditional edges for DebateBot and Arbiter.",
      projectIds: [2, 11],
    },
    {
      id: "prompt-engineering",
      name: "Prompt Engineering",
      icon: "FaRobot",
      level: 75,
      description:
        "Crafting system prompts, few-shot examples, chain-of-thought reasoning, and structured output schemas across all AI projects.",
      projectIds: [2, 10, 11, 12, 14],
    },
    {
      id: "rag",
      name: "RAG",
      icon: "FaBrain",
      level: 58,
      description:
        "Retrieval-Augmented Generation for grounding LLM responses in domain-specific documents. Parallel indexing engine in Utility and RAG chat in Ishani.",
      projectIds: [13, 14],
    },
    {
      id: "scikit-learn",
      name: "Scikit-Learn",
      icon: "SiScikitlearn",
      level: 60,
      description:
        "Traditional ML algorithms - Random Forest, SVM, model evaluation, and preprocessing pipelines. Achieved 76% accuracy on NASA Kepler data.",
      projectIds: [4, 9],
    },
    {
      id: "tensorflow",
      name: "TensorFlow",
      icon: "SiTensorflow",
      level: 48,
      description:
        "Building and deploying CNN and Vision Transformer models for medical image classification and anomaly detection.",
      projectIds: [6, 9],
    },
    {
      id: "pytorch",
      name: "PyTorch",
      icon: "SiPytorch",
      level: 45,
      description:
        "Neural network training for object detection models. Used for YOLO v11 fine-tuning in the Threat Detection System.",
      projectIds: [5],
    },
    {
      id: "deep-learning",
      name: "Deep Learning",
      icon: "FaBrain",
      level: 48,
      description:
        "CNNs, Vision Transformers, EfficientNetV2, and YOLO architectures for image classification, object detection, and medical imaging.",
      projectIds: [5, 6],
    },
    {
      id: "opencv",
      name: "OpenCV",
      icon: "SiOpencv",
      level: 55,
      description:
        "Computer vision library for image processing, video analysis, and real-time frame manipulation in PosePro and Threat Detection.",
      projectIds: [3, 5],
    },
    {
      id: "mediapipe",
      name: "MediaPipe",
      icon: "FaBrain",
      level: 52,
      description:
        "Google's perception framework for real-time pose detection, landmark tracking, and angle computation in PosePro.",
      projectIds: [3],
    },
    {
      id: "computer-vision",
      name: "Computer Vision",
      icon: "FaEye",
      level: 52,
      description:
        "Image classification, object detection (YOLO), pose estimation (MediaPipe), DICOM analysis, and real-time video processing.",
      projectIds: [3, 5, 6],
    },
    {
      id: "data-analysis",
      name: "Data Analysis",
      icon: "FaChartLine",
      level: 58,
      description:
        "Exploratory data analysis, statistical modeling, and visualization with Pandas, NumPy, Matplotlib, and Seaborn.",
      projectIds: [4, 9],
    },
  ],
  devops: [
    {
      id: "docker",
      name: "Docker",
      icon: "SiDocker",
      level: 55,
      description:
        "Containerized execution environments for secure, isolated testing of untrusted code in Arbiter's CI/CD healing pipeline.",
      projectIds: [11],
    },
    {
      id: "git",
      name: "Git & GitHub",
      icon: "FaGitAlt",
      level: 78,
      description:
        "Version control, branching strategies, pull requests, and collaborative workflows. Every project lives on GitHub with proper commit history.",
      projectIds: [1, 2, 3, 4, 5, 7, 10, 11, 12, 13, 16],
    },
    {
      id: "vercel",
      name: "Vercel",
      icon: "SiVercel",
      level: 68,
      description:
        "Serverless deployment platform with preview deployments, edge functions, and analytics. Hosts 6+ live projects.",
      projectIds: [1, 10, 11, 12, 13, 16],
    },
    {
      id: "github-actions",
      name: "GitHub Actions",
      icon: "FaGitAlt",
      level: 50,
      description:
        "CI/CD pipeline automation - automated testing, builds, and deployment triggers. Core infrastructure for Arbiter's healing workflows.",
      projectIds: [11],
    },
    {
      id: "groq",
      name: "Groq",
      icon: "FaRobot",
      level: 45,
      description:
        "Ultra-fast LLM inference platform for real-time AI responses. Powers Ishani's AI assistant with sub-100ms latency.",
      projectIds: [14],
    },
  ],
};

export const skillCategories = [
  { id: "all", label: "All" },
  { id: "webdev", label: "Web Development" },
  { id: "machinelearning", label: "AI & ML" },
  { id: "devops", label: "DevOps & Tools" },
];

// Helper: Get a flat list of all skills
export function getAllSkills() {
  return Object.values(skills).flat();
}

// Helper: Find a skill by ID
export function getSkillById(skillId) {
  return getAllSkills().find((s) => s.id === skillId) || null;
}

// Helper: Get skills used by a project (by project ID)
export function getSkillsForProject(projectId) {
  return getAllSkills().filter((s) => s.projectIds.includes(projectId));
}

// Helper: Get the category label for a skill
export function getSkillCategory(skillId) {
  for (const [catId, catSkills] of Object.entries(skills)) {
    if (catSkills.some((s) => s.id === skillId)) {
      const cat = skillCategories.find((c) => c.id === catId);
      return cat ? cat.label : catId;
    }
  }
  return "";
}

// Helper: Get the category ID for a skill
export function getSkillCategoryId(skillId) {
  for (const [catId, catSkills] of Object.entries(skills)) {
    if (catSkills.some((s) => s.id === skillId)) {
      return catId;
    }
  }
  return "";
}
