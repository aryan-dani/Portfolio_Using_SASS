/**
 * Centralized SEO configuration for every route.
 * Each page gets a unique title, description, keywords, canonical URL,
 * and structured data to maximize search visibility.
 */

const SITE_URL = "https://www.aryandani.com";
const SITE_NAME = "Aryan Dani Portfolio";
const DEFAULT_IMAGE = `${SITE_URL}/og-image.svg`;
const TWITTER_HANDLE = "@Killfall15";
const DEFAULT_ROBOTS = "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
const DEFAULT_IMAGE_ALT = "Aryan Dani AI Engineer and Full Stack Developer portfolio preview";

export function routeOgImage(path) {
  const slug = path === "/" ? "home" : path.replace(/^\//, "").replace(/\//g, "-");
  return `${SITE_URL}/og-${slug}.svg`;
}

export const SEO_ROUTE_ORDER = [
  "/",
  "/projects",
  "/experience",
  "/certifications",
  "/skills",
  "/about",
  "/contact",
  "/playground",
  "/achievements",
  "/guestbook",
  "/copyright",
];

export const SEO_ROUTE_META = {
  "/": { label: "Home", priority: "1.0", changefreq: "weekly" },
  "/projects": { label: "Projects", priority: "0.95", changefreq: "weekly" },
  "/experience": { label: "Experience", priority: "0.85", changefreq: "monthly" },
  "/certifications": { label: "Certifications", priority: "0.75", changefreq: "monthly" },
  "/skills": { label: "Skills", priority: "0.85", changefreq: "monthly" },
  "/about": { label: "About", priority: "0.9", changefreq: "monthly" },
  "/contact": { label: "Contact", priority: "0.7", changefreq: "yearly" },
  "/playground": { label: "CLI Playground", priority: "0.55", changefreq: "yearly" },
  "/achievements": { label: "Achievements", priority: "0.45", changefreq: "monthly" },
  "/guestbook": { label: "Guestbook", priority: "0.5", changefreq: "weekly" },
  "/copyright": { label: "Copyright", priority: "0.25", changefreq: "yearly" },
};

/** Shared Person schema reference (defined once in index.html) */
const PERSON_REF = { "@id": `${SITE_URL}/#person` };
const WEBSITE_REF = { "@id": `${SITE_URL}/#website` };

/**
 * Build a BreadcrumbList JSON-LD for a given page.
 * Every page gets Home → Current Page.
 */
function buildBreadcrumbs(pageName, pagePath) {
  const items = [
    {
      "@type": "ListItem",
      position: 1,
      name: "Home",
      item: SITE_URL,
    },
  ];

  if (pagePath !== "/") {
    items.push({
      "@type": "ListItem",
      position: 2,
      name: pageName,
      item: `${SITE_URL}${pagePath}`,
    });
  }

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items,
  };
}

/**
 * Build a WebPage JSON-LD for a given page.
 */
function buildWebPage(name, description, path) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    isPartOf: WEBSITE_REF,
    about: PERSON_REF,
    inLanguage: "en-US",
  };
}

function softwareApplicationFromProject(project) {
  return {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "@id": `${SITE_URL}/projects#${project.id}`,
    name: project.title,
    description: project.description,
    applicationCategory: project.category === "ai-ml" ? "AIApplication" : "WebApplication",
    operatingSystem: "Web",
    url: project.links?.preview || `${SITE_URL}/projects?highlight=${project.id}`,
    codeRepository: project.links?.github,
    creator: PERSON_REF,
    author: PERSON_REF,
    dateCreated: project.year,
    keywords: project.tags?.join(", "),
    image: project.image ? `${SITE_URL}${project.image}` : DEFAULT_IMAGE,
  };
}

export function buildBaseSchemas() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "Person",
      "@id": `${SITE_URL}/#person`,
      name: "Aryan Dani",
      givenName: "Aryan",
      familyName: "Dani",
      url: `${SITE_URL}/`,
      image: `${SITE_URL}/Images/About/pic_1.jpg`,
      jobTitle: "AI Engineer & Full Stack Developer",
      description:
        "AI Engineer and Full Stack Developer specializing in Machine Learning, Computer Vision, Generative AI, LLMs, RAG systems, React, Angular, Python, and Next.js. MIT-WPU student based in Pune, India.",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Pune",
        addressRegion: "Maharashtra",
        addressCountry: "IN",
      },
      alumniOf: {
        "@type": "CollegeOrUniversity",
        name: "MIT World Peace University",
        alternateName: "MIT-WPU",
        url: "https://mitwpu.edu.in/",
      },
      knowsAbout: [
        "Artificial Intelligence",
        "Machine Learning",
        "Computer Vision",
        "Generative AI",
        "Large Language Models",
        "Retrieval-Augmented Generation",
        "Vector Databases",
        "Full Stack Development",
        "React",
        "Angular",
        "Python",
        "FastAPI",
      ],
      sameAs: [
        "https://www.linkedin.com/in/aryandani/",
        "https://github.com/aryan-dani",
        "https://x.com/Killfall15",
        "https://www.instagram.com/aryandani_06/",
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: `${SITE_URL}/`,
      name: SITE_NAME,
      publisher: PERSON_REF,
      inLanguage: "en-US",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/projects?search={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "ProfilePage",
      "@id": `${SITE_URL}/#profilepage`,
      url: `${SITE_URL}/`,
      name: "Aryan Dani - AI Engineer & Full Stack Developer Portfolio",
      isPartOf: WEBSITE_REF,
      about: PERSON_REF,
      mainEntity: PERSON_REF,
      inLanguage: "en-US",
    },
  ];
}

/**
 * SEO configuration per route.
 */
export const SEO_CONFIG = {
  "/": {
    title: "Aryan Dani - AI Engineer & Full Stack Developer Portfolio",
    description:
      "Portfolio of Aryan Dani - AI Engineer and Full Stack Developer specializing in Machine Learning, Computer Vision, Generative AI, LLMs, RAG, React, Angular, Python, and Next.js. Explore projects, skills, and experience.",
    keywords:
      "Aryan Dani, AI Engineer, Full Stack Developer, Machine Learning, Computer Vision, Generative AI, LLMs, RAG, React, Python, Portfolio",
    canonical: `${SITE_URL}/`,
    robots: DEFAULT_ROBOTS,
    imageAlt: DEFAULT_IMAGE_ALT,
    priority: SEO_ROUTE_META["/"].priority,
    changefreq: SEO_ROUTE_META["/"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Home", "/"),
        buildWebPage(
          "Aryan Dani - AI Engineer & Full Stack Developer Portfolio",
          "Portfolio of Aryan Dani - AI Engineer and Full Stack Developer specializing in Machine Learning, Computer Vision, Generative AI, LLMs, RAG, React, Angular, Python, and Next.js.",
          "/"
        ),
      ];

      // ItemList for featured projects (if provided)
      if (extraData?.projects) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Featured Projects by Aryan Dani",
          itemListOrder: "https://schema.org/ItemListUnordered",
          numberOfItems: extraData.projects.length,
          itemListElement: extraData.projects.slice(0, 6).map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: `${SITE_URL}/projects?highlight=${p.id}`,
          })),
        });
      }

      return schemas;
    },
  },

  "/projects": {
    title: "Projects - Aryan Dani | AI & Web Development Portfolio",
    description:
      "Explore Aryan Dani's portfolio of AI and web development projects including Computer Vision systems, LLM-powered applications, full-stack web apps with React, Next.js, FastAPI, and more.",
    keywords:
      "AI portfolio, Machine Learning portfolio, Computer Vision projects, web development projects, React projects, Python projects, Generative AI portfolio",
    canonical: `${SITE_URL}/projects`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani AI, machine learning, and full-stack development projects",
    priority: SEO_ROUTE_META["/projects"].priority,
    changefreq: SEO_ROUTE_META["/projects"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Projects", "/projects"),
        buildWebPage(
          "Projects - Aryan Dani | AI & Web Development Portfolio",
          "Explore Aryan Dani's portfolio of AI and web development projects.",
          "/projects"
        ),
      ];

      if (extraData?.projects) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          "@id": `${SITE_URL}/projects#collectionpage`,
          name: "Projects by Aryan Dani",
          url: `${SITE_URL}/projects`,
          description: "A collection of AI, Machine Learning, and Web Development projects.",
          about: PERSON_REF,
          mainEntity: {
            "@type": "ItemList",
            name: "All Projects",
            numberOfItems: extraData.projects.length,
            itemListElement: extraData.projects.map((p, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: p.title,
              description: p.description,
              url: p.links?.preview || p.links?.github || `${SITE_URL}/projects?highlight=${p.id}`,
            })),
          },
        });
        schemas.push(...extraData.projects.slice(0, 8).map(softwareApplicationFromProject));
      }

      return schemas;
    },
  },

  "/experience": {
    title: "Experience - Aryan Dani | AI Engineer & Web Developer",
    description:
      "Professional experience of Aryan Dani as an AI Engineer and Full Stack Developer. Includes work at Artem HealthTech, MIT-WPU AI Capstone, and freelance web development projects.",
    keywords:
      "Aryan Dani experience, AI Engineer Pune, MIT WPU AI student, web developer experience, machine learning engineer",
    canonical: `${SITE_URL}/experience`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani professional AI engineer and web developer experience",
    priority: SEO_ROUTE_META["/experience"].priority,
    changefreq: SEO_ROUTE_META["/experience"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Experience", "/experience"),
        buildWebPage(
          "Experience - Aryan Dani | AI Engineer & Web Developer",
          "Professional experience of Aryan Dani as an AI Engineer and Full Stack Developer.",
          "/experience"
        ),
      ];

      if (extraData?.experiences) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Aryan Dani Professional Experience",
          description: "Timeline of professional roles and achievements",
          numberOfItems: extraData.experiences.length,
          itemListElement: extraData.experiences.map((exp, i) => {
            const periodParts = exp.period.split(" - ");
            return {
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "OrganizationRole",
                roleName: exp.position,
                startDate: periodParts[0] || "",
                endDate: periodParts[1] || "",
                worksFor: {
                  "@type": "Organization",
                  name: exp.company,
                  url: exp.companyUrl,
                  location: exp.location || ""
                }
              }
            };
          })
        });
      }

      return schemas;
    },
  },

  "/certifications": {
    title: "Certifications - Aryan Dani | AI & Cloud Credentials",
    description:
      "Industry-recognized certifications earned by Aryan Dani across AI, cloud computing, web development, and data science from Google, IBM, Meta, and more.",
    keywords:
      "Aryan Dani certifications, AI certifications, cloud certifications, Google certifications, developer credentials",
    canonical: `${SITE_URL}/certifications`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani AI cloud web development and data science certifications",
    priority: SEO_ROUTE_META["/certifications"].priority,
    changefreq: SEO_ROUTE_META["/certifications"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Certifications", "/certifications"),
        buildWebPage(
          "Certifications - Aryan Dani | AI & Cloud Credentials",
          "Industry-recognized certifications earned by Aryan Dani.",
          "/certifications"
        ),
      ];

      if (extraData?.certifications) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Aryan Dani Technical Certifications",
          description: "List of technical certifications and professional credentials",
          numberOfItems: extraData.certifications.length,
          itemListElement: extraData.certifications.map((cert, i) => ({
            "@type": "ListItem",
            position: i + 1,
            item: {
              "@type": "EducationalOccupationalCredential",
              name: cert.title,
              credentialCategory: cert.tag || "Certification",
              recognizedBy: {
                "@type": "Organization",
                name: cert.issuer,
                logo: cert.issuerLogo
              },
              url: cert.link !== "#" ? cert.link : `${SITE_URL}/certifications`
            }
          }))
        });
      }

      return schemas;
    },
  },

  "/skills": {
    title: "Skills & Tools - Aryan Dani | Tech Stack & Expertise",
    description:
      "Complete technical skill set of Aryan Dani including Python, React, Angular, Next.js, TensorFlow, PyTorch, Computer Vision, Generative AI, LLMs, RAG, Docker, and 30+ technologies.",
    keywords:
      "Python developer, Angular developer, React developer, Generative AI, LLMs, RAG, Vector Database, Computer Vision, Full Stack Developer",
    canonical: `${SITE_URL}/skills`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Aryan Dani technical skills in AI machine learning web development and Python",
    priority: SEO_ROUTE_META["/skills"].priority,
    changefreq: SEO_ROUTE_META["/skills"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Skills & Tools", "/skills"),
      buildWebPage(
        "Skills & Tools - Aryan Dani | Tech Stack & Expertise",
        "Complete technical skill set of Aryan Dani including Python, React, Angular, Next.js, and 30+ technologies.",
        "/skills"
      ),
    ],
  },

  "/about": {
    title: "About Aryan Dani - AI Engineer, Full Stack Developer, Pune",
    description:
      "Learn about Aryan Dani - an AI Engineer and Full Stack Developer from Pune, India. MIT-WPU student specializing in Machine Learning, Computer Vision, Generative AI, and modern web development.",
    keywords:
      "Aryan Dani, Aryan Dani developer, Aryan Dani AI, AI Engineer Pune, MIT WPU AI student, Full Stack Developer India",
    canonical: `${SITE_URL}/about`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "About Aryan Dani AI Engineer Full Stack Developer from Pune and MIT-WPU",
    priority: SEO_ROUTE_META["/about"].priority,
    changefreq: SEO_ROUTE_META["/about"].changefreq,
    ogType: "profile",
    schemas: () => [
      buildBreadcrumbs("About", "/about"),
      buildWebPage(
        "About Aryan Dani - AI Engineer, Full Stack Developer, Pune",
        "Learn about Aryan Dani - an AI Engineer and Full Stack Developer from Pune, India.",
        "/about"
      ),
    ],
  },

  "/contact": {
    title: "Contact Aryan Dani - Hire an AI Engineer & Web Developer",
    description:
      "Get in touch with Aryan Dani for freelance projects, job opportunities, collaborations, or open source contributions. AI Engineer and Full Stack Developer available for hire.",
    keywords:
      "hire Aryan Dani, contact developer, freelance AI engineer, hire web developer, collaboration",
    canonical: `${SITE_URL}/contact`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Contact Aryan Dani for AI engineering web development and collaboration",
    priority: SEO_ROUTE_META["/contact"].priority,
    changefreq: SEO_ROUTE_META["/contact"].changefreq,
    ogType: "website",
    schemas: (extraData) => {
      const schemas = [
        buildBreadcrumbs("Contact", "/contact"),
        buildWebPage(
          "Contact Aryan Dani - Hire an AI Engineer & Web Developer",
          "Get in touch with Aryan Dani for freelance projects, collaborations, or job opportunities.",
          "/contact"
        ),
      ];

      // FAQ structured data from the contact page
      if (extraData?.faqItems) {
        schemas.push({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: extraData.faqItems.map((faq) => ({
            "@type": "Question",
            name: faq.q,
            acceptedAnswer: {
              "@type": "Answer",
              text: faq.a,
            },
          })),
        });
      }

      return schemas;
    },
  },

  "/playground": {
    title: "CLI Playground - Aryan Dani Portfolio | Interactive Terminal",
    description:
      "Explore Aryan Dani's portfolio through an interactive command-line interface. Query projects, list skills, navigate pages, and discover features using terminal commands.",
    keywords:
      "interactive portfolio, CLI portfolio, developer terminal, Aryan Dani playground",
    canonical: `${SITE_URL}/playground`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Interactive CLI playground for Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/playground"].priority,
    changefreq: SEO_ROUTE_META["/playground"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("CLI Playground", "/playground"),
      buildWebPage(
        "CLI Playground - Aryan Dani Portfolio | Interactive Terminal",
        "Explore Aryan Dani's portfolio through an interactive command-line interface.",
        "/playground"
      ),
    ],
  },

  "/achievements": {
    title: "Achievements - Aryan Dani Portfolio | Trophy Wall",
    description: "Unlock achievements by exploring Aryan Dani's portfolio - CLI commands, easter eggs, and hidden modes.",
    keywords: "portfolio achievements, gamified portfolio, Aryan Dani",
    canonical: `${SITE_URL}/achievements`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Achievement trophy wall on Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/achievements"].priority,
    changefreq: SEO_ROUTE_META["/achievements"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Achievements", "/achievements"),
      buildWebPage("Achievements - Aryan Dani Portfolio", "Gamified trophy wall.", "/achievements"),
    ],
  },

  "/guestbook": {
    title: "Guestbook - Aryan Dani Portfolio | Sign The Wall",
    description: "Leave a message on Aryan Dani's portfolio guestbook wall.",
    keywords: "portfolio guestbook, Aryan Dani",
    canonical: `${SITE_URL}/guestbook`,
    robots: DEFAULT_ROBOTS,
    imageAlt: "Guestbook wall on Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/guestbook"].priority,
    changefreq: SEO_ROUTE_META["/guestbook"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Guestbook", "/guestbook"),
      buildWebPage("Guestbook - Aryan Dani Portfolio", "Sign the wall.", "/guestbook"),
    ],
  },

  "/copyright": {
    title: "Copyright & License - Aryan Dani Portfolio",
    description:
      "MIT License and copyright information for Aryan Dani's portfolio website. Open source portfolio template.",
    keywords: "Aryan Dani copyright, MIT License, portfolio license",
    canonical: `${SITE_URL}/copyright`,
    robots: "noindex, follow",
    imageAlt: "Copyright and license information for Aryan Dani portfolio",
    priority: SEO_ROUTE_META["/copyright"].priority,
    changefreq: SEO_ROUTE_META["/copyright"].changefreq,
    ogType: "website",
    schemas: () => [
      buildBreadcrumbs("Copyright", "/copyright"),
      buildWebPage(
        "Copyright & License - Aryan Dani Portfolio",
        "MIT License and copyright information for Aryan Dani's portfolio website.",
        "/copyright"
      ),
    ],
  },
  "/404": {
    title: "Page Not Found - Aryan Dani Portfolio",
    description:
      "The requested page could not be found. Return to Aryan Dani's AI Engineer and Full Stack Developer portfolio to explore projects, skills, experience, and contact details.",
    keywords: "Aryan Dani portfolio 404",
    canonical: `${SITE_URL}/404`,
    robots: "noindex, follow",
    imageAlt: DEFAULT_IMAGE_ALT,
    ogType: "website",
    schemas: () => [
      buildWebPage(
        "Page Not Found - Aryan Dani Portfolio",
        "The requested page could not be found.",
        "/404"
      ),
    ],
  },
};

/** Shared constants exported for use by the SEO hook */
export { SITE_URL, SITE_NAME, DEFAULT_IMAGE, TWITTER_HANDLE, DEFAULT_ROBOTS, DEFAULT_IMAGE_ALT };
