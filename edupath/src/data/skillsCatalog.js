/**
 * Comprehensive catalog of authoritative skills, tools, and frameworks.
 * Used for dynamic autocomplete suggestions and role recommendations.
 */

export const SKILLS_CATALOG = [
  // Programming & Scripting
  { name: "Python", category: "Core Programming" },
  { name: "JavaScript", category: "Core Programming" },
  { name: "TypeScript", category: "Core Programming" },
  { name: "SQL", category: "Data Storage" },
  { name: "Java", category: "Core Programming" },
  { name: "C++", category: "Core Programming" },
  { name: "C#", category: "Core Programming" },
  { name: "Go", category: "Core Programming" },
  { name: "Rust", category: "Core Programming" },
  { name: "Ruby", category: "Core Programming" },
  { name: "PHP", category: "Core Programming" },
  { name: "Swift", category: "Mobile Development" },
  { name: "Kotlin", category: "Mobile Development" },
  { name: "R", category: "Data & Analytics" },
  { name: "Bash / Shell", category: "DevOps & Tooling" },

  // Frontend & UI
  { name: "React", category: "UI Engineering" },
  { name: "Next.js", category: "UI Engineering" },
  { name: "Vue.js", category: "UI Engineering" },
  { name: "Angular", category: "UI Engineering" },
  { name: "Svelte", category: "UI Engineering" },
  { name: "HTML & CSS", category: "Web Fundamentals" },
  { name: "HTML5", category: "Web Fundamentals" },
  { name: "CSS3", category: "Web Fundamentals" },
  { name: "Tailwind CSS", category: "UI Engineering" },
  { name: "Redux", category: "UI Engineering" },
  { name: "Zustand", category: "UI Engineering" },
  { name: "Frontend System Design", category: "Architecture" },
  { name: "Webpack", category: "UI Engineering" },
  { name: "Vite", category: "UI Engineering" },
  { name: "GraphQL", category: "API Design" },
  { name: "REST APIs", category: "API Design" },

  // Backend & Systems
  { name: "Node.js", category: "Backend Engineering" },
  { name: "Express.js", category: "Backend Engineering" },
  { name: "FastAPI", category: "Backend Engineering" },
  { name: "Django", category: "Backend Engineering" },
  { name: "Flask", category: "Backend Engineering" },
  { name: "Spring Boot", category: "Backend Engineering" },
  { name: "NestJS", category: "Backend Engineering" },
  { name: "Ruby on Rails", category: "Backend Engineering" },
  { name: "System Design", category: "Architecture" },
  { name: "Microservices", category: "Architecture" },
  { name: "gRPC", category: "API Design" },

  // Databases & Storage
  { name: "PostgreSQL", category: "Data Storage" },
  { name: "MySQL", category: "Data Storage" },
  { name: "MongoDB", category: "Data Storage" },
  { name: "Redis", category: "Data Storage" },
  { name: "SQLite", category: "Data Storage" },
  { name: "Elasticsearch", category: "Data Storage" },
  { name: "Firebase", category: "Cloud & Backend" },
  { name: "Supabase", category: "Cloud & Backend" },
  { name: "Prisma", category: "Data Storage" },
  { name: "SQLAlchemy", category: "Data Storage" },

  // Data Science, AI & Machine Learning
  { name: "Machine Learning", category: "AI & ML" },
  { name: "Deep Learning", category: "AI & ML" },
  { name: "PyTorch", category: "AI & ML" },
  { name: "TensorFlow", category: "AI & ML" },
  { name: "Keras", category: "AI & ML" },
  { name: "Pandas", category: "Data Science" },
  { name: "NumPy", category: "Data Science" },
  { name: "Scikit-Learn", category: "AI & ML" },
  { name: "Statistics", category: "Analytical Reasoning" },
  { name: "Linear Algebra", category: "Mathematics" },
  { name: "MLOps", category: "AI & ML" },
  { name: "NLP", category: "AI & ML" },
  { name: "Computer Vision", category: "AI & ML" },
  { name: "Hugging Face", category: "AI & ML" },
  { name: "LangChain", category: "AI & ML" },

  // Data Analytics & Business Intelligence
  { name: "Excel", category: "Data Wrangling" },
  { name: "Power BI", category: "Business Intelligence" },
  { name: "Tableau", category: "Business Intelligence" },
  { name: "Data Storytelling", category: "Communication" },
  { name: "Apache Spark", category: "Big Data" },
  { name: "Snowflake", category: "Data Warehousing" },
  { name: "BigQuery", category: "Data Warehousing" },
  { name: "Airflow", category: "Data Engineering" },
  { name: "ETL Pipelines", category: "Data Engineering" },
  { name: "Looker", category: "Business Intelligence" },

  // Cloud & DevOps
  { name: "Docker", category: "DevOps & Containers" },
  { name: "Kubernetes", category: "DevOps & Containers" },
  { name: "AWS", category: "Cloud Infrastructure" },
  { name: "Google Cloud (GCP)", category: "Cloud Infrastructure" },
  { name: "Microsoft Azure", category: "Cloud Infrastructure" },
  { name: "CI/CD", category: "DevOps & Tooling" },
  { name: "GitHub Actions", category: "DevOps & Tooling" },
  { name: "Terraform", category: "Infrastructure as Code" },
  { name: "Linux", category: "Operating Systems" },
  { name: "Nginx", category: "Networking" },
  { name: "Prometheus", category: "Observability" },
  { name: "Grafana", category: "Observability" },

  // Tools & Testing
  { name: "Git", category: "Developer Tools" },
  { name: "GitHub", category: "Developer Tools" },
  { name: "GitLab", category: "Developer Tools" },
  { name: "Postman", category: "Developer Tools" },
  { name: "Jest", category: "Testing" },
  { name: "Cypress", category: "Testing" },
  { name: "Playwright", category: "Testing" },
  { name: "Figma", category: "Design Tools" },
  { name: "Jira", category: "Project Management" },
  { name: "Agile / Scrum", category: "Methodologies" },
];

/**
 * Recommended skills mapped by target role name.
 */
export const ROLE_RECOMMENDED_SKILLS = {
  "Data Analyst": [
    "Excel",
    "SQL",
    "Power BI",
    "Tableau",
    "Python",
    "Statistics",
    "Data Storytelling",
    "Pandas",
  ],
  "Frontend Developer": [
    "HTML & CSS",
    "JavaScript",
    "TypeScript",
    "React",
    "Tailwind CSS",
    "REST APIs",
    "Frontend System Design",
    "Git",
  ],
  "Full Stack Developer": [
    "JavaScript",
    "TypeScript",
    "React",
    "Node.js",
    "SQL",
    "PostgreSQL",
    "REST APIs",
    "Docker",
    "System Design",
  ],
  "Machine Learning Engineer": [
    "Python",
    "Machine Learning",
    "Deep Learning",
    "PyTorch",
    "TensorFlow",
    "Linear Algebra",
    "Pandas",
    "MLOps",
    "SQL",
  ],
  "DevOps Engineer": [
    "Docker",
    "Kubernetes",
    "Linux",
    "CI/CD",
    "AWS",
    "Terraform",
    "Bash / Shell",
    "Python",
    "Git",
  ],
  "Backend Developer": [
    "Python",
    "Node.js",
    "Go",
    "PostgreSQL",
    "Redis",
    "REST APIs",
    "Docker",
    "System Design",
    "Microservices",
  ],
};

/**
 * Filter dynamic suggestions based on active query, current selections, and role context.
 */
export function getSkillSuggestions({
  query = "",
  existingSkills = [],
  role = "",
  catalog = SKILLS_CATALOG,
  maxResults = 8,
}) {
  const cleanQuery = query.trim().toLowerCase();
  const normalizedExisting = new Set(
    existingSkills.map((s) => s.trim().toLowerCase())
  );

  // Filter out already added skills
  const available = catalog.filter(
    (item) => !normalizedExisting.has(item.name.toLowerCase())
  );

  if (!cleanQuery) {
    // If no query, return recommended skills for the target role first
    const roleSkills = ROLE_RECOMMENDED_SKILLS[role] || [];
    const recommendedList = available.filter((item) =>
      roleSkills.some((rs) => rs.toLowerCase() === item.name.toLowerCase())
    );

    // If role recommendations don't fill maxResults, append top popular skills
    if (recommendedList.length < maxResults) {
      const rest = available.filter(
        (item) => !recommendedList.some((r) => r.name.toLowerCase() === item.name.toLowerCase())
      );
      return [...recommendedList, ...rest].slice(0, maxResults);
    }
    return recommendedList.slice(0, maxResults);
  }

  // Exact prefix matches ranked highest, followed by substring matches
  const prefixMatches = [];
  const substringMatches = [];

  for (const item of available) {
    const itemNameLower = item.name.toLowerCase();
    if (itemNameLower.startsWith(cleanQuery)) {
      prefixMatches.push(item);
    } else if (itemNameLower.includes(cleanQuery)) {
      substringMatches.push(item);
    }
  }

  // Prioritize prefix matches, then substring matches
  const sorted = [...prefixMatches, ...substringMatches];
  return sorted.slice(0, maxResults);
}
