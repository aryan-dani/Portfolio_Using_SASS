// Newest first: current role on top, then the trail backward.
export const experiences = [
  {
    id: 3,
    company: "ProvaanTech",
    companyUrl: "https://provaantech.com/",
    logo: "/Images/Jobs/ProvaanTech.png",
    position: "AI/ML Intern",
    period: "June 2026 - Present",
    location: "Remote",
    current: true,
    links: [],
    technologies: [
      "Python",
      "Machine Learning",
      "Deep Learning",
      "Research",
      "Applied AI",
    ],
    responsibilities: [
      "Selected as an AI/ML intern to work on real-world client and product problems from day one, with assignments aligned to Artificial Intelligence and Machine Learning.",
      "Report to Mr. Sanjay Soni on a remote 4-hour daily cadence focused on self-learning, research, and practical implementation rather than classroom-scale exercises.",
      "Building and iterating on applied AI/ML systems, with project links added as work is cleared to share.",
    ],
  },
  {
    id: 2,
    company: "MIT-WPU (AI Capstone Dev)",
    companyUrl: "https://mitwpu.edu.in/",
    logo: "/Images/Jobs/MIT_WPU.png",
    position: "Autonomous Systems Lead / ML Developer",
    period: "June - Dec 2025",
    location: "Pune, India",
    links: [
      { name: "Real-Time Threat Detection pipeline", url: "https://github.com/aryan-dani/Threat_Detection_System" },
      { name: "PosePro CV Motion Analyzer", url: "https://github.com/aryan-dani/Pose_Pro" },
      { name: "Arbiter Autonomous Testing Agents", url: "https://github.com/aryan-dani/Arbiter" }
    ],
    technologies: [
      "Python / PyTorch",
      "YOLO v11",
      "MediaPipe",
      "OpenCV",
      "FastAPI",
      "LangGraph",
      "Docker"
    ],
    responsibilities: [
      "Architected and implemented a <a href='https://github.com/aryan-dani/Threat_Detection_System' target='_blank' rel='noopener noreferrer' class='underline decoration-4 underline-offset-2 hover:bg-[var(--color-outline)] hover:text-[var(--color-surface)] transition-colors'>Real-Time Threat Detection pipeline</a> (Capstone Project) integrating YOLO v11 and EfficientNetV2, achieving high-accuracy detection of weapon profiles in streaming surveillance feeds and security scanner screens.",
      "Developed '<a href='https://github.com/aryan-dani/Pose_Pro' target='_blank' rel='noopener noreferrer' class='underline decoration-4 underline-offset-2 hover:bg-[var(--color-outline)] hover:text-[var(--color-surface)] transition-colors'>PosePro</a>', a custom computer vision motion analyzer utilizing MediaPipe pose estimation to track joint angles, calculate symmetry, and provide instant visual feedback on shoulder raises under 25ms.",
      "Designed and tested autonomous testing agents (<a href='https://github.com/aryan-dani/Arbiter' target='_blank' rel='noopener noreferrer' class='underline decoration-4 underline-offset-2 hover:bg-[var(--color-outline)] hover:text-[var(--color-surface)] transition-colors'>Arbiter</a>) utilizing Gemini models and LangGraph state machines to detect, isolate, and debug repository errors in containerized Docker sandboxes.",
      "Authored custom FastAPI REST endpoints to stream real-time prediction metrics via Server-Sent Events (SSE), supporting multiple high-traffic client requests."
    ],
  },
  {
    id: 1,
    company: "Artem HealthTech Pvt. Ltd.",
    companyUrl: "https://artemhealthtech.com/",
    logo: "/Images/Jobs/Artem_Health.png",
    position: "Intern (AI Engineer)",
    period: "Jan - May 2025",
    location: "Pune, India",
    links: [
      { name: "Speech to Text Voice Translation", url: "https://github.com/aryan-dani/Speech_To_Text" }
    ],
    technologies: [
      "Convolutional Neural Networks",
      "Vision Language Models",
      "Angular.js",
      "HMIS Framework",
      "WebSockets",
      "Python / PyTorch"
    ],
    responsibilities: [
      "Engineered and deployed an automated diagnostic pipeline using Convolutional Neural Networks (CNNs) and Vision Language Models (VLMs) to classify and extract anomaly descriptions in DICOM slices, reducing manual analysis time for radiologist workflows.",
      "Developed a low-latency '<a href='https://github.com/aryan-dani/Speech_To_Text' target='_blank' rel='noopener noreferrer' class='underline decoration-4 underline-offset-2 hover:bg-black hover:text-white transition-colors'>Speech to Text</a>' voice translation service using Angular.js, HTML5 Speech Recognition API, and WebSockets to facilitate hands-free data logging.",
      "Collaborated with cross-functional healthcare product squads to refine large model parameters, improving token inference times by 30% and optimizing platform rendering speed.",
      "Integrated secure authentication protocols and medical record database adapters, ensuring full compliance with health information privacy standards."
    ],
  },
];

export const socialLinks = [
  {
    name: "LinkedIn",
    url: "https://www.linkedin.com/in/aryandani/",
    icon: "FaLinkedin",
  },
  {
    name: "Instagram",
    url: "https://www.instagram.com/aryandani_06/?hl=en",
    icon: "FaInstagram",
  },
  {
    name: "GitHub",
    url: "https://github.com/aryan-dani",
    icon: "FaGithub",
  },
  {
    name: "Email",
    url: "mailto:daniaryan212@gmail.com",
    icon: "FaEnvelope",
  },
];

export const aboutInfo = {
  name: "Aryan Dani",
  title: "Tech Enthusiast, Web Developer and AI Engineer",
  tagline: "Building the future, one line of code at a time.",
  email: "daniaryan212@gmail.com",
  resumeUrl: "/resume.pdf",
  bio: `Hey, I'm Aryan Dani - a full-stack developer and AI engineer who builds sharp web products and agentic systems that actually ship. I am currently an AI/ML intern at ProvaanTech. Earlier work includes healthcare AI at Artem HealthTech and a computer-vision capstone at MIT-WPU.

When I'm not wrangling CSS or LangGraph state machines, you'll find me deep in anime like Haikyu!! or experimenting with the next Gemini release. I'm also a Google Student Ambassador and a proud tea person (chai > coffee, always).

Future goals? Build products that feel as polished as the best creator-tech channels - but with more AI magic and fewer buzzwords. Let's connect and build something epic.`,
  highlights: [
    {
      icon: "🚀",
      title: "Quick Learner",
      description:
        "Constantly exploring new technologies and frameworks to stay ahead in the tech world.",
    },
    {
      icon: "🤖",
      title: "Agentic AI",
      description:
        "Building multi-agent systems with Gemini, LangGraph, and RAG - from interview coaches to CI/CD healers.",
    },
    {
      icon: "🤝",
      title: "Team Player",
      description:
        "Experienced in collaborating with cross-functional teams to deliver impactful projects.",
    },
    {
      icon: "🎓",
      title: "Google Ambassador",
      description:
        "Google Student Ambassador (Dec 2025) - community outreach and technical advocacy for Gemini and AI.",
    },
  ],
};
